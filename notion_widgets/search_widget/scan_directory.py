#!/usr/bin/env python3
"""Build a portable JSON search index for a local folder or synced Drive folder."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

IGNORED_DIRS = {".git", ".github", ".venv", "venv", "node_modules", "__pycache__", "dist", "build"}
TEXT_EXTENSIONS = {".md", ".txt", ".html", ".htm", ".css", ".js", ".ts", ".json", ".py", ".yml", ".yaml", ".toml", ".csv"}
CATEGORY_BY_EXTENSION = {
    ".py": "Development & Code", ".js": "Development & Code", ".ts": "Development & Code",
    ".html": "Development & Code", ".htm": "Development & Code", ".css": "Development & Code",
    ".json": "Development & Code", ".yml": "Development & Code", ".yaml": "Development & Code",
    ".toml": "Development & Code", ".md": "Documentation", ".txt": "Documentation",
    ".pdf": "Research & Specs", ".docx": "Research & Specs", ".png": "Architecture & Design",
    ".svg": "Architecture & Design", ".jpg": "Architecture & Design", ".jpeg": "Architecture & Design",
}


def text_preview(path: Path) -> str:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return ""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
    # Avoid indexing minified/huge files into the static payload.
    text = re.sub(r"\s+", " ", text)
    return text[:500]


def scan_folder(root: Path, url_prefix: str = "", drive_folder_url: str = "", link_base: Path | None = None) -> list[dict]:
    items = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith(".") and d not in IGNORED_DIRS)
        for filename in sorted(filenames):
            if filename.startswith(".") or filename == "index.json":
                continue
            path = Path(dirpath) / filename
            try:
                stat = path.stat()
                relative = path.relative_to(root).as_posix()
            except (OSError, ValueError):
                continue
            ext = path.suffix.lower()
            link_path = relative if url_prefix else Path(os.path.relpath(path, link_base or root)).as_posix()
            encoded_path = "/".join(quote(part) for part in link_path.split("/"))
            if drive_folder_url:
                # A synced Drive folder is indexed locally; open the file via the configured shared folder.
                url = drive_folder_url.rstrip("/")
            else:
                url = f"{url_prefix.rstrip('/')}/{encoded_path}" if url_prefix else encoded_path
            preview = text_preview(path)
            items.append({
                "id": relative,
                "title": path.name,
                "path": relative,
                "category": CATEGORY_BY_EXTENSION.get(ext, "General"),
                "summary": preview or f"{relative} · {round(stat.st_size / 1024, 1)} KB",
                "tags": [ext[1:].upper()] if ext else ["FILE"],
                "status": datetime.fromtimestamp(stat.st_mtime, timezone.utc).strftime("%Y-%m-%d"),
                "mimeType": mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                "url": url,
            })
    return items


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent, help="Folder to scan (default: project root)")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent / "index.json", help="Index JSON output path")
    parser.add_argument("--url-prefix", default="", help="URL prefix for files, e.g. https://example.com/files")
    parser.add_argument("--drive-folder-url", default="", help="Shared Drive folder URL to use as links for a synced Drive folder")
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        parser.error(f"root directory does not exist: {root}")
    output = args.output.resolve()
    records = scan_folder(root, args.url_prefix, args.drive_folder_url, output.parent.resolve())
    payload = {"version": 1, "generatedAt": datetime.now(timezone.utc).isoformat(), "source": root.name, "items": records}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(records)} files from {root} into {output}")


if __name__ == "__main__":
    main()
