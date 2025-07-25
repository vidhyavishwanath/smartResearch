import pymupdf
from collections import Counter

def extractHeaders(file_path):
    doc = pymupdf.open(file_path)
    all_spans = []
    pageTexts = []
    for page_num, page in enumerate(doc):
        text_dict = page.get_text("dict")
        pageText = ""
        for block in text_dict["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    all_spans.append({
                        "text": span["text"].strip(),
                        "size": span["size"],
                        "font": span["font"],
                        "flags": span["flags"],
                        "y": span["bbox"][1],
                        "page": page_num,
                    })
                    pageText += span["text"]
        pageTexts.append(pageText)

    size_counts = Counter([span["size"] for span in all_spans if len(span["text"]) > 2])
    most_common_sizes = size_counts.most_common()
    if not most_common_sizes:
        return [], ["".join(pageTexts)]
    body_size = most_common_sizes[0][0]
    header_sizes = [size for size, count in most_common_sizes if size > body_size]

    header_candidates = []
    for span in all_spans:
        if span["size"] in header_sizes and span["y"] > 20 and len(span["text"]) > 2:
            header_candidates.append((span["page"], span["text"], span["y"], span["size"]))

    header_texts = [h[1] for h in header_candidates]
    repeated = {h for h, c in Counter(header_texts).items() if c > len(doc) // 2}
    sectionHeaders = [h for h in header_candidates if h[1] not in repeated]

    sectionHeaders.sort()

    sections = []
    last_page, last_y = 0, 0
    for idx, (page, text, y, size) in enumerate(sectionHeaders):
        section_text = ""
        for p in range(last_page, page + 1):
            page_dict = doc[p].get_text("dict")
            for block in page_dict["blocks"]:
                if block["type"] != 0:
                    continue
                for line in block["lines"]:
                    for span in line["spans"]:
                        if (p == last_page and span["bbox"][1] < last_y):
                            continue
                        if (p == page and span["bbox"][1] >= y):
                            continue
                        section_text += span["text"]
        if section_text.strip():
            sections.append(section_text.strip())
        last_page, last_y = page, y

    last_section = ""
    for p in range(last_page, len(doc)):
        page_dict = doc[p].get_text("dict")
        for block in page_dict["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    if p == last_page and span["bbox"][1] < last_y:
                        continue
                    last_section += span["text"]
    if last_section.strip():
        sections.append(last_section.strip())

    return sectionHeaders, sections