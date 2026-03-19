"""
stats_counter.py — A lightweight script to provide technical metrics for 
the ServiceHub end-of-year project. 

Counts: Folders, Total Files, Source Code Files, Images, and Total Lines of Code (LoC).
Excludes: node_modules, .git, and other environment folders.
"""

import os
import sys

# ── Configuration ─────────────────────────────────────────────

# Folders to completely ignore to ensure accuracy
EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", ".next", "dist", "build"}

# Extensions categorized as "Images"
IMAGE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff"
}

# Known binary/non-code files to skip for line counting
BINARY_OR_SKIPPED = {
    ".mp4", ".mp3", ".exe", ".dll", ".zip", ".pdf", ".db", ".sqlite", ".bin", ".dat"
}

DIVIDER = "=" * 55

# ── Helpers ──────────────────────────────────────────────────

def read_line_count(path):
    """Counts lines in a text file safely without loading the whole file into memory."""
    count = 0
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for _ in f:
                count += 1
        return count
    except OSError:
        return 0

# ── Main Logic ───────────────────────────────────────────────

def get_project_stats(root="."):
    root = os.path.abspath(root)
    
    stats = {
        "folders": 0,
        "total_files": 0,
        "code_files": 0,
        "images": 0,
        "total_lines": 0
    }

    print(f"\nScanning Project: {os.path.basename(root)}")
    print(f"Path: {root}")
    print("Excluding: node_modules, .git, .next, etc.\n")

    for dirpath, dirnames, filenames in os.walk(root):
        # Filter out excluded directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        
        # Count the folders we are currently looking at
        stats["folders"] += len(dirnames)
        
        for filename in filenames:
            stats["total_files"] += 1
            file_path = os.path.join(dirpath, filename)
            _, ext = os.path.splitext(filename)
            ext = ext.lower()

            # 1. Check if it's an image
            if ext in IMAGE_EXTENSIONS:
                stats["images"] += 1
            
            # 2. Check if it's a source code/text file
            elif ext not in BINARY_OR_SKIPPED:
                # If it's not a known binary, we attempt to count lines
                lines = read_line_count(file_path)
                if lines > 0:
                    stats["code_files"] += 1
                    stats["total_lines"] += lines

    # ── Final Report ──────────────────────────────────────────
    
    print(DIVIDER)
    print("          PROJECT ARCHITECTURE")
    print(DIVIDER)
    print(f"  Total Folders         : {stats['folders']}")
    print(f"  Total Files Found     : {stats['total_files']}")
    print(f"  Images/Assets         : {stats['images']}")
    print(f"  Source Code Files     : {stats['code_files']}")
    print(f"  Total Lines (LoC)     : {stats['total_lines']}")
    print(DIVIDER)
    print("Scan Complete. Ready for report summary.\n")

if __name__ == "__main__":
    target = sys.argv if len(sys.argv) > 1 else "."
    if not os.path.isdir(target):
        print(f"Error: {target} is not a valid directory.")
        sys.exit(1)
    
    get_project_stats(target)