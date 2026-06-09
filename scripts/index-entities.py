#!/usr/bin/env python3
"""
index-entities.py -- Build/update the Chroma vector index from entity markdown files.
Usage: python scripts/index-entities.py [--dirs data historian scheduler] [--reset]
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

SKIP_FILENAMES = {'CLAUDE.MD', 'README.MD'}
SKIP_DIRS = {'maps', 'scripts', '.claude', '.obsidian', '.vscode', 'meta', 'pitch-log', 'questionnaires', 'drafts'}


def parse_frontmatter(text):
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return {}, text
    fm_text = m.group(1)
    body = text[m.end():]
    fm = {}
    for line in fm_text.splitlines():
        line = line.rstrip()
        if not line or line.startswith('  ') or line.startswith('- '):
            continue
        kv = re.match(r'^(\w[\w_]*):\s*(.*)', line)
        if not kv:
            continue
        key = kv.group(1)
        val = kv.group(2).strip().strip('"').strip("'")
        val = re.sub(r'\[\[([^\]]+)\]\]', r'\1', val)
        if val:
            fm[key] = val
    return fm, body


def build_text_chunk(fm, body):
    parts = []
    for key in ['name', 'type', 'subtype', 'personality', 'livelihood', 'description',
                'disposition', 'importance', 'location']:
        if key in fm and fm[key] not in ('true', 'false', '[]', '{}'):
            parts.append(f"{key}: {fm[key]}")
    clean_body = re.sub(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', r'\1', body)
    clean_body = re.sub(r'^#+\s+', '', clean_body, flags=re.MULTILINE)
    clean_body = clean_body.strip()
    if clean_body:
        parts.append(clean_body)
    return '\n'.join(parts)


def should_skip(md_file, rel_path):
    if md_file.name.upper() in SKIP_FILENAMES:
        return True
    parts = Path(rel_path).parts
    if parts and parts[0] in SKIP_DIRS:
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description='Index entity markdown files into Chroma vector store')
    parser.add_argument('--dirs', nargs='+', default=['data', 'historian', 'scheduler'])
    parser.add_argument('--reset', action='store_true', help='Delete and rebuild index from scratch')
    args = parser.parse_args()

    try:
        import chromadb
        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
    except ImportError:
        print("ERROR: Missing dependency. Run: py -3.10 -m pip install chromadb")
        sys.exit(1)

    index_dir = ROOT / 'vector-index'
    index_dir.mkdir(exist_ok=True)

    client = chromadb.PersistentClient(path=str(index_dir))
    ef = DefaultEmbeddingFunction()

    if args.reset:
        try:
            client.delete_collection('entities')
            print("Deleted existing index.")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name='entities',
        embedding_function=ef,
        metadata={'hnsw:space': 'cosine'}
    )

    indexed = 0
    skipped = 0

    for dir_name in args.dirs:
        dir_path = ROOT / dir_name
        if not dir_path.exists():
            print(f"SKIP: {dir_name}/ not found")
            continue

        print(f"Indexing {dir_name}/...")

        for md_file in sorted(dir_path.rglob('*.md')):
            rel_path = str(md_file.relative_to(ROOT)).replace('\\', '/')

            if should_skip(md_file, rel_path):
                skipped += 1
                continue

            text = md_file.read_text(encoding='utf-8', errors='ignore')
            fm, body = parse_frontmatter(text)

            if 'name' not in fm:
                skipped += 1
                continue

            chunk = build_text_chunk(fm, body)
            if not chunk.strip():
                skipped += 1
                continue

            doc_id = rel_path.replace(' ', '_')
            source_dir = Path(rel_path).parts[0]

            collection.upsert(
                ids=[doc_id],
                documents=[chunk],
                metadatas=[{
                    'name': fm.get('name', ''),
                    'type': fm.get('type', ''),
                    'subtype': fm.get('subtype', ''),
                    'exists': fm.get('exists', ''),
                    'state': fm.get('state', ''),
                    'source_dir': source_dir,
                    'file_path': rel_path,
                }]
            )
            indexed += 1

            if indexed % 100 == 0:
                print(f"  {indexed} indexed...")

    commit = "unknown"
    try:
        import subprocess
        result = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, cwd=ROOT)
        if result.returncode == 0:
            commit = result.stdout.strip()
    except Exception:
        pass

    stamp_file = ROOT / 'vector-index' / '.index-built'
    from datetime import datetime, timezone
    stamp_file.write_text(f"{datetime.now(timezone.utc).isoformat()}\n{commit}\n", encoding='utf-8')

    print(f"\nDone. Indexed: {indexed} | Skipped: {skipped}")
    print(f"Total in collection: {collection.count()}")
    print(f"Index: {index_dir}")
    print(f"Stamp: {stamp_file}")


if __name__ == '__main__':
    main()
