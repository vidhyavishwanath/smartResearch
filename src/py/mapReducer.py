import json
import numpy as np
import umap
from sklearn.metrics.pairwise import cosine_similarity

reducer  = umap.UMAP(n_components = 2, random_state = 42)
nodeMapCoordinates = reducer.fit_transform(np.array([s['embedding'] for s in summaries]))

def createNodes():
    nodes = []
    for index, (summary, (x, y)) in enumerate(zip(summaries, nodeMapCoordinates)):
        nodes.append({
        "id": str(i),
        "type": "default",
        "position": {"x": float(coord[0]), "y": float(coord[1])},
        "data": {
            "label": f"{summary['header']}: {summary['summary'][:80]}...",
            "section": summary['section'],
            "file": summary.get("file", "unknown")
        }
    })
    return nodes

def addEdges():
    edges = []
    similarities = cosine_similarity([s['embedding'] for s in summaries])
    for i in range(len(similarities)):
        for j in range(i+1, len(similarities)):
            if sim[i][j] > 0.75:
                edges.append({
                "id": f"e{i}-{j}",
                "source": str(i),
                "target": str(j),
                "label": f"{sim[i][j]:.2f}",
                "type": "default"
            })
    return edges

if __name__ == "__main__":
    with open("public/nodes.json", "w") as f:
        json.dump(createNodes(), f, indent=2)

    with open("public/edges.json", "w") as f:
        json.dump(addEdges(), f, indent=2)


