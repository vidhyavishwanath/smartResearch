import numpy as np
import openai
import faiss
import json
import os

def embedChunk(text, client):
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    return np.array(response.data[0].embedding, dtype='float32')

def saveToFaiss(summaries, file_name, index_path="vector.index", meta_path="metadata.json"):
    dim = 1536  # embedding size for ada-002
    if faissIndexExists(index_path):
        index = faiss.read_index(index_path)
    else:
        index = faiss.IndexFlatL2(dim)

    metadata = load_metadata(meta_path)
    embeddings = []

    for s in summaries:
        chunk = s["raw_text"]
        emb = np.array(s["embedding"], dtype='float32')
        index.add(emb.reshape(1, -1))
        metadata.append({
            "file": file_name,
            "section": s["section"],
            "header": s["header"],
            "summary": s["summary"]
        })

    faiss.write_index(index, index_path)
    with open(meta_path, "w") as f:
        json.dump(metadata, f)

def faissIndexExists(path):
    if os.path.exists(path):
        return True
    else:
        return False

def loadMetadata(path):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    else:
        return []
