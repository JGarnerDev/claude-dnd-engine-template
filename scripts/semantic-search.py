#!/usr/bin/env python3
"""
semantic-search.py -- Query the Chroma vector index for semantically similar entities.
Usage: python scripts/semantic-search.py "betrayal and political intrigue" [--type character] [-k 5]
"""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

SNIPPET_SKIP = {'name', 'type', 'subtype', 'exists', 'state', 'source_dir', 'file_path'}


def main():
    parser = argparse.ArgumentParser(description='Semantic search over entity index')
    parser.add_argument('query', help='Search query text')
    parser.add_argument('--type', default='', help='Filter by entity type (character, location, faction, etc.)')
    parser.add_argument('--subtype', default='', help='Filter by entity subtype')
    parser.add_argument('--exists', default='', choices=['true', 'false', ''], help='Filter by exists status')
    parser.add_argument('--source', default='', choices=['data', 'historian', 'scheduler', ''],
                        help='Filter by source directory')
    parser.add_argument('-k', type=int, default=8, help='Number of results (default: 8)')
    args = parser.parse_args()

    try:
        import chromadb
        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
    except ImportError:
        print("ERROR: Missing dependency. Run: py -3.10 -m pip install chromadb")
        sys.exit(1)

    index_dir = ROOT / 'vector-index'
    if not index_dir.exists():
        print("ERROR: Index not found. Run: py -3.10 scripts/index-entities.py")
        sys.exit(1)

    client = chromadb.PersistentClient(path=str(index_dir))
    ef = DefaultEmbeddingFunction()

    try:
        collection = client.get_collection(name='entities', embedding_function=ef)
    except Exception:
        print("ERROR: Collection not found. Run: python scripts/index-entities.py")
        sys.exit(1)

    filters = []
    if args.type:
        filters.append({'type': {'$eq': args.type}})
    if args.subtype:
        filters.append({'subtype': {'$eq': args.subtype}})
    if args.exists:
        filters.append({'exists': {'$eq': args.exists}})
    if args.source:
        filters.append({'source_dir': {'$eq': args.source}})

    where = None
    if len(filters) == 1:
        where = filters[0]
    elif len(filters) > 1:
        where = {'$and': filters}

    query_kwargs = {
        'query_texts': [args.query],
        'n_results': args.k,
    }
    if where:
        query_kwargs['where'] = where

    results = collection.query(**query_kwargs)

    ids = results['ids'][0]
    docs = results['documents'][0]
    metas = results['metadatas'][0]
    distances = results['distances'][0]

    if not ids:
        print("No results.")
        return

    filter_parts = [p for p in [
        f"type={args.type}" if args.type else '',
        f"subtype={args.subtype}" if args.subtype else '',
        f"exists={args.exists}" if args.exists else '',
        f"source={args.source}" if args.source else '',
    ] if p]

    print(f'SEMANTIC SEARCH: "{args.query}"')
    if filter_parts:
        print(f"Filters: {' | '.join(filter_parts)}")
    print(f"Top {len(ids)} of {collection.count()} entities:\n")

    for i, (doc, meta, dist) in enumerate(zip(docs, metas, distances), 1):
        score = 1 - dist
        name = meta.get('name', ids[i - 1])
        entity_type = meta.get('type', '')
        subtype = meta.get('subtype', '')
        state = meta.get('state', '')
        exists = meta.get('exists', '')
        file_path = meta.get('file_path', '')

        type_str = f"{entity_type}/{subtype}" if subtype else entity_type
        state_str = f" [{state}]" if state else ''
        pool_str = " (pool)" if exists == 'false' else ''

        snippet_lines = [l for l in doc.split('\n')
                         if l.strip() and not any(l.startswith(f"{k}:") for k in SNIPPET_SKIP)]
        snippet = ' '.join(snippet_lines)[:120].strip()
        if sum(len(l) for l in snippet_lines) > 120:
            snippet += '...'

        print(f"{i}. {name} ({type_str}{state_str}{pool_str})  score={score:.3f}")
        print(f"   {file_path}")
        if snippet:
            print(f"   {snippet}")
        print()


if __name__ == '__main__':
    main()
