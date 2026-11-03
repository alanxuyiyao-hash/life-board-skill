#!/usr/bin/env python3
"""Copy the retained Life Board app into a fresh directory."""
import argparse
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    target = args.output.expanduser().absolute()
    source = Path(__file__).resolve().parents[1] / 'assets' / 'template'
    if target.exists() or target.is_symlink():
        parser.error(f'Output already exists: {target}')
    if source == target or source in target.parents:
        parser.error('Output must be outside the retained template')
    shutil.copytree(source, target)
    print(f'Created Life Board: {target}')
    print('Next: npm ci, npm run build, npm run dev -- --host 127.0.0.1')


if __name__ == '__main__':
    main()
