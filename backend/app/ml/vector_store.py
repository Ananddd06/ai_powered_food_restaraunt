"""
FAISS Vector Store Manager using SentenceTransformers.
Handles embedding generation, vector indexing, saving/loading, and dense semantic search.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
DATA_DIR = Path("/Users/anand/Desktop/ai_powered_restarant/backend/data")
INDEX_PATH = DATA_DIR / "chennai_faiss.index"
METADATA_PATH = DATA_DIR / "processed_chennai_restaurants.json"
EMBEDDINGS_NPY_PATH = DATA_DIR / "embeddings.npy"


class VectorStoreManager:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self._model = None
        self._index = None
        self.metadata: List[Dict[str, Any]] = []

    def load_model(self):
        """Lazy load SentenceTransformer model."""
        if self._model is None:
            print(f"Loading embedding model: {self.model_name}...")
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def build_index(self, force_rebuild: bool = False):
        """Build FAISS index from preprocessed restaurant descriptions."""
        import faiss

        if not METADATA_PATH.exists():
            from app.ml.preprocess import preprocess_dataset
            self.metadata = preprocess_dataset()
        else:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        if not force_rebuild and INDEX_PATH.exists() and EMBEDDINGS_NPY_PATH.exists():
            print(f"Loading existing FAISS index from {INDEX_PATH}...")
            self._index = faiss.read_index(str(INDEX_PATH))
            return

        descriptions = [item["description"] for item in self.metadata]
        print(f"Generating dense embeddings for {len(descriptions)} restaurants...")
        model = self.load_model()
        
        # Compute normalized embeddings for cosine similarity via Inner Product
        embeddings = model.encode(
            descriptions,
            batch_size=64,
            show_progress_bar=True,
            normalize_embeddings=True
        )
        embeddings = np.array(embeddings, dtype=np.float32)

        dimension = embeddings.shape[1]
        print(f"Embedding dimension: {dimension}")

        index = faiss.IndexFlatIP(dimension)
        index.add(embeddings)

        # Save index & embeddings
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(INDEX_PATH))
        np.save(EMBEDDINGS_NPY_PATH, embeddings)

        self._index = index
        print(f"Successfully built and saved FAISS index with {index.ntotal} vectors.")

    def search_similar(self, query: str, top_k: int = 20) -> List[Tuple[Dict[str, Any], float]]:
        """
        Encode query string and search top_k nearest semantic matches in FAISS.
        Returns list of (restaurant_metadata_dict, similarity_score).
        """
        import faiss

        if self._index is None:
            if INDEX_PATH.exists():
                self._index = faiss.read_index(str(INDEX_PATH))
            else:
                self.build_index()

        if not self.metadata and METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

        model = self.load_model()
        query_embedding = model.encode([query], normalize_embeddings=True)
        query_embedding = np.array(query_embedding, dtype=np.float32)

        scores, indices = self._index.search(query_embedding, top_k)

        results = []
        seen_ids = set()

        # 1. Direct Name Match Boosting
        STOP_WORDS = {
            "the", "and", "for", "near", "food", "restaurant", "restarant", "hotel", "cafe",
            "want", "from", "with", "have", "some", "good", "best", "place", "chennai", "me"
        }
        query_clean = query.lower().strip()
        query_words = [w for w in query_clean.split() if len(w) > 2 and w not in STOP_WORDS]

        if query_words:
            for item in self.metadata:
                item_name = item.get("name", "").lower()
                # Check if any specific brand name token is in the restaurant name
                if any(qw in item_name for qw in query_words):
                    item_id = item.get("id") or item["name"]
                    seen_ids.add(item_id)
                    results.append((item, 0.95))
                    if len(results) >= 15:
                        break


        # 2. FAISS Dense Semantic Similarity Search Results
        for idx, score in zip(indices[0], scores[0]):
            if 0 <= idx < len(self.metadata):
                restaurant = self.metadata[idx]
                r_id = restaurant.get("id") or restaurant["name"]
                if r_id not in seen_ids:
                    seen_ids.add(r_id)
                    results.append((restaurant, float(score)))

        return results[:top_k]



# Global singleton instance
vector_store = VectorStoreManager()
