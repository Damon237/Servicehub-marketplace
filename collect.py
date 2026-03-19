"""
collect.py — Combines a visual directory tree, a flat file index, and full
text-file aggregation into a single output file: all_files.txt.

Output structure
────────────────
  1. Directory Tree   — indented tree (like `tree`)
  2. File Index       — flat sorted list of every relative file path
  3. File Contents    — each readable text file, preceded by a header block

Usage:
    python collect.py               # runs on the current directory
    python collect.py /some/path    # runs on a specific directory
"""

import os
import sys

# ── Configuration ─────────────────────────────────────────────────────────────

OUTPUT_FILE = "all_files.txt"

EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv"}

BINARY_EXTENSIONS = {
    # Images
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
    # Video
    ".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm",
    # Audio
    ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a",
    # Executables / compiled
    ".exe", ".dll", ".so", ".dylib", ".pyc", ".pyo", ".class", ".o", ".a",
    # Archives
    ".zip", ".tar", ".gz", ".bz2", ".xz", ".rar", ".7z", ".tgz",
    # Fonts
    ".ttf", ".otf", ".woff", ".woff2", ".eot",
    # Documents (binary formats)
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    # Database / misc binary
    ".db", ".sqlite", ".sqlite3", ".bin", ".dat", ".pickle", ".pkl",
}

DIVIDER  = "=" * 60
THIN_DIV = "-" * 60


# ── Directory Tree ─────────────────────────────────────────────────────────────

def build_tree(root: str) -> list[str]:
    """Return lines forming an indented visual directory tree."""
    lines: list[str] = []
    root_name = os.path.basename(os.path.abspath(root)) or "."
    lines.append(root_name + "/")

    def _recurse(directory: str, prefix: str) -> None:
        try:
            entries = sorted(
                os.scandir(directory),
                key=lambda e: (not e.is_dir(), e.name.lower()),
            )
        except PermissionError:
            lines.append(prefix + "└── [permission denied]")
            return

        entries = [e for e in entries if not (e.is_dir() and e.name in EXCLUDED_DIRS)]

        for i, entry in enumerate(entries):
            is_last   = i == len(entries) - 1
            connector = "└── " if is_last else "├── "
            lines.append(prefix + connector + entry.name + ("/" if entry.is_dir() else ""))
            if entry.is_dir():
                _recurse(entry.path, prefix + ("    " if is_last else "│   "))

    _recurse(root, "")
    return lines


# ── File Helpers ───────────────────────────────────────────────────────────────

def is_binary_by_extension(path: str) -> bool:
    _, ext = os.path.splitext(path)
    return ext.lower() in BINARY_EXTENSIONS


def is_binary_by_sniff(path: str, sample_size: int = 8192) -> bool:
    """Detect binary files by scanning for null bytes."""
    try:
        with open(path, "rb") as fh:
            return b"\x00" in fh.read(sample_size)
    except OSError:
        return True


def read_text_file(path: str) -> "str | None":
    """Try UTF-8 first, fall back to Latin-1; return None if unreadable."""
    for encoding in ("utf-8", "latin-1"):
        errors = "strict" if encoding == "utf-8" else "replace"
        try:
            with open(path, "r", encoding=encoding, errors=errors) as fh:
                return fh.read()
        except (UnicodeDecodeError, ValueError):
            continue
        except OSError:
            return None
    return None


def should_skip(path: str, output_path: str) -> bool:
    """Return True if the file should be excluded from content aggregation."""
    if os.path.abspath(path) == output_path:
        return True
    if os.path.abspath(path) == os.path.abspath(__file__):
        return True
    if is_binary_by_extension(path):
        return True
    if is_binary_by_sniff(path):
        return True
    return False


# ── File Walker ────────────────────────────────────────────────────────────────

def iter_all_files(root: str):
    """Yield (abs_path, rel_path) for every file under root (excluded dirs pruned)."""
    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDED_DIRS)
        for filename in sorted(filenames):
            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, root)
            yield abs_path, rel_path


# ── Main ───────────────────────────────────────────────────────────────────────

def collect(root: str = ".") -> None:
    root        = os.path.abspath(root)
    output_path = os.path.abspath(os.path.join(root, OUTPUT_FILE))

    # Gather everything up-front so counts are available for section headers
    all_files  = list(iter_all_files(root))
    tree_lines = build_tree(root)
    text_files = [(a, r) for a, r in all_files if not should_skip(a, output_path)]

    try:
        with open(output_path, "w", encoding="utf-8") as out:

            def w(line: str = "") -> None:
                out.write(line + "\n")

            # ── Section 1: Directory Tree ──────────────────────────────────
            w(DIVIDER)
            w("  DIRECTORY TREE")
            w(DIVIDER)
            w()
            for line in tree_lines:
                w(line)
            w()

            # ── Section 2: Flat File Index ─────────────────────────────────
            w(DIVIDER)
            w(f"  FILE INDEX  ({len(all_files)} files total)")
            w(DIVIDER)
            w()
            for _, rel_path in all_files:
                w(rel_path)
            w()

            # ── Section 3: File Contents ───────────────────────────────────
            w(DIVIDER)
            w(f"  FILE CONTENTS  ({len(text_files)} readable text files)")
            w(DIVIDER)
            w()

            written = skipped = 0

            for abs_path, rel_path in text_files:
                content = read_text_file(abs_path)
                if content is None:
                    skipped += 1
                    continue

                w(THIN_DIV)
                w(f"File: {os.path.basename(abs_path)}")
                w(f"Path: {rel_path}")
                w(THIN_DIV)
                out.write(content)
                if not content.endswith("\n"):
                    w()
                w()
                written += 1

        # ── stdout summary ─────────────────────────────────────────────────
        binary_count = len(all_files) - len(text_files)
        print(f"  Done -> {output_path}")
        print(f"   Total files    : {len(all_files)}")
        print(f"   Text written   : {written}")
        print(f"   Binary/skipped : {binary_count + skipped}")

    except OSError as exc:
        print(f"Could not write output file: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    if not os.path.isdir(target):
        print(f"Not a directory: {target!r}", file=sys.stderr)
        sys.exit(1)
    collect(target)
