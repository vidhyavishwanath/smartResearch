import asyncio
import sys
import pymupdf
import pandas as pd
import openai
import os
import re
from HeaderDetection import extractHeaders
from databaseQuery import saveSummary
from semanticEmbeddings import embedChunk, saveToFaiss

# ---------------- Helper Functions ----------------
def parseTables(parsedPage, dataFrames):
    for table in parsedPage.find_tables():
        currentDataFrame = table.to_pandas()
        currentDataFrame.to_csv(f"table_{table.header}.csv", index=False)
        dataFrames.append((f"table_{table.header}.csv", currentDataFrame))

def parsePdf(filePath):
    doc = pymupdf.open(filePath)
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

async def getSummary(client, chunk, tables, sectionName, maxTokens=4096):
    prompt = f"""You are an expert document analyst in research.

Document Section ({sectionName}):
{chunk}
"""
    for j, (filename, df) in enumerate(tables):
        prompt += f"\nTable {j+1} ({filename}):\n{df.to_string(index=False)}\n"

    prompt += """
---
Instructions:
1. Provide a detailed summary of this chunk.
2. If any table is related, explain its significance and key results to the section.
"""
    response = await client.chat.completions.acreate(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=maxTokens
    )
    return response.choices[0].messages.content 

# ---------------- Main Async Function ----------------
async def parseAndSummarizePdf(filePath, apiKey):
    pdfText, tables = parsePdf(filePath)
    pdfText = removeReferences(pdfText)
    sectionNames, chunks = extractHeaders(filePath)
    
    client = openai.OpenAI(api_key=apiKey)
    fileName = os.path.basename(filePath)

    # ---------------- Short Summary ----------------
    firstChunk = chunks[0] if chunks else pdfText[:2000]
    shortSummary = await getSummary(
        client,
        firstChunk,
        tables,
        sectionNames[0][1] if sectionNames else "Introduction"
    )
    await saveSummary(fileName, shortSummary, summaryType="short")  

    # ---------------- Section Summaries ----------------
    sectionSummaries = []

    async def processChunk(i, chunk):
        header = sectionNames[i][1] if i < len(sectionNames) else f"Section {i+1}"
        summary = await getSummary(client, chunk, tables, header)
        sectionSummaries.append({"section": i+1, "header": header, "summary": summary})
        await saveSummary(fileName, summary, summaryType="section")  # Update progressively

    tasks = [processChunk(i, chunks[i]) for i in range(1, len(chunks))]
    await asyncio.gather(*tasks)

    # ---------------- Global Summary ----------------
    combinedPrompt = "You are an expert document analyst. Summarize this paper in 3 sentences:\n"
    combinedPrompt += f"Short Summary: {shortSummary}\n"
    for s in sectionSummaries:
        combinedPrompt += f"Section {s['section']} ({s['header']}): {s['summary']}\n"

    globalSummary = await getSummary(client, combinedPrompt, tables=[], sectionName="Global Summary")
    await saveSummary(fileName, globalSummary, summaryType="global")  # Final save

    return {
        "fileName": fileName,
        "shortSummary": shortSummary,
        "sectionSummaries": sectionSummaries,
        "globalSummary": globalSummary,
        "tables": [filename for filename, _ in tables],
        "headers": sectionNames
    }

# ---------------- CLI ----------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parser.py path/to/your.pdf")
        sys.exit(1)

    pdfPath = sys.argv[1]
    apiKey = os.getenv("OPENAI_API_KEY")

    # Run the async parser correctly
    result = asyncio.run(parseAndSummarizePdf(pdfPath, apiKey))

    print("✅ Done. Short summary is available immediately; rest processed asynchronously.")
    print("Short Summary:", result["shortSummary"])
    print("Global Summary:", result["globalSummary"])
