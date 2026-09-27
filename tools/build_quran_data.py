#!/usr/bin/env python3
"""Build pinned, offline Quran reader files from reviewed upstream snapshots.

Usage: python3 tools/build_quran_data.py TANZIL_TXT QURANENC_MS_JSON QCF4_DIR
The three input snapshots are deliberately explicit: this never fetches live content.
"""
import json
import shutil
import sys
from pathlib import Path


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')


def build(text_file, translation_file, layout_dir):
    root = Path(__file__).resolve().parents[1] / 'quran'
    metadata = json.loads((layout_dir / 'index.json').read_text(encoding='utf-8'))
    translation = json.loads(translation_file.read_text(encoding='utf-8'))
    source_surahs = {number: [] for number in range(1, 115)}
    for line in text_file.read_text(encoding='utf-8-sig').splitlines():
        if not line or line.startswith('#'): continue
        number, ayah, text = line.split('|', 2)
        source_surahs[int(number)].append((int(ayah), text))
    shutil.copyfile(text_file, root / 'quran-uthmani-v1.1.txt')
    chapters = metadata['chapters']
    assert len(source_surahs) == len(translation) == len(chapters) == 114
    verse_keys = set()
    for chapter in chapters:
        number = chapter['id']
        source_verses = source_surahs[number]
        translated = translation[str(number)]
        assert len(source_verses) == len(translated) == chapter['verses_count']
        verses = []
        for (index, arabic), translated_ayah in zip(source_verses, translated):
            assert (translated_ayah['chapter'], translated_ayah['verse']) == (number, index)
            key = f'{number}:{index}'
            assert key not in verse_keys
            verse_keys.add(key)
            verses.append([index, arabic, translated_ayah['text']])
        write(root / 'surah' / f'{number:03}.json', {
            'surah': number,
            'arabicSource': 'Tanzil Uthmani v1.1, CC BY 3.0 — see quran/SOURCES.md',
            'translationSource': 'QuranEnc Malay Basumayyah v1.0.0 — see quran/SOURCES.md',
            'verses': verses,
        })
    assert len(verse_keys) == 6236

    page_ends = set()
    verse_pages = {}
    for page_number in range(1, 605):
        original = json.loads((layout_dir / 'pages' / f'{page_number:03}.json').read_text(encoding='utf-8'))
        assert original['page'] == page_number
        lines = []
        for line in original['lines']:
            words = []
            for word in line['words']:
                kind = word['type']
                assert kind in ('word', 'end', 'quarter', 'surah_header', 'bismillah')
                key = word.get('verse_key', '')
                if kind == 'end':
                    assert key in verse_keys and key not in page_ends
                    page_ends.add(key)
                    verse_pages[key] = page_number
                words.append([kind, word['text'], key, word.get('sura', 0)])
            lines.append(words)
        write(root / 'pages' / f'{page_number:03}.json', {'page': page_number, 'lines': lines})
    assert page_ends == verse_keys, 'Each verse must have exactly one page-end marker'
    write(root / 'verse-pages.json', verse_pages)
    write(root / 'chapters.json', [
        [c['id'], c['name'], c['name_arabic'], c['verses_count'], c['pages'][0], c['pages'][1], c['revelation_place']]
        for c in chapters
    ])
    print(f'Built 114 surahs, {len(verse_keys)} verses, 604 pages')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    build(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
