(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = $('allday-view');
  if (!root) return;
  const stateKey = 'uwa-quran-reader-v1';
  let chapters = [];
  let surah = 0;
  let mode = 'list';
  let page = 1;
  let state = { last: null, bookmarks: [] };
  let requestId = 0;
  let versePages = null;
  const arabicDigits = (number) => String(number).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const path = (folder, number) => `./quran/${folder}/${String(number).padStart(3, '0')}.json`;

  try {
    const saved = JSON.parse(localStorage.getItem(stateKey));
    if (saved && typeof saved === 'object') {
      state.last = saved.last && Number.isInteger(saved.last.surah) ? saved.last : null;
      state.bookmarks = Array.isArray(saved.bookmarks) ? saved.bookmarks.filter(key => /^\d{1,3}:\d{1,3}$/.test(key)) : [];
    }
  } catch (error) {}
  function save() { try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch (error) {} }
  function setStatus(message, target = 'quran-reader-status') { $(target).textContent = message; }
  async function getJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  function chapter(number) { return chapters[number - 1]; }
  function showArea(area) {
    $('quran-routine').hidden = area !== 'routine';
    $('quran-library').hidden = area !== 'library';
    $('quran-reader').hidden = area !== 'reader';
    root.querySelector('.quran-tabs').hidden = area === 'reader';
    $('quran-tab-routine').setAttribute('aria-pressed', String(area === 'routine'));
    $('quran-tab-library').setAttribute('aria-pressed', String(area !== 'routine'));
    document.body.classList.toggle('quran-explore', area !== 'routine');
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
    setMode(requestedMode || (resume && last?.surah === number && last.mode === 'page' ? 'page' : 'list'));
    $('quran-verse-list').replaceChildren(); $('quran-mushaf-page').replaceChildren();
    showArea('reader');
    setStatus('Memuatkan ayat…');
    if (mode === 'page') { await renderPage(token, resume ? last?.ayah : null); return; }
    try {
      const data = await getJson(path('surah', number));
      if (token !== requestId) return;
      const fragment = document.createDocumentFragment();
      for (const [ayah, arabic, translation] of data.verses) {
        const article = document.createElement('article'); article.className = 'quran-verse'; article.id = `quran-ayah-${ayah}`; article.dataset.ayah = ayah;
        const head = document.createElement('div'); head.className = 'quran-verse-head';
        const ref = document.createElement('strong'); ref.className = 'quran-verse-ref'; ref.textContent = `${number}:${ayah}`;
        const bookmark = document.createElement('button'); bookmark.type = 'button'; bookmark.className = 'quran-bookmark'; bookmark.dataset.bookmark = `${number}:${ayah}`;
        bookmark.setAttribute('aria-pressed', String(state.bookmarks.includes(bookmark.dataset.bookmark)));
        bookmark.textContent = state.bookmarks.includes(bookmark.dataset.bookmark) ? '★ Disimpan' : '☆ Simpan';
        head.append(ref, bookmark);
        const ar = document.createElement('p'); ar.className = 'quran-verse-arabic'; ar.lang = 'ar'; ar.dir = 'rtl'; ar.textContent = arabic;
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
  function fitPageLines() {
    const sheet = $('quran-mushaf-page');
    const lines = [...sheet.querySelectorAll('.quran-page-line')];
    const verseLines = lines.filter(line => !line.classList.contains('quran-page-heading') && !line.classList.contains('quran-page-bismillah'));
    let size = 28;
    do {
      for (const line of verseLines) line.style.fontSize = `${size}px`;
      if (verseLines.every(line => line.scrollWidth <= line.clientWidth + 1)) break;
      size -= 1;
    } while (size >= 13);
    for (const line of lines.filter(item => !verseLines.includes(item))) {
      let headingSize = Math.min(24, size + 2);
      do {
        line.style.fontSize = `${headingSize}px`;
        if (line.scrollWidth <= line.clientWidth + 1) break;
        headingSize -= 1;
      } while (headingSize >= 13);
    }
  }
  async function renderPage(token = ++requestId, preferredAyah = null) {
    const sheet = $('quran-mushaf-page');
    sheet.replaceChildren();
    $('quran-page-counter').textContent = $('quran-page-counter-bottom').textContent = `${page} / 604`;
    for (const id of ['quran-prev-page', 'quran-prev-page-bottom']) $(id).disabled = page === 1;
    for (const id of ['quran-next-page', 'quran-next-page-bottom']) $(id).disabled = page === 604;
    setStatus(`Memuatkan halaman ${page}…`);
    try {
      const data = await getJson(path('pages', page));
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
      for (const items of data.lines) {
        const line = document.createElement('div'); line.className = 'quran-page-line';
        const type = items[0]?.[0];
        if (type === 'surah_header') line.classList.add('quran-page-heading');
        if (type === 'bismillah') line.classList.add('quran-page-bismillah');
        for (const [kind, word, verseKey, suraNumber] of items) {
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
            const span = document.createElement('span'); span.className = kind === 'quarter' ? 'quran-page-quarter' : 'quran-page-word';
            span.textContent = kind === 'quarter' ? '۞' : word;
            if (kind === 'quarter') span.setAttribute('aria-label', 'Tanda suku hizb');
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
      setStatus(''); updateLast(currentAyah);
      requestAnimationFrame(fitPageLines);
      document.fonts?.ready.then(fitPageLines);
    } catch (error) { if (token === requestId) setStatus('Halaman belum tersedia. Semak sambungan internet dan cuba lagi.'); }
  }
  async function switchMode(next) {
    if (!surah || next === mode) return;
    const token = ++requestId; setMode(next);
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
  $('quran-list-mode').addEventListener('click', () => switchMode('list'));
  $('quran-page-mode').addEventListener('click', () => switchMode('page'));
  $('quran-translation-toggle').addEventListener('click', () => {
    const hidden = $('quran-list-panel').classList.toggle('quran-hide-translation');
    $('quran-translation-toggle').setAttribute('aria-pressed', String(!hidden));
    $('quran-translation-toggle').textContent = hidden ? 'Terjemahan Melayu' : 'Terjemahan Melayu ✓';
  });
  for (const id of ['quran-prev-page', 'quran-prev-page-bottom', 'quran-next-page', 'quran-next-page-bottom']) {
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
  new ResizeObserver(() => { if (mode === 'page' && !$('quran-page-panel').hidden) fitPageLines(); }).observe(root);
})();
