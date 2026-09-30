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
  let state = { last: null, bookmarks: [], mode: 'list' };
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
    }
  } catch (error) {}
  try { tajweedOn = localStorage.getItem(tajweedKey) === 'on'; } catch (error) {}
  function updateTajweedButtons() {
    $('quran-tajweed-off').setAttribute('aria-pressed', String(!tajweedOn));
    $('quran-tajweed-on').setAttribute('aria-pressed', String(tajweedOn));
  }
  updateTajweedButtons();
  function save() { try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch (error) {} }
  function setStatus(message, target = 'quran-reader-status') { $(target).textContent = message; }
  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
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
      const data = await getJson(path('surah', number));
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
      for (const [lineIndex, items] of data.lines.entries()) {
        const line = document.createElement('div'); line.className = 'quran-page-line';
        const type = items[0]?.[0];
        if (type === 'surah_header') line.classList.add('quran-page-heading');
        if (type === 'bismillah') line.classList.add('quran-page-bismillah');
        for (const [itemIndex, [kind, word, verseKey, suraNumber]] of items.entries()) {
          if (kind === 'surah_header') {
            const heading = document.createElement('span');
            heading.textContent = `سُورَةُ ${chapter(suraNumber)?.[2] || word}`;
            line.append(heading);
          } else if (kind === 'end') {
            const marker = document.createElement('span'); marker.className = 'quran-verse-marker';
            marker.setAttribute('aria-label', `Akhir ayat ${verseKey}`);
            const ayahNumber = Number(verseKey.split(':')[1]);
            if (ayahNumber >= 100) marker.classList.add('three-digit');
            const digit = document.createElement('span'); digit.textContent = arabicDigits(ayahNumber);
            marker.append(digit); line.append(marker);
          } else {
            const span = document.createElement('span');
            span.className = kind === 'quarter' ? 'quran-page-quarter' : kind === 'sajdah' ? 'quran-page-sajdah' : 'quran-page-word';
            const segments = tajweedTokens?.get(`${lineIndex}:${itemIndex}`);
            if (segments && (kind === 'word' || kind === 'bismillah')) appendTajweed(span, word, segments);
            else span.textContent = kind === 'quarter' ? '۞' : word;
            if (kind === 'quarter') span.setAttribute('aria-label', 'Tanda suku hizb');
            if (kind === 'sajdah') span.setAttribute('aria-label', 'Tanda sujud tilawah');
            line.append(span);
          }
        }
        fragment.append(line);
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
  for (const [id, enabled] of [['quran-tajweed-off', false], ['quran-tajweed-on', true]]) {
    $(id).addEventListener('click', () => {
      if (tajweedOn === enabled) return;
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
