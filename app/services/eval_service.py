from sqlalchemy.orm import Session
from app.models.eval_question import EvalQuestion
from app.models.user import User
from app.services.retrieval_service import hybrid_search
from app.services.generation_service import generate_answer, build_context
from app.services.faithfulness_service import evaluate_faithfulness
from app.services.usage_service import check_token_quota, check_search_unit_quota, log_usage


def run_evaluation(db: Session, owner_id, top_k: int = 10, question_id=None) -> dict:

    current_user = db.query(User).filter(User.id == owner_id).first()
    check_token_quota(db, current_user.id, current_user.tier)
    check_search_unit_quota(db, current_user.id, current_user.tier)

    q = db.query(EvalQuestion).filter(EvalQuestion.owner_id == owner_id)
    if question_id:
        q = q.filter(EvalQuestion.id == question_id)
    questions = q.all()

    details = []
    reciprocal_ranks = []
    faithfulness_results = []

    for eq in questions:
        expected_ids = {ec.chunk_id for ec in eq.expected_chunks}
        results = hybrid_search(db, current_user.id, eq.question, top_k=top_k)
        chunks = [chunk for chunk, score in results]
        chunk_ids_in_order = [chunk.id for chunk in chunks]

        found_ids = expected_ids.intersection(chunk_ids_in_order)
        all_found = found_ids == expected_ids
        fraction_found = len(found_ids) / len(expected_ids) if expected_ids else 0

        ranks = [chunk_ids_in_order.index(cid) + 1 for cid in found_ids] if found_ids else []
        best_rank = min(ranks) if ranks else None
        reciprocal_ranks.append(1 / best_rank if best_rank else 0)

        context = build_context(chunks)
        generated = generate_answer(eq.question, chunks, context=context)
        token_used_for_eval_generation =  generated["tokens_used"]
        log_usage(db, current_user.id, "eval-generation", token_used_for_eval_generation, unit="tokens")
        

        cited_sources = [
            {"excerpt_number": n, "chunk_id": chunks[n - 1].id, "content": chunks[n - 1].content}
            for n in generated["citations_used"]
        ]

        faithful = None
        unsupported = []
        if generated["citations_used"]:
            check_token_quota(db, current_user.id, current_user.tier)

            judge, token_used_for_faithfulness = evaluate_faithfulness(generated["answer"], context)
            log_usage(db, current_user.id, "eval-faithfulness", token_used_for_faithfulness, unit="tokens")
            faithful = judge.get("faithful")
            unsupported = judge.get("unsupported_claims", [])
            if faithful is not None:
                faithfulness_results.append(1 if faithful else 0)

        
        details.append({
            "question": eq.question,
            "expected_chunk_ids": list(expected_ids),
            "all_found": all_found,
            "fraction_found": round(fraction_found, 2),
            "found_chunk_ids": list(found_ids),
            "ranks": ranks,
            "generated_answer": generated["answer"],
            "faithful": faithful,
            "unsupported_claims": unsupported,
            "cited_sources": cited_sources,
        })

    
    

    total = len(questions)
   
    hit_rate = sum(1 for d in details if d["all_found"]) / total if total else 0
    mrr = sum(reciprocal_ranks) / total if total else 0
    faithfulness_rate = sum(faithfulness_results) / len(faithfulness_results) if faithfulness_results else 0

    return {
        "total_questions": total,
        "hit_rate": round(hit_rate, 3),
        "mean_reciprocal_rank": round(mrr, 3),
        "faithfulness_rate": round(faithfulness_rate, 3),
        "details": details,
    }