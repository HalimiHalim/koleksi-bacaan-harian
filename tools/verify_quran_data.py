#!/usr/bin/env python3
"""Verify the bundled Quran reader data without modifying source text.

Usage: python3 tools/verify_quran_data.py [QURANENC_SQLITE]
The optional SQLite file is the publisher's malay_basumayyah database.
"""
import json
import sqlite3
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
from build_quran_data import page_verse_tokens

ROOT = Path(__file__).resolve().parents[1] / 'quran'
SAJDAH_KEYS = {
    '7:206', '13:15', '16:50', '17:109', '19:58', '22:18', '22:77',
    '25:60', '27:26', '32:15', '38:24', '41:38', '53:62', '84:21', '96:19',
}


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def verify(translation_db=None):
    chapters = read_json(ROOT / 'chapters.json')
    verse_pages = read_json(ROOT / 'verse-pages.json')
    assert len(chapters) == 114
    assert [chapter[0] for chapter in chapters] == list(range(1, 115))

    original = {}
    for line in (ROOT / 'quran-uthmani-v1.1.txt').read_text(encoding='utf-8-sig').splitlines():
        if not line or line.startswith('#'):
            continue
        surah, ayah, arabic = line.split('|', 2)
        key = f'{surah}:{ayah}'
        assert key not in original
        original[key] = arabic
    assert len(original) == 6236

    translations = {}
    for chapter in chapters:
        surah = chapter[0]
        data = read_json(ROOT / 'surah' / f'{surah:03}.json')
        assert data['surah'] == surah
        assert len(data['verses']) == chapter[3]
        for expected_ayah, (ayah, arabic, malay) in enumerate(data['verses'], 1):
            assert ayah == expected_ayah
            key = f'{surah}:{ayah}'
            assert arabic == original[key]
            assert isinstance(malay, str) and malay.strip()
            translations[(surah, ayah)] = malay
    assert len(translations) == 6236

    endings = {}
    page_surahs = {}
    sajdah_keys = set()
    page_words = defaultdict(list)
    basmalas = {}
    kinds = {'word', 'end', 'quarter', 'surah_header', 'bismillah', 'sajdah'}
    for page in range(1, 605):
        data = read_json(ROOT / 'pages' / f'{page:03}.json')
        assert data['page'] == page and data['lines']
        page_surahs[page] = set()
        for line in data['lines']:
            assert line
            for kind, text, key, _ in line:
                assert kind in kinds
                if kind in ('word', 'bismillah'):
                    assert not any(char.isascii() and char.isalnum() for char in text), (page, key, text)
                    assert '&' not in text and '#' not in text, (page, key, text)
                    assert all('ARABIC' in unicodedata.name(char, '') or char in (' ', '\u200c', '\u200d') for char in text), (page, key, text)
                if kind == 'sajdah':
                    assert text == '۩' and key in SAJDAH_KEYS and key not in sajdah_keys
                    sajdah_keys.add(key)
                if kind == 'word':
                    page_words[key].append(text)
                if kind == 'bismillah':
                    assert key == '' and 2 <= _ <= 114 and _ != 9
                    assert _ not in basmalas
                    basmalas[_] = text
                if kind != 'end':
                    continue
                assert key in original and key not in endings
                assert verse_pages[key] == page
                endings[key] = page
                page_surahs[page].add(int(key.split(':')[0]))
    assert set(endings) == set(original) == set(verse_pages)
    assert set(verse_pages.values()) == set(range(1, 605))
    assert page_surahs[604] == {112, 113, 114}
    assert sajdah_keys == SAJDAH_KEYS
    assert set(page_words) == set(original)
    for key, source in original.items():
        surah, ayah = map(int, key.split(':'))
        assert page_words[key] == page_verse_tokens(source, surah, ayah), key
        if ayah == 1 and surah not in (1, 9):
            assert basmalas[surah] == ' '.join(source.split()[:4]), key
    assert set(basmalas) == set(range(2, 115)) - {9}
    assert sum(text.count('ٓ') for words in page_words.values() for text in words) == sum(
        source.count('ٓ') for source in original.values()
    )

    if translation_db:
        connection = sqlite3.connect(translation_db)
        published = {(surah, ayah): text for surah, ayah, text in connection.execute(
            'SELECT sura, aya, translation FROM translations'
        )}
        assert published == translations, 'Bundled Malay text differs from the supplied QuranEnc database'
        connection.close()

    print('PASS: 114 surahs, 6,236 source-aligned page verses, 111 separate basmalas, all source madd marks, 604 pages, 15 sajdah signs')
    if translation_db:
        print('PASS: all 6,236 Malay translations match QuranEnc SQLite verbatim')


if __name__ == '__main__':
    if len(sys.argv) > 2:
        raise SystemExit(__doc__)
    verify(sys.argv[1] if len(sys.argv) == 2 else None)
