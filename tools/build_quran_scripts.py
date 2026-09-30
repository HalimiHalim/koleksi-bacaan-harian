#!/usr/bin/env python3
"""Package immutable Tanzil Simple v1.1 by surah; verify identities and pages.

Run normally to build, or --verify to check every derived byte without writes.
No text normalization, diacritic removal, or Uthmani conversion is performed.
"""
import argparse
import hashlib
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'quran'
SIMPLE = ROOT / 'scripts' / 'simple'
SOURCE_HASH = 'c8c2ea9e004cf3f4b7afc5ba00de859556f4ed09bd9cf5d1bc79e877406ef678'
SOURCE_URL = 'https://tanzil.net/pub/download/index.php?quranType=simple&outType=txt-2&marks=true&sajdah=true&tatweel=true&agree=true'


def parse(path):
    verses = {}
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        if not line or line.startswith('#'):
            continue
        surah, ayah, text = line.split('|', 2)
        key = f'{surah}:{ayah}'
        assert key not in verses, ('duplicate', key)
        assert text and text == text.strip(), ('empty/whitespace', key)
        assert all(c == ' ' or 'ARABIC' in unicodedata.name(c, '') for c in text), ('unicode', key)
        verses[key] = text
    return verses


def encode(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n'


def build(verify=False):
    raw = SIMPLE / 'quran-simple-v1.1.txt'
    assert hashlib.sha256(raw.read_bytes()).hexdigest() == SOURCE_HASH
    source = raw.read_text()
    notice = source[source.index('# PLEASE DO NOT REMOVE'):]
    assert 'Simple, Version 1.1' in notice and 'Creative Commons Attribution 3.0' in notice
    simple = parse(raw)
    uthmani = parse(ROOT / 'quran-uthmani-v1.1.txt')
    chapters = json.loads((ROOT / 'chapters.json').read_text())
    expected = [f'{s}:{a}' for s, _, _, count, *_ in chapters for a in range(1, count + 1)]
    assert list(simple) == list(uthmani) == expected and len(expected) == 6236
    outputs = {}
    basmalahs = {}
    for s, _, _, count, *_ in chapters:
        text = simple[f'{s}:1']
        basmalah = ' '.join(text.split(' ')[:4]) if s not in (1, 9) else None
        if basmalah:
            # Two source forms: surahs 95/97 retain their actual initial shadda.
            assert basmalah in (simple['1:1'], 'بِّسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ')
            assert text.startswith(basmalah + ' ') and text[len(basmalah) + 1:]
            basmalahs[str(s)] = basmalah
        outputs[SIMPLE / 'surah' / f'{s:03}.json'] = encode({
            'source': 'Tanzil Simple (Imla’ei), v1.1', 'copyrightNotice': notice,
            'surah': s, 'bismillah': basmalah,
            'verses': [[a, simple[f'{s}:{a}']] for a in range(1, count + 1)]})
    mapping = json.loads((ROOT / 'verse-pages.json').read_text())
    page_keys = []
    page_reports = []
    headers = []
    for n in range(1, 605):
        page = json.loads((ROOT / 'pages' / f'{n:03}.json').read_text())
        tokens = sum(page['lines'], [])
        keys = [key for kind, _, key, _ in tokens if kind == 'end']
        assert keys and all(mapping[k] == n for k in keys)
        page_keys.extend(keys)
        headers.extend(s for kind, _, _, s in tokens if kind == 'surah_header')
        for kind, _, _, s in tokens:
            if kind == 'bismillah':
                assert str(s) in basmalahs and f'{s}:1' in keys
        page_reports.append({'page': n, 'verseKeys': keys})
    assert page_keys == expected and headers == list(range(1, 115))
    assert set(mapping) == set(expected)
    sajdahs = [k for k, t in simple.items() if '۩' in t]
    assert sajdahs == [k for k, t in uthmani.items() if '۩' in t] and len(sajdahs) == 15
    assert sum(t.count('۩') for t in simple.values()) == 15
    assert not any('۝' in t or any(c.isdigit() for c in t) for t in simple.values())
    report = {
        'sourceUrl': SOURCE_URL, 'retrieved': '2026-09-30', 'simpleSourceSha256': SOURCE_HASH,
        'scripts': {name: {'surahs': 114, 'verses': len(data), 'missing': [], 'duplicates': [],
                          'empty': [], 'unicodeAnomalies': [], 'malformed': [], 'identityMismatches': []}
                    for name, data in [('uthmani', uthmani), ('simple', simple)]},
        'simpleRepresentation': 'Tanzil Simple (Imla’ei), v1.1, with diacritics',
        'separateIntroBasmalahs': len(basmalahs),
        'initialShaddaBasmalahs': [95, 97], 'sajdahVerseKeys': sajdahs,
        'unicode': {f'U+{ord(c):04X}': unicodedata.name(c, '') for c in sorted(set(''.join(simple.values())))},
        'pageMapping': 'Existing verse-pages/end-marker identity; whole verses, never QCF word substitution',
        'pages': page_reports,
        'derivedSurahBytes': sum(len(b.encode()) for b in outputs.values()),
        'rawSourceBytes': raw.stat().st_size,
        'tajweed': {'uthmani': 'existing exact mapping', 'simple': 'unsupported'},
        'indopak': 'deferred; no assets/runtime/UI included'}
    outputs[ROOT / 'scripts' / 'script-alignment-report.json'] = encode(report)
    for path, content in outputs.items():
        if verify:
            assert path.read_bytes() == content.encode(), ('derived mismatch', path)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    print(f'PASS: both scripts 114/6236; 604 page mappings; {len(basmalahs)} intro basmalahs; 15 sajdah signs; exact immutable Simple text')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify', action='store_true')
    build(parser.parse_args().verify)
