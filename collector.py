"""
collect.py — Combines a visual directory tree, a flat file index, and full
text-file aggregation into multiple output files (max 5MB each).

Usage:
    python collect.py
    python collect.py /some/path
"""

import os
import sys

# ── Configuration ─────────────────────────────────────────────

OUTPUT_BASENAME = "all_files_part"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv"}

BINARY_EXTENSIONS = {
    ".png",".jpg",".jpeg",".gif",".svg",".ico",".webp",".bmp",".tiff",
    ".mp4",".avi",".mov",".mkv",".flv",".wmv",".webm",
    ".mp3",".wav",".flac",".aac",".ogg",".m4a",
    ".exe",".dll",".so",".dylib",".pyc",".pyo",".class",".o",".a",
    ".zip",".tar",".gz",".bz2",".xz",".rar",".7z",".tgz",
    ".ttf",".otf",".woff",".woff2",".eot",
    ".pdf",".doc",".docx",".xls",".xlsx",".ppt",".pptx",
    ".db",".sqlite",".sqlite3",".bin",".dat",".pickle",".pkl",
}

DIVIDER  = "=" * 60
THIN_DIV = "-" * 60


# ── Multi File Writer (5MB splitting) ─────────────────────────

class MultiFileWriter:

    def __init__(self, root):
        self.root = root
        self.part = 1
        self.current_size = 0
        self.file = self._open_new()

    def _open_new(self):
        path = os.path.join(self.root, f"{OUTPUT_BASENAME}{self.part}.txt")
        print(f"Creating {path}")
        self.current_size = 0
        return open(path, "w", encoding="utf-8")

    def write(self, text):
        data = text.encode("utf-8")
        size = len(data)

        if self.current_size + size > MAX_FILE_SIZE:
            self.file.close()
            self.part += 1
            self.file = self._open_new()

        self.file.write(text)
        self.current_size += size

    def writeln(self, text=""):
        self.write(text + "\n")

    def close(self):
        self.file.close()


# ── Directory Tree ───────────────────────────────────────────

def build_tree(root):

    lines = []
    root_name = os.path.basename(os.path.abspath(root)) or "."
    lines.append(root_name + "/")

    def recurse(directory, prefix):

        try:
            entries = sorted(
                os.scandir(directory),
                key=lambda e: (not e.is_dir(), e.name.lower())
            )
        except PermissionError:
            lines.append(prefix + "└── [permission denied]")
            return

        entries = [e for e in entries if not (e.is_dir() and e.name in EXCLUDED_DIRS)]

        for i, entry in enumerate(entries):

            is_last = i == len(entries) - 1
            connector = "└── " if is_last else "├── "

            lines.append(prefix + connector + entry.name + ("/" if entry.is_dir() else ""))

            if entry.is_dir():
                recurse(entry.path, prefix + ("    " if is_last else "│   "))

    recurse(root, "")

    return lines


# ── File helpers ─────────────────────────────────────────────

def is_binary_by_extension(path):

    _, ext = os.path.splitext(path)
    return ext.lower() in BINARY_EXTENSIONS


def is_binary_by_sniff(path, sample_size=8192):

    try:
        with open(path, "rb") as fh:
            return b"\x00" in fh.read(sample_size)
    except OSError:
        return True


def read_text_file(path):

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


def should_skip(path):

    if os.path.abspath(path) == os.path.abspath(__file__):
        return True

    if is_binary_by_extension(path):
        return True

    if is_binary_by_sniff(path):
        return True

    return False


# ── File walker ──────────────────────────────────────────────

def iter_all_files(root):

    for dirpath, dirnames, filenames in os.walk(root, topdown=True):

        dirnames[:] = sorted(d for d in dirnames if d not in EXCLUDED_DIRS)

        for filename in sorted(filenames):

            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, root)

            yield abs_path, rel_path


# ── Main collector ───────────────────────────────────────────

def collect(root="."):

    root = os.path.abspath(root)

    writer = MultiFileWriter(root)

    def w(line=""):
        writer.writeln(line)

    all_files = list(iter_all_files(root))
    tree_lines = build_tree(root)

    text_files = [(a, r) for a, r in all_files if not should_skip(a)]

    written = 0
    skipped = 0

    # ── Section 1: Directory Tree ─────────────────────

    w(DIVIDER)
    w("  DIRECTORY TREE")
    w(DIVIDER)
    w()

    for line in tree_lines:
        w(line)

    w()

    # ── Section 2: File Index ─────────────────────────

    w(DIVIDER)
    w(f"  FILE INDEX  ({len(all_files)} files total)")
    w(DIVIDER)
    w()

    for _, rel_path in all_files:
        w(rel_path)

    w()

    # ── Section 3: File Contents ──────────────────────

    w(DIVIDER)
    w(f"  FILE CONTENTS  ({len(text_files)} readable text files)")
    w(DIVIDER)
    w()

    for abs_path, rel_path in text_files:

        content = read_text_file(abs_path)

        if content is None:
            skipped += 1
            continue

        w(THIN_DIV)
        w(f"File: {os.path.basename(abs_path)}")
        w(f"Path: {rel_path}")
        w(THIN_DIV)

        writer.write(content)

        if not content.endswith("\n"):
            w()

        w()

        written += 1

    writer.close()

    # ── Summary ───────────────────────────────────────

    binary_count = len(all_files) - len(text_files)

    print("Done")
    print(f"Total files    : {len(all_files)}")
    print(f"Text written   : {written}")
    print(f"Binary/skipped : {binary_count + skipped}")


# ── Entry point ─────────────────────────────────────

if __name__ == "__main__":

    target = sys.argv[1] if len(sys.argv) > 1 else "."

    if not os.path.isdir(target):
        print(f"Not a directory: {target}", file=sys.stderr)
        sys.exit(1)

    collect(target)