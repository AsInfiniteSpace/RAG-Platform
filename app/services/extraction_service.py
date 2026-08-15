import pdfplumber
from loguru import logger


def extract_pdf_content(file_path: str, has_borderless_tables: bool = False) -> dict:
    text_pages = []
    tables = []
    table_settings = {"vertical_strategy": "text", "horizontal_strategy": "text"} if has_borderless_tables else {}

    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            found_tables = page.find_tables(table_settings=table_settings) if table_settings else page.find_tables()
            table_bboxes = [t.bbox for t in found_tables]

            def outside_tables(obj, bboxes=table_bboxes, margin=8):
                for (x0, top, x1, bottom) in bboxes:
                    overlaps = not (
                        obj["x1"] < x0 - margin or obj["x0"] > x1 + margin or
                        obj["bottom"] < top - margin or obj["top"] > bottom + margin
                    )
                    if overlaps:
                        return False
                return True

            text_only_page = page.filter(outside_tables)
            text = text_only_page.extract_text() or ""
            if text.strip():
                text_pages.append({"page_number": i, "text_content": text})

            for t in found_tables:
                table_data = t.extract()
                cleaned = [[cell if cell is not None else "" for cell in row] for row in table_data]
                if len(cleaned) >= 2:
                    tables.append({"page_number": i, "table_data": cleaned})

    return {"text_pages": text_pages, "tables": tables}

def merge_continued_tables(tables: list[dict]) -> list[dict]:
    if not tables:
        return []

    def tag_rows(table):
        return [{"row": row, "page": table["page_number"]} for row in table["table_data"]]

    merged = [{
        "start_page": tables[0]["page_number"],
        "end_page": tables[0]["page_number"],
        "header": tables[0]["table_data"][0] if tables[0]["table_data"] else [],
        "tagged_rows": tag_rows(tables[0]),
    }]

    for table in tables[1:]:
        prev = merged[-1]
        curr_cols = len(table["table_data"][0]) if table["table_data"] else 0
        is_adjacent_page = table["page_number"] == prev["end_page"] + 1
        same_column_count = len(prev["header"]) == curr_cols and curr_cols > 0

        if is_adjacent_page and same_column_count:
            rows = table["table_data"]
            if rows and rows[0] == prev["header"]:
                rows = rows[1:]  # drop repeated header row
            prev["tagged_rows"].extend({"row": r, "page": table["page_number"]} for r in rows)
            prev["end_page"] = table["page_number"]
        else:
            merged.append({
                "start_page": table["page_number"],
                "end_page": table["page_number"],
                "header": table["table_data"][0] if table["table_data"] else [],
                "tagged_rows": tag_rows(table),
            })

    return merged