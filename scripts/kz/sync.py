"""Stamp shared partials into every redesigned page.

Each page marks shared blocks with comments, e.g.
    <!-- kz:header --> ... <!-- /kz:header -->
This script replaces everything between a marker pair with the matching file
in scripts/kz/partials/<name>.html. Edit the partial, then run:

    python3 scripts/kz/sync.py            # every page
    python3 scripts/kz/sync.py faq/index.html  # just these pages
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
PARTIALS = ROOT / 'scripts' / 'kz' / 'partials'
SKIP = ('node_modules', 'liveplayers-app', '.extracted', '.git', 'scripts/kz')
BLOCK = re.compile(r'(<!-- kz:([a-z-]+) -->)(.*?)(<!-- /kz:\2 -->)', re.S)


def main():
    partials = {p.stem: p.read_text() for p in PARTIALS.glob('*.html')}
    changed = 0
    only = {(ROOT / a).resolve() for a in sys.argv[1:]}
    for page in sorted(ROOT.rglob('*.html')):
        if only and page.resolve() not in only:
            continue
        rel = page.relative_to(ROOT).as_posix()
        if any(s in rel for s in SKIP):
            continue
        text = page.read_text()
        if '<!-- kz:' not in text:
            continue

        def swap(m):
            name = m.group(2)
            if name not in partials:
                raise SystemExit(f'{rel}: no partial named {name}')
            return f'{m.group(1)}\n{partials[name].rstrip()}\n{m.group(4)}'

        new = BLOCK.sub(swap, text)
        if new != text:
            page.write_text(new)
            changed += 1
            print('updated', rel)
    print(f'{changed} page(s) updated')


if __name__ == '__main__':
    main()
