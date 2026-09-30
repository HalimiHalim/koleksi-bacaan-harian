# Tajweed colour annotations — V2.4

This directory contains a **presentation layer**, not Quran text. The text in
`quran/pages/*.json` and `quran/surah/*.json` remains authoritative. The reader
loads a page annotation file only when Tajweed Colours is ON. It hashes the
current page text and leaves that page plain if its annotation file does not
match. OFF performs no annotation fetch.

## Source, rights and changes

- Source: [cpfair/quran-tajweed](https://github.com/cpfair/quran-tajweed),
  commit `496f71cd191da00fa2a37ded79dbbddb033bb0ad`, Hafs annotations.
- Annotation license: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
  Credit: cpfair. The original annotation data was transformed into page-token
  ranges; changed Unicode ranges and conflicting graphemes were omitted. The
  source does not endorse this app.
- The source's circa-2017 Tanzil Uthmani text is retained **only for alignment**
  in `tools/tajweed-source/quran-uthmani-2017.txt` under the
  [Tanzil terms](https://tanzil.net/download/). It is never displayed. The
  app's V2.3 Tanzil Uthmani v1.1 text remains the displayed source. The
  downloaded text's CRLF line endings were converted to LF and trailing spaces
  were removed for the repository; every Quran code point and the original
  copyright notice's words are unchanged.
- Pinned source SHA-256 values and the build procedure are in
  `tools/build_tajweed_annotations.py`; the full machine-readable result is
  `alignment-report.json`. Run the script with `--verify` to check every
  generated page file against the pinned source and authoritative Quran data.

## Alignment and fallbacks

The source annotation offsets are half-open **Unicode code-point** positions
within the 2017 verse text. The build maps only code points in exact matching
blocks from that text to the current Tanzil text, then to the current page
tokens. It does not strip marks or normalize either rendered text. Grapheme
clusters are coloured together so marks stay with their base letter.

Of 60,057 source annotations, 59,253 map exactly; 773 touch changed Unicode
or added pause signs, and 31 belong to three verses whose word boundaries
changed. All 804 omissions are explicitly listed in `alignment-report.json`.
Another 273 grapheme clusters have competing rules and remain plain. These
omissions are intentional. They prevent shifted or ambiguous colouring while
preserving every Quran character.

## Rule-to-palette mapping

Granular source rules stay in the JSON. CSS groups related colours:

| Palette class | Source rules | Light colour | Initial suggested colour |
| --- | --- | --- | --- |
| Madd | `madd_2`, `madd_246`, `madd_6`, `madd_munfasil`, `madd_muttasil` | `#3A6FA9` | `#4F86C6` |
| Ghunnah | `ghunnah` | `#347B59` | `#4E9F78` |
| Ikhfa | `ikhfa`, `ikhfa_shafawi` | `#70559C` | `#8B72B8` |
| Idgham | all five `idghaam_*` variants | `#A74373` | `#C85C8E` |
| Iqlab | `iqlab` | `#98611F` | `#D99545` |
| Qalqalah | `qalqalah` | `#A93F3F` | `#C95B5B` |
| Conditional/silent | `hamzat_wasl`, `lam_shamsiyyah`, `silent` | `#686D75` | `#92969D` |

The last class marks source-defined elision or silent categories. A hamzat
al-wasl may be pronounced when starting, so the colour does not imply it is
always silent. The light colours were darkened after visual inspection and
contrast checks: each is at least 4.8:1 against the existing Warm Sepia page
surface, which is darker than the default cream. Midnight uses a separate
lighter mapping in `reader.css`; no new theme system was added.

The colour layer is a reading aid, not a substitute for learning Tajweed from
a qualified teacher. The upstream annotations are not actively maintained.
