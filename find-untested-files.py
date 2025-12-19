#!/usr/bin/env python3
"""
Find Untested Files Script

This script searches a repository for source files (.vue and .ts files, excluding .test.ts)
that do not have a colocated test file (.test.ts) in the same directory.

Usage:
    python find-untested-files.py [root_directory]

Arguments:
    root_directory: The directory to search (default: current directory '.')

Examples:
    # Search current directory
    python find-untested-files.py

    # Search specific directory
    python find-untested-files.py src/

Output:
    Lists all source files that are missing their corresponding test files.
    If all files have tests, prints a success message.

Notes:
    - Source files: .vue and .ts (but not .test.ts or .d.ts)
    - Test files: .test.ts (same base name as source file)
    - Skips directories: node_modules, .git, dist, build, playwright-report, test-results
    - Ignores: config files (*.config.ts), scripts/, src/router/index.ts, src/main.ts, src/env.d.ts
    - Temporary ignores: src/pages, test/helpers, test/mocks, src/db, seed-data, src/App.vue, src/shared/types (consider tests later)
    - This helps maintain test coverage by identifying files that need tests
"""

import os
import sys
from pathlib import Path
from typing import List
from typing import List


def find_untested_files(root_dir: str) -> List[str]:
    """
    Find source files that don't have colocated test files.

    Args:
        root_dir: Root directory to search

    Returns:
        List of file paths (relative to root_dir) that are missing test files
    """
    untested = []
    root_path = Path(root_dir).resolve()

    # Directories to skip during traversal
    skip_dirs = {'node_modules', '.git', 'dist', 'build', 'playwright-report', 'test-results'}

    # Directories to ignore (don't check for tests)
    ignored_dirs = {'scripts', 'src/pages'}

    # Files to ignore (don't check for tests) - relative paths
    ignored_files = {
        'eslint.config.ts',
        'playwright.config.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'src/router/index.ts',
        'src/main.ts',
        'src/env.d.ts'
    }

    # Temporary ignores (consider adding tests in future)
    temp_ignored_dirs = {'test/helpers', 'test/mocks', 'src/db', 'src/shared/composables/seed-data', 'src/shared/types'}
    temp_ignored_files = {'src/App.vue'}

    for dirpath, dirnames, filenames in os.walk(root_path):
        # Remove directories we want to skip from dirnames to prevent traversal
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]

        # Get relative directory path
        rel_dir = os.path.relpath(dirpath, root_path)

        # Skip ignored directories
        if any(rel_dir == ignored or rel_dir.startswith(ignored + '/') for ignored in ignored_dirs):
            continue
        if any(rel_dir == temp or rel_dir.startswith(temp + '/') for temp in temp_ignored_dirs):
            continue

        for filename in filenames:
            # Check if it's a source file (.vue or .ts but not .test.ts)
            if filename.endswith('.vue') or (filename.endswith('.ts') and not filename.endswith('.test.ts')):
                # Skip .d.ts files
                if filename.endswith('.d.ts'):
                    continue

                # Get relative file path
                rel_file = str(Path(rel_dir) / filename)

                # Skip ignored files
                if rel_file in ignored_files:
                    continue

                # Skip temporarily ignored files
                if rel_file in temp_ignored_files:
                    continue

                # Get the base name without extension
                base_name = filename.rsplit('.', 1)[0]
                # Expected test file name
                test_file = base_name + '.test.ts'

                # Check if test file exists in the same directory
                if test_file not in filenames:
                    untested.append(rel_file)

    return sorted(untested)


def main():
    """Main entry point."""
    # Get root directory from command line or use current directory
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '.'

    if not os.path.isdir(root_dir):
        print(f"Error: '{root_dir}' is not a valid directory")
        sys.exit(1)

    print(f"Searching for untested files in: {os.path.abspath(root_dir)}")
    print("-" * 60)

    untested_files = find_untested_files(root_dir)

    if untested_files:
        print(f"Found {len(untested_files)} files without colocated test files:")
        print()
        for file_path in untested_files:
            print(f"  {file_path}")
        print()
        print("Consider adding .test.ts files for these source files.")
        sys.exit(1)  # Exit with error code to indicate missing tests
    else:
        print("✅ All source files have colocated test files!")
        sys.exit(0)


if __name__ == '__main__':
    main()