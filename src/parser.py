import sys
import pymupdf
import pandas as pd
import openai
import os
import re
from HeaderDetection import extractHeaders


def parseTables(parsedPage, dataFrames):
    for table in parsedPage.find_tables():
        currentDataFrame = table.to_pandas()
        currentDataFrame.to_csv(f"table_{table.header}.csv", index=False)
        dataFrames.append(currentDataFrame)

def parsePdf(file_path):
    doc = pymupdf.open(file_path)
    dataFrames = []
    pdfText = ""
    pageNum = 1
    for page in doc:
        pdfText += page.get_text()
        pdfText += f"\n\nPage {pageNum} of {doc.page_count}\n\n"
        parseTables(page, dataFrames)
        pageNum += 1

    return pdfText, dataFrames

def removeReferences(text):
    match = re.search(r'\n\s*(references|bibliography)\s*\n', text, re.IGNORECASE)
    if match:
        return text[:match.start()]
    return text

def aiSummarizer(chunks, tables, key):
    client = openai.OpenAI(api_key=key)
    prompt = f"""You are an expert document analyst in the world of research. Here's the full text of a PDF in chunks"""
    chunkNum = 1
    for chunk in chunks:
        prompt += f"Document Chunk: {chunkNum} - {chunk}"
    for i, (filename, df) in enumerate(tables):
        prompt += f"\nTable {i+1} ({filename}):\n{df.to_string(index=False)}\n"

    prompt += """
    ---
    Instructions:
    1. Provide a detailed summary of this chunk.
    2. If any table is related, explain its significance and key results to the specific section of the document
    """
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4096
    )
    return response.choices[0].message.content


def saveSummary(output, fileName):
    with open(fileName, "a") as f:
        f.write(output + "\n\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parser.py path/to/your.pdf")
        sys.exit(1)
    pdf_path = sys.argv[1]
    text, tables = parsePdf(pdf_path)
    key = os.getenv("OPENAI_API_KEY")
    text = removeReferences(text)
    _, chunks = extractHeaders(pdf_path)
    summaries = []
    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            continue  # skip blank chunks
        summary = aiSummarizer([chunk], tables, key)
        print(f"Summarized section {i+1}/{len(chunks)}")
        saveSummary(f"## Section {i+1} Summary\n{summary}", "summary.md")
        summaries.append(summary)

    print("✅ Done. Check summary.md and CSVs.")


    