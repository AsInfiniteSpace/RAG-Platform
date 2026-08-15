from loguru import logger
from sqlalchemy.orm import Session
from arq.connections import RedisSettings
from app.core.logging import setup_logging
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.document import Document
from app.models.document_page import DocumentPage
from app.models.document_table import DocumentTable
from app.models.user import User
from app.services.extraction_service import extract_pdf_content
from app.models.document_chunk import DocumentChunk
from app.services.chunking_service import chunk_text, chunk_table
from app.services.extraction_service import extract_pdf_content, merge_continued_tables
from app.services.embedding_service import generate_embeddings_batch
from app.services.usage_service import check_token_quota, log_usage
from app.core.deps import get_current_user
from app.services.usage_service import is_within_token_quota

setup_logging()


async def process_document(ctx, document_id: str):
    db: Session = SessionLocal()
    document = None
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error(f"Document {document_id} not found")
            return

        logger.info(f"Processing document: {document.filename} ({document.document_type})")
        document.status = "processing"
        db.commit()

        if not document.file_path.lower().endswith(".pdf"):
            raise ValueError(f"Unsupported file type for extraction: {document.filename}")

        content = extract_pdf_content(document.file_path)
        merged_tables = merge_continued_tables(content["tables"])

        if not content["text_pages"] and not content["tables"]:
            raise ValueError("No extractable content found in document")

        for page_data in content["text_pages"]:
            db.add(DocumentPage(
                document_id=document.id,
                page_number=page_data["page_number"],
                text_content=page_data["text_content"],
            ))

        for table in merged_tables:
            db.add(DocumentTable(
                document_id=document.id,
                start_page=table["start_page"],
                end_page=table["end_page"],
                table_data=[r["row"] for r in table["tagged_rows"]],
            ))

        logger.info(
            f"Extracted {len(content['text_pages'])} text pages and "
            f"{len(content['tables'])} tables from {document.filename}"
        )

        # Chunking
        chunk_index = 0
        for page_data in content["text_pages"]:
            for chunk in chunk_text(page_data["text_content"], page_data["page_number"]):
                db.add(DocumentChunk(
                    document_id=document.id,
                    start_page=chunk["page_number"],
                    end_page=chunk["page_number"],
                    chunk_index=chunk_index,
                    content=chunk["content"],
                    chunk_type=chunk["chunk_type"],
                ))
                chunk_index += 1

        for table in merged_tables:
            for chunk in chunk_table(table["tagged_rows"]):
                db.add(DocumentChunk(
                    document_id=document.id,
                    start_page=chunk["start_page"],
                    end_page=chunk["end_page"],
                    data_start_page=chunk.get("data_start_page"),
                    data_end_page=chunk.get("data_end_page"),
                    chunk_index=chunk_index,
                    content=chunk["content"],
                    chunk_type=chunk["chunk_type"],
                ))
                chunk_index += 1

        logger.info(f"Created {chunk_index} chunks for {document.filename}")

        db.flush()  # ensure chunk IDs exist without a full commit yet
        all_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).all()
        texts = [c.content for c in all_chunks]

        owner = db.query(User).filter(User.id == document.owner_id).first()
        if not is_within_token_quota(db, document.owner_id, owner.tier):
            document.status = "quota_blocked"
            db.commit()
            logger.warning(f"Processing paused for {document.filename}: owner over monthly token quota")
            return

        embeddings, tokens_used_for_embedding = generate_embeddings_batch(texts)
        for chunk, embedding in zip(all_chunks, embeddings):
            chunk.embedding = embedding        
        
        log_usage(db, document.owner_id, "embedding", tokens_used_for_embedding, unit="tokens")
        
        document.status = "ready"
        db.commit()
        logger.info(f"Embedded {len(all_chunks)} chunks for {document.filename}")
        

    except Exception as e:
        logger.error(f"Failed to process document {document_id}: {e}")
        if document:
            document.status = "failed"
            db.commit()
    finally:
        db.close()


class WorkerSettings:
    functions = [process_document]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)