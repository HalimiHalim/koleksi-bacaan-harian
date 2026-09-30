(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = $('allday-view');
  if (!root) return;
  const stateKey = 'uwa-quran-reader-v1';
  const tajweedKey = 'uwa-quran-tajweed-v1';
  const tajweedClasses = {
    ghunnah:'ghunnah', hamzat_wasl:'silent', lam_shamsiyyah:'silent', silent:'silent',
    idghaam_ghunnah:'idgham', idghaam_no_ghunnah:'idgham',
    idghaam_mutajanisayn:'idgham', idghaam_mutaqaribayn:'idgham', idghaam_shafawi:'idgham',
    ikhfa:'ikhfa', ikhfa_shafawi:'ikhfa', iqlab:'iqlab', qalqalah:'qalqalah',
    madd_2:'madd', madd_246:'madd', madd_6:'madd',
    madd_munfasil:'madd', madd_muttasil:'madd'
  };
  let chapters = [];
  let surah = 0;
  let mode = 'list';
  let page = 1;
  let state = { last: null, bookmarks: [], mode: 'list', script: 'uthmani' };
  let requestId = 0;
  let versePages = null;
  let tajweedOn = false;
  const arabicDigits = (number) => String(number).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const path = (folder, number) => `./quran/${folder}/${String(number).padStart(3, '0')}.json${folder === 'pages' ? '?v=20' : ''}`;

  try {
    const saved = JSON.parse(localStorage.getItem(stateKey));
    if (saved && typeof saved === 'object') {
      state.last = saved.last && Number.isInteger(saved.last.surah) ? saved.last : null;
      state.bookmarks = Array.isArray(saved.bookmarks) ? saved.bookmarks.filter(key => /^\d{1,3}:\d{1,3}$/.test(key)) : [];
      state.mode = ['list', 'page'].includes(saved.mode) ? saved.mode : state.last?.mode === 'page' ? 'page' : 'list';
      state.script = saved.script === 'simple' ? 'simple' : 'uthmani';
    }
  } catch (error) {}
  try { tajweedOn = localStorage.getItem(tajweedKey) === 'on'; } catch (error) {}
  function updateTajweedButtons() {
    $('quran-tajweed-off').setAttribute('aria-pressed', String(!tajweedOn));
    $('quran-tajweed-on').setAttribute('aria-pressed', String(tajweedOn));
    const unsupported = state.script !== 'uthmani';
    $('quran-tajweed-off').disabled = unsupported;
    $('quran-tajweed-on').disabled = unsupported;
    $('quran-tajweed-note').hidden = !unsupported;
    for (const script of ['uthmani', 'simple']) {
      $(`quran-script-${script}`).setAttribute('aria-pressed', String(state.script === script));
    }
  }
  updateTajweedButtons();
  function save() { try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch (error) {} }
  function setStatus(message, target = 'quran-reader-status') { $(target).textContent = message; }
  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  // Script data is keyed by stable ayah identities, never by Uthmani character
  // offsets or QCF word positions. Keep a small, lazy per-surah memory cache.
  const simpleChapters = new Map();
  async function simpleChapter(number) {
    if (simpleChapters.has(number)) return simpleChapters.get(number);
    const data = await getJson(`./quran/scripts/simple/surah/${String(number).padStart(3, '0')}.json`);
    if (data.surah !== number || data.verses?.length !== chapter(number)?.[3] ||
        data.verses.some(([ayah, text], i) => ayah !== i + 1 || typeof text !== 'string' || !text)) {
      throw new Error('Invalid script identities');
    }
    simpleChapters.set(number, data);
    if (simpleChapters.size > 8) simpleChapters.delete(simpleChapters.keys().next().value);
    return data;
  }
  async function selectedChapter(number, script = state.script) {
    const original = await getJson(path('surah', number));
    if (script === 'uthmani') return original;
    const simple = await simpleChapter(number);
    return { ...original, verses: original.verses.map(([ayah, , meaning]) => [ayah, simple.verses[ayah - 1][1], meaning]) };
  }
  function simpleVerse(data, ayah) {
    const text = data.verses[ayah - 1][1];
    if (ayah !== 1 || !data.bismillah) return text;
    if (!text.startsWith(data.bismillah + ' ')) throw new Error('Invalid basmalah');
    // Display the original prefix as a separate structural block; the stored
    // source verse remains complete and unchanged, including 95/97's shadda.
    return text.slice(data.bismillah.length + 1);
  }
  function chapter(number) { return chapters[number - 1]; }
  function showArea(area) {
    if (area !== 'reader') closeSettings();
    $('quran-routine').hidden = area !== 'routine';
    $('quran-library').hidden = area !== 'library';
    $('quran-reader').hidden = area !== 'reader';
    root.querySelector('.quran-tabs').hidden = area === 'reader';
    $('quran-tab-routine').setAttribute('aria-pressed', String(area === 'routine'));
    $('quran-tab-library').setAttribute('aria-pressed', String(area !== 'routine'));
    document.body.classList.toggle('quran-explore', area !== 'routine');
    document.body.classList.toggle('quran-reading', area === 'reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderContinue() {
    const last = state.last;
    const button = $('quran-continue');
    if (!last || !chapter(last.surah)) { button.hidden = true; return; }
    button.hidden = false;
    button.replaceChildren();
    const lead = document.createElement('strong');
    lead.textContent = `Sambung bacaan · ${chapter(last.surah)[1]}`;
    const sub = document.createElement('small');
    sub.textContent = last.mode === 'page' ? `Halaman ${last.page || chapter(last.surah)[4]}` : `Ayat ${last.ayah || 1}`;
    button.append(lead, sub);
  }
  function renderChapters(query = '') {
    const list = $('quran-surah-list');
    const q = query.trim().toLocaleLowerCase();
    list.replaceChildren();
    for (const item of chapters) {
      if (q && !`${item[0]} ${item[1]} ${item[2]}`.toLocaleLowerCase().includes(q)) continue;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'quran-surah';
      button.dataset.surah = item[0];
      const number = document.createElement('span'); number.className = 'quran-surah-number'; number.textContent = item[0];
      const detail = document.createElement('span');
      const name = document.createElement('span'); name.className = 'quran-surah-name'; name.textContent = item[1];
      const meta = document.createElement('span'); meta.className = 'quran-surah-meta'; meta.textContent = `${item[3]} ayat · halaman ${item[4]}`;
      detail.append(name, meta);
      const arabic = document.createElement('span'); arabic.className = 'quran-surah-arabic'; arabic.lang = 'ar'; arabic.dir = 'rtl'; arabic.textContent = item[2];
      button.append(number, detail, arabic); list.append(button);
    }
    setStatus(list.childElementCount ? '' : 'Tiada surah ditemui.', 'quran-library-status');
  }
  async function loadChapters() {
    if (chapters.length) return;
    try {
      setStatus('Memuatkan senarai surah…', 'quran-library-status');
      chapters = await getJson('./quran/chapters.json');
      if (chapters.length !== 114) throw new Error('Incomplete index');
      renderChapters($('quran-search').value);
      renderContinue();
    } catch (error) {
      setStatus('Senarai surah belum tersedia. Sambung internet dan buka semula tab ini.', 'quran-library-status');
    }
  }
  function updateLast(ayah = 1) {
    state.last = { surah, ayah, mode, page };
    save(); renderContinue();
  }
  function setMode(next) {
    mode = next;
    state.mode = next;
    save();
    $('quran-list-mode').setAttribute('aria-pressed', String(mode === 'list'));
    $('quran-page-mode').setAttribute('aria-pressed', String(mode === 'page'));
    $('quran-list-panel').hidden = mode !== 'list';
    $('quran-page-panel').hidden = mode !== 'page';
  }
  async function openSurah(number, resume = false, requestedMode = null) {
    if (!chapter(number)) return;
    surah = number;
    const last = state.last;
    const token = ++requestId;
    const item = chapter(number);
    $('quran-reader-title').textContent = item[1];
    $('quran-reader-arabic-title').textContent = item[2];
    $('quran-reader-meta').textContent = `Surah ${number} · ${item[3]} ayat · ${item[6] === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'}`;
    page = resume && last?.surah === number && Number.isInteger(last.page) ? Math.max(1, Math.min(604, last.page)) : item[4];
    setMode(requestedMode || state.mode);
    $('quran-verse-list').replaceChildren(); $('quran-mushaf-page').replaceChildren();
    showArea('reader');
    setStatus('Memuatkan ayat…');
    if (mode === 'page') { await renderPage(token, resume ? last?.ayah : null); return; }
    try {
      const data = await selectedChapter(number);
      if (token !== requestId) return;
      const fragment = document.createDocumentFragment();
      if (number !== 1 && number !== 9) {
        const first = data.verses[0][1].split(' ');
        const basmala = document.createElement('p');
        basmala.className = 'quran-list-bismillah'; basmala.lang = 'ar'; basmala.dir = 'rtl';
        basmala.textContent = first.slice(0, 4).join(' ');
        fragment.append(basmala);
      }
      for (const [ayah, arabic, translation] of data.verses) {
        const article = document.createElement('article'); article.className = 'quran-verse'; article.id = `quran-ayah-${ayah}`; article.dataset.ayah = ayah;
        const head = document.createElement('div'); head.className = 'quran-verse-head';
        const ref = document.createElement('strong'); ref.className = 'quran-verse-ref'; ref.textContent = `${number}:${ayah}`;
        const bookmark = document.createElement('button'); bookmark.type = 'button'; bookmark.className = 'quran-bookmark'; bookmark.dataset.bookmark = `${number}:${ayah}`;
        bookmark.setAttribute('aria-pressed', String(state.bookmarks.includes(bookmark.dataset.bookmark)));
        bookmark.textContent = state.bookmarks.includes(bookmark.dataset.bookmark) ? '★ Disimpan' : '☆ Simpan';
        head.append(ref, bookmark);
        const ar = document.createElement('p'); ar.className = 'quran-verse-arabic'; ar.lang = 'ar'; ar.dir = 'rtl';
        ar.textContent = ayah === 1 && number !== 1 && number !== 9 ? arabic.split(' ').slice(4).join(' ') : arabic;
        const ms = document.createElement('p'); ms.className = 'quran-verse-translation'; ms.lang = 'ms'; ms.textContent = translation;
        article.append(head, ar, ms); fragment.append(article);
      }
      $('quran-verse-list').replaceChildren(fragment);
      setStatus('');
      const ayah = resume && last?.surah === number ? last.ayah || 1 : 1;
      updateLast(ayah);
      if (resume && ayah > 1) {
        const current = $(`quran-ayah-${ayah}`);
        current?.classList.add('is-current');
        requestAnimationFrame(() => current?.scrollIntoView({ block: 'start' }));
      }
    } catch (error) { if (token === requestId) setStatus('Ayat belum tersedia. Semak sambungan internet dan cuba buka surah ini semula.'); }
  }
  async function verifiedTajweed(data, annotation) {
    if (!annotation || annotation.page !== data.page || !Array.isArray(annotation.tokens) ||
        !/^[a-f0-9]{64}$/.test(annotation.textHash) || !globalThis.crypto?.subtle) return null;
    const material = data.lines.flat().map(([kind, text, key]) => `${kind}\u0001${text}\u0001${key}`).join('\u0000');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));
    const actual = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    if (actual !== annotation.textHash) return null;
    const tokens = new Map();
    for (const [line, item, segments] of annotation.tokens) {
      const token = data.lines[line]?.[item];
      if (!token || !['word', 'bismillah'].includes(token[0]) || !Array.isArray(segments)) return null;
      const length = Array.from(token[1]).length;
      let previous = 0;
      for (const [start, end, rule] of segments) {
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < previous ||
            end <= start || end > length || !Object.prototype.hasOwnProperty.call(tajweedClasses, rule)) return null;
        previous = end;
      }
      const key = `${line}:${item}`;
      if (tokens.has(key)) return null;
      tokens.set(key, segments);
    }
    return tokens;
  }
  function appendTajweed(span, word, segments) {
    const characters = Array.from(word);
    let previous = 0;
    for (const [start, end, rule] of segments) {
      if (start > previous) span.append(document.createTextNode(characters.slice(previous, start).join('')));
      const colour = document.createElement('span');
      colour.className = `tajweed-${tajweedClasses[rule]}`;
      colour.textContent = characters.slice(start, end).join('');
      span.append(colour);
      previous = end;
    }
    if (previous < characters.length) span.append(document.createTextNode(characters.slice(previous).join('')));
    if (span.textContent !== word) span.textContent = word;
  }
  async function renderPage(token = ++requestId, preferredAyah = null) {
    if (state.script === 'simple') return renderSimplePage(token, preferredAyah);
    const sheet = $('quran-mushaf-page');
    sheet.replaceChildren();
    $('quran-page-counter-bottom').textContent = `${page} / 604`;
    $('quran-prev-page-bottom').disabled = page === 1;
    $('quran-next-page-bottom').disabled = page === 604;
    setStatus(`Memuatkan halaman ${page}…`);
    try {
      const requestedPage = page;
      const annotationPromise = tajweedOn
        ? getJson(`./quran/tajweed/pages/${String(requestedPage).padStart(3, '0')}.json?v=24`).catch(() => null)
        : Promise.resolve(null);
      const data = await getJson(path('pages', requestedPage));
      const annotation = await annotationPromise;
      const tajweedTokens = tajweedOn ? await verifiedTajweed(data, annotation).catch(() => null) : null;
      if (token !== requestId || mode !== 'page') return;
      const verseKeys = data.lines.flatMap(line => line.map(([, , key]) => key).filter(key => /^\d+:\d+$/.test(key)));
      const pageSurahs = [...new Set(verseKeys.map(key => Number(key.split(':')[0])))];
      if (!pageSurahs.length) throw new Error('Page has no verses');
      if (!pageSurahs.includes(surah)) surah = pageSurahs[0];
      const names = pageSurahs.map(number => chapter(number)?.[1]).filter(Boolean);
      $('quran-reader-title').textContent = pageSurahs.length === 1 ? names[0] : `Halaman ${page}`;
      $('quran-reader-arabic-title').textContent = pageSurahs.map(number => chapter(number)?.[2]).filter(Boolean).join(' · ');
      $('quran-reader-meta').textContent = `Halaman ${page} · ${names.join(' · ')}`;
      const fragment = document.createDocumentFragment();
      // The few pages with under 100 words should not stretch like a dense page.
      const wordCount = data.lines.flat().filter(([kind]) => kind === 'word').length;
      sheet.classList.toggle('is-compact', wordCount < 100);
      let flow = null;
      let hasFlowToken = false;
      for (const [lineIndex, items] of data.lines.entries()) {
        const type = items[0]?.[0];
        const structural = type === 'surah_header' || type === 'bismillah';
        let line = null;
        if (structural) {
          flow = null;
          hasFlowToken = false;
          line = document.createElement('div');
          line.className = `quran-page-line ${type === 'surah_header' ? 'quran-page-heading' : 'quran-page-bismillah'}`;
          fragment.append(line);
        } else if (!flow) {
          flow = document.createElement('div');
          flow.className = 'quran-page-flow';
          fragment.append(flow);
        }
        for (const [itemIndex, [kind, word, verseKey, suraNumber]] of items.entries()) {
          let node;
          if (kind === 'surah_header') {
            node = document.createElement('span');
            node.textContent = `سُورَةُ ${chapter(suraNumber)?.[2] || word}`;
          } else if (kind === 'end') {
            const marker = document.createElement('span'); marker.className = 'quran-verse-marker';
            marker.setAttribute('aria-label', `Akhir ayat ${verseKey}`);
            const ayahNumber = Number(verseKey.split(':')[1]);
            if (ayahNumber >= 100) marker.classList.add('three-digit');
            const digit = document.createElement('span'); digit.textContent = arabicDigits(ayahNumber);
            marker.append(digit); node = marker;
          } else {
            const span = document.createElement('span');
            span.className = kind === 'quarter' ? 'quran-page-quarter' : kind === 'sajdah' ? 'quran-page-sajdah' : 'quran-page-word';
            const segments = tajweedTokens?.get(`${lineIndex}:${itemIndex}`);
            if (segments && (kind === 'word' || kind === 'bismillah')) appendTajweed(span, word, segments);
            else span.textContent = kind === 'quarter' ? '۞' : word;
            if (kind === 'quarter') span.setAttribute('aria-label', 'Tanda suku hizb');
            if (kind === 'sajdah') span.setAttribute('aria-label', 'Tanda sujud tilawah');
            node = span;
          }
          if (structural) line.append(node);
          else {
            const previous = kind === 'end' ? flow.lastElementChild : null;
            if (previous) {
              const pair = document.createElement('span');
              pair.className = 'quran-verse-end-pair';
              flow.replaceChild(pair, previous);
              pair.append(previous, document.createTextNode(' '), node);
            } else {
              if (hasFlowToken) flow.append(document.createTextNode(' '));
              flow.append(node);
            }
            hasFlowToken = true;
          }
        }
      }
      const folio = document.createElement('div'); folio.className = 'quran-page-folio'; folio.textContent = arabicDigits(page);
      fragment.append(folio); sheet.replaceChildren(fragment);
      const firstKey = verseKeys.find(key => key.startsWith(`${surah}:`));
      const savedKey = `${surah}:${preferredAyah}`;
      const currentAyah = preferredAyah && verseKeys.includes(savedKey) ? preferredAyah : Number(firstKey.split(':')[1]);
      setStatus(tajweedOn && !tajweedTokens ? 'Warna Tajweed tidak tersedia untuk halaman ini; teks asal dipaparkan.' : '');
      updateLast(currentAyah);
    } catch (error) { if (token === requestId) setStatus('Halaman belum tersedia. Semak sambungan internet dan cuba lagi.'); }
  }
  async function renderSimplePage(token, preferredAyah) {
    const sheet = $('quran-mushaf-page');
    sheet.replaceChildren();
    const requestedPage = page;
    $('quran-page-counter-bottom').textContent = `${page} / 604`;
    $('quran-prev-page-bottom').disabled = page === 1;
    $('quran-next-page-bottom').disabled = page === 604;
    setStatus(`Memuatkan halaman ${page}…`);
    try {
      const data = await getJson(path('pages', requestedPage));
      // End markers are the app's authoritative verse-to-page identity map.
      // Whole Simple verses belong to that page; no QCF word alignment implied.
      const items = data.lines.flat();
      const keys = items.filter(([kind]) => kind === 'end').map(([, , key]) => key);
      const numbers = [...new Set(keys.map(key => Number(key.split(':')[0])))];
      const scripts = new Map(await Promise.all(numbers.map(async number => [number, await simpleChapter(number)])));
      if (token !== requestId || mode !== 'page' || state.script !== 'simple') return;
      if (!numbers.includes(surah)) surah = numbers[0];
      const names = numbers.map(number => chapter(number)[1]);
      $('quran-reader-title').textContent = numbers.length === 1 ? names[0] : `Halaman ${page}`;
      $('quran-reader-arabic-title').textContent = numbers.map(number => chapter(number)[2]).join(' · ');
      $('quran-reader-meta').textContent = `Halaman ${page} · ${names.join(' · ')}`;
      const fragment = document.createDocumentFragment();
      sheet.classList.toggle('is-compact', keys.reduce((count, key) => {
        const [s, a] = key.split(':').map(Number);
        return count + simpleVerse(scripts.get(s), a).split(' ').length;
      }, 0) < 100);
      let flow = null;
      for (const [kind, word, key, number] of items) {
        if (kind === 'surah_header' || kind === 'bismillah') {
          flow = null;
          const line = document.createElement('div');
          line.className = `quran-page-line ${kind === 'surah_header' ? 'quran-page-heading' : 'quran-page-bismillah'}`;
          const span = document.createElement('span');
          span.textContent = kind === 'surah_header'
            ? `سُورَةُ ${chapter(number)?.[2] || word}` : scripts.get(number).bismillah;
          line.append(span); fragment.append(line);
        } else if (kind === 'end') {
          if (!flow) {
            flow = document.createElement('div'); flow.className = 'quran-page-flow'; fragment.append(flow);
          }
          const [s, a] = key.split(':').map(Number);
          const verse = document.createElement('span');
          verse.className = 'quran-simple-verse'; verse.dataset.verseKey = key;
          const words = simpleVerse(scripts.get(s), a).split(' ');
          const last = words.pop();
          if (words.length) verse.append(document.createTextNode(words.join(' ') + ' '));
          const pair = document.createElement('span'); pair.className = 'quran-verse-end-pair';
          pair.append(document.createTextNode(last + ' '));
          const marker = document.createElement('span'); marker.className = 'quran-verse-marker';
          if (a >= 100) marker.classList.add('three-digit');
          marker.setAttribute('aria-label', `Akhir ayat ${key}`);
          const digit = document.createElement('span'); digit.textContent = arabicDigits(a);
          marker.append(digit); pair.append(marker); verse.append(pair);
          if (flow.childNodes.length) flow.append(document.createTextNode(' '));
          flow.append(verse);
        }
      }
      const folio = document.createElement('div'); folio.className = 'quran-page-folio'; folio.textContent = arabicDigits(page);
      fragment.append(folio); sheet.replaceChildren(fragment);
      const current = `${surah}:${preferredAyah}`;
      const first = keys.find(key => key.startsWith(`${surah}:`));
      setStatus('');
      updateLast(preferredAyah && keys.includes(current) ? preferredAyah : Number(first.split(':')[1]));
    } catch (error) {
      if (token === requestId) setStatus('Halaman belum tersedia. Semak sambungan internet dan cuba lagi.');
    }
  }
  let scriptSwitchPending = false;
  async function switchScript(next) {
    if (!['uthmani', 'simple'].includes(next) || !surah) return;
    if (next === state.script) {
      if (scriptSwitchPending) { ++requestId; scriptSwitchPending = false; setStatus(''); }
      return;
    }
    scriptSwitchPending = true;
    const token = ++requestId;
    const ayah = state.last?.ayah || 1;
    const anchor = mode === 'list' ? [...$('quran-verse-list').querySelectorAll('.quran-verse')]
      .find(node => node.getBoundingClientRect().bottom > 80) : null;
    const anchorTop = anchor?.getBoundingClientRect().top;
    setStatus('Memuatkan script…');
    try {
      let listData;
      if (mode === 'list') listData = await selectedChapter(surah, next);
      else if (next === 'simple') {
        const data = await getJson(path('pages', page));
        const numbers = [...new Set(data.lines.flat().filter(([kind]) => kind === 'end').map(([, , key]) => Number(key.split(':')[0])))];
        await Promise.all(numbers.map(simpleChapter));
      }
      if (token !== requestId) return;
      state.script = next; save(); updateTajweedButtons();
      if (mode === 'page') await renderPage(token, ayah);
      else if (!$('quran-verse-list').querySelector('.quran-verse')) await openSurah(surah, true, 'list');
      else {
        const first = listData.verses[0][1].split(' ');
        const basmalah = $('quran-verse-list').querySelector('.quran-list-bismillah');
        if (basmalah) basmalah.textContent = first.slice(0, 4).join(' ');
        for (const [a, text] of listData.verses) {
          $(`quran-ayah-${a}`).querySelector('.quran-verse-arabic').textContent =
            a === 1 && surah !== 1 && surah !== 9 ? text.split(' ').slice(4).join(' ') : text;
        }
        setStatus('');
        if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - anchorTop);
      }
    } catch (error) {
      if (token === requestId) setStatus('Script belum tersedia. Sambung internet dan cuba lagi.');
    } finally {
      if (token === requestId) scriptSwitchPending = false;
    }
  }
  async function switchMode(next) {
    if (!surah || next === mode) return;
    const token = ++requestId; setMode(next);
    window.scrollTo(0, 0);
    if (next === 'page') {
      try {
        versePages ||= await getJson('./quran/verse-pages.json');
        page = versePages[`${surah}:${state.last?.ayah || 1}`] || chapter(surah)[4];
      } catch (error) { page = chapter(surah)[4]; }
      if (token !== requestId || mode !== 'page') return;
      await renderPage(token, state.last?.ayah);
    } else { await openSurah(surah, true, 'list'); }
  }

  $('quran-tab-routine').addEventListener('click', () => showArea('routine'));
  $('quran-tab-library').addEventListener('click', () => { showArea('library'); loadChapters(); });
  $('quran-back').addEventListener('click', () => { ++requestId; showArea('library'); });
  $('quran-search').addEventListener('input', event => renderChapters(event.target.value));
  $('quran-surah-list').addEventListener('click', event => { const button = event.target.closest('[data-surah]'); if (button) openSurah(Number(button.dataset.surah)); });
  $('quran-continue').addEventListener('click', () => { if (state.last) openSurah(state.last.surah, true); });
  const settings = $('quran-settings');
  const settingsToggle = $('quran-settings-toggle');
  function closeSettings(returnFocus = false) {
    settings.hidden = true;
    settingsToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) settingsToggle.focus();
  }
  settingsToggle.addEventListener('click', () => {
    const opening = settings.hidden;
    settings.hidden = !opening;
    settingsToggle.setAttribute('aria-expanded', String(opening));
    if (opening) $('quran-settings-close').focus();
  });
  $('quran-settings-close').addEventListener('click', () => closeSettings(true));
  document.addEventListener('click', event => {
    if (!event.target.closest('.quran-settings-control') && !settings.hidden) closeSettings();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !settings.hidden) closeSettings(true);
  });
  $('quran-list-mode').addEventListener('click', () => switchMode('list'));
  $('quran-page-mode').addEventListener('click', () => switchMode('page'));
  for (const script of ['uthmani', 'simple']) {
    $(`quran-script-${script}`).addEventListener('click', () => switchScript(script));
  }
  for (const [id, enabled] of [['quran-tajweed-off', false], ['quran-tajweed-on', true]]) {
    $(id).addEventListener('click', () => {
      if (state.script !== 'uthmani' || tajweedOn === enabled) return;
      tajweedOn = enabled;
      try { localStorage.setItem(tajweedKey, enabled ? 'on' : 'off'); } catch (error) {}
      updateTajweedButtons();
      if (mode === 'page' && !$('quran-page-panel').hidden) renderPage();
    });
  }
  $('quran-translation-toggle').addEventListener('click', () => {
    const hidden = $('quran-list-panel').classList.toggle('quran-hide-translation');
    $('quran-translation-toggle').setAttribute('aria-pressed', String(!hidden));
    $('quran-translation-toggle').textContent = hidden ? 'Terjemahan Melayu' : 'Terjemahan Melayu ✓';
  });
  for (const id of ['quran-prev-page-bottom', 'quran-next-page-bottom']) {
    $(id).addEventListener('click', () => {
      page = Math.max(1, Math.min(604, page + (id.includes('prev') ? -1 : 1)));
      renderPage();
    });
  }
  $('quran-verse-list').addEventListener('click', event => {
    const bookmark = event.target.closest('[data-bookmark]');
    if (bookmark) {
      const key = bookmark.dataset.bookmark;
      state.bookmarks = state.bookmarks.includes(key) ? state.bookmarks.filter(item => item !== key) : [...state.bookmarks, key];
      bookmark.setAttribute('aria-pressed', String(state.bookmarks.includes(key)));
      bookmark.textContent = state.bookmarks.includes(key) ? '★ Disimpan' : '☆ Simpan'; save();
    }
    const verse = event.target.closest('[data-ayah]');
    if (verse) {
      $('quran-verse-list').querySelector('.is-current')?.classList.remove('is-current');
      verse.classList.add('is-current'); updateLast(Number(verse.dataset.ayah));
    }
  });
})();
