from __future__ import annotations

import os
from typing import Any, Optional

try:
    from opensearchpy import OpenSearch
except ImportError:  # Optional dependency for local SQLite-only development.
    OpenSearch = None


INDEX_NAME = os.getenv("OPENSEARCH_INDEX", "madhav-products")


def get_client() -> Optional[Any]:
    url = os.getenv("OPENSEARCH_URL")
    if not url or OpenSearch is None:
        return None
    url = url.replace("https://", "").replace("http://", "")
    host, _, port = url.partition(":")
    return OpenSearch(
        hosts=[{"host": host, "port": int(port or 443)}],
        use_ssl=os.getenv("OPENSEARCH_SSL", "true").lower() == "true",
        verify_certs=os.getenv("OPENSEARCH_VERIFY_CERTS", "true").lower() == "true",
        http_auth=(os.getenv("OPENSEARCH_USERNAME"), os.getenv("OPENSEARCH_PASSWORD")) if os.getenv("OPENSEARCH_USERNAME") else None,
    )


def search_ids(query: str, limit: int = 100) -> Optional[list[int]]:
    client = get_client()
    if client is None:
        return None
    response = client.search(index=INDEX_NAME, body={"size": limit, "query": {"multi_match": {"query": query, "fields": ["name^3", "description", "category", "specs.*", "colors"]}}})
    return [int(hit["_source"]["id"]) for hit in response["hits"]["hits"]]


def index_product(product: Any) -> bool:
    client = get_client()
    if client is None:
        return False
    client.index(index=INDEX_NAME, id=product.id, body={"id": product.id, "name": product.name, "description": product.description, "category": product.category, "colors": product.colors or [], "sizes": product.sizes or [], "specs": product.specs or [], "price": product.price, "rating": product.rating, "stock": product.stock})
    return True
