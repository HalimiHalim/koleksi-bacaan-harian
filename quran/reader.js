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
  let selecting = false;
  const pending = new Set();
  let readerOrigin = 'library';
  let originButton = null;
  let surah = 0;
  let mode = 'list';
  let page = 1;
  let state = { last: null, bookmarks: [], mode: 'list', script: 'uthmani', uthmaniMode: 'list' };
  let requestId = 0;
  let versePages = null;
  let recent = null;
  let favourites = null;
  let favouriteLimit = 10;
  let favouriteToken = 0;
  let favouriteSignature = '';
  let favouriteReturn = null;
  let historyIntent = null;
  let listScrollEngaged = false;
  let positionTimer = 0;
  let pendingListAyah = null;
  let lastPositionFlush = 0;
  let tajweedOn = false;
  const arabicDigits = (number) => String(number).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const path = (folder, number) => `./quran/${folder}/${String(number).padStart(3, '0')}.json${folder === 'pages' ? '?v=20' : ''}`;

  try {
    const saved = JSON.parse(localStorage.getItem(stateKey));
    if (saved && typeof saved === 'object') {
      state.last = saved.last && Number.isInteger(saved.last.surah) ? saved.last : null;
      state.bookmarks = Array.isArray(saved.bookmarks) ? saved.bookmarks.filter(key => /^\d{1,3}:\d{1,3}$/.test(key)) : [];
      state.mode = ['list', 'page', 'classic'].includes(saved.mode) ? saved.mode : ['page', 'classic'].includes(state.last?.mode) ? state.last.mode : 'list';
      state.script = saved.script === 'simple' ? 'simple' : 'uthmani';
      state.uthmaniMode = ['list', 'page', 'classic'].includes(saved.uthmaniMode) ? saved.uthmaniMode : state.mode;
      if (state.script === 'simple') {
        if (state.mode === 'classic') state.mode = 'page';
        if (state.last?.mode === 'classic') state.last.mode = 'page';
      }
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
    $('quran-classic-mode').disabled = unsupported;
    $('quran-classic-note').hidden = !unsupported;
    for (const script of ['uthmani', 'simple']) {
      $(`quran-script-${script}`).setAttribute('aria-pressed', String(state.script === script));
    }
  }
  updateTajweedButtons();
  function save() {
    if (recent && !recent.protectLegacy()) return;
    if (favourites) { favourites.saveReader(state); return; }
    // Catalogue initialization may still be pending: preserve raw bookmarks.
    try {
      const raw = localStorage.getItem(stateKey);
      const saved = raw === null ? {} : JSON.parse(raw);
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      const { bookmarks, ...fields } = state;
      localStorage.setItem(stateKey, JSON.stringify({ ...saved, ...fields, bookmarks:Object.prototype.hasOwnProperty.call(saved, 'bookmarks') ? saved.bookmarks : [] }));
    } catch (error) {}
  }
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
  const originalChapters = new Map();
  function originalChapter(number) {
    if (!originalChapters.has(number)) {
      const promise = getJson(path('surah', number)).then(data => {
        if (data.surah !== number || data.verses?.length !== chapter(number)?.[3] ||
            data.verses.some(([ayah, text], i) => ayah !== i + 1 || typeof text !== 'string' || !text)) throw new Error('Invalid verse identities');
        return data;
      }).catch(error => { originalChapters.delete(number); throw error; });
      originalChapters.set(number, promise);
      if (originalChapters.size > 8) originalChapters.delete(originalChapters.keys().next().value);
    }
    return originalChapters.get(number);
  }
  async function selectedChapter(number, script = state.script) {
    const original = await originalChapter(number);
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
    if (area !== 'reader') { flushReadingPosition(); listScrollEngaged = false; closeSettings(); }
    if (area === 'library') renderRecent();
    $('quran-routine').hidden = area !== 'routine';
    $('quran-library').hidden = area !== 'library';
    $('quran-reader').hidden = area !== 'reader';
    root.querySelector('.quran-tabs').hidden = area === 'reader';
    $('quran-tab-routine').setAttribute('aria-pressed', String(area === 'routine'));
    $('quran-tab-library').setAttribute('aria-pressed', String(area !== 'routine'));
    document.body.classList.toggle('quran-explore', area !== 'routine');
    document.body.classList.toggle('quran-reading', area === 'reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (area === 'routine') renderFavourites();
    else { ++favouriteToken; favouriteSignature = ''; }
  }
  function renderRecent() {
    $('quran-recent').hidden = selecting;
    const entries = recent?.entries || [];
    const list = $('quran-recent-row');
    list.replaceChildren();
    $('quran-recent-empty').hidden = entries.length > 0;
    list.hidden = !entries.length;
    for (const entry of entries) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'quran-recent-item';
      button.dataset.recentSurah = entry.surah;
      const name = document.createElement('strong'); name.textContent = chapter(entry.surah)[1];
      const position = document.createElement('small');
      position.textContent = entry.mode === 'list' ? `Ayat ${entry.ayah}` : `Halaman ${entry.page}`;
      button.setAttribute('aria-label', `${name.textContent}, ${position.textContent}`);
      button.append(name, position); list.append(button);
    }
    // This runs on library entry/exit only, not on scroll or font fitting.
    list.scrollLeft = 0;
  }
  function readerActive() {
    return document.body.dataset.currentView === 'allday' && !root.hidden && !$('quran-reader').hidden;
  }
  function visibleListAyah() {
    if (!readerActive() || mode !== 'list' || !listScrollEngaged) return null;
    const nodes = [...$('quran-verse-list').querySelectorAll('[data-ayah]')];
    const node = nodes.find(node => {
      const rect = node.getBoundingClientRect();
      return rect.bottom > 80 && rect.top < innerHeight;
    });
    return node ? Number(node.dataset.ayah) : null;
  }
  function flushReadingPosition() {
    clearTimeout(positionTimer); positionTimer = 0;
    const ayah = pendingListAyah ?? visibleListAyah();
    pendingListAyah = null; listScrollEngaged = false;
    if (ayah && (state.last?.surah !== surah || state.last?.ayah !== ayah || state.last?.mode !== mode)) {
      historyIntent = { token:requestId, touch:true };
      updateLast(ayah); lastPositionFlush = Date.now();
    }
  }
  function engageListScroll(event) {
    if (!readerActive() || mode !== 'list' || document.hidden || $('quran-reader-status').textContent || !$('quran-settings').hidden) return;
    if (event.type === 'keydown' && (!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key) || event.target.closest?.('button,input,textarea'))) return;
    listScrollEngaged = true;
  }
  window.addEventListener('wheel', engageListScroll, { passive:true });
  window.addEventListener('touchmove', engageListScroll, { passive:true });
  window.addEventListener('keydown', engageListScroll);
  window.addEventListener('scroll', () => {
    if (!listScrollEngaged || !readerActive() || mode !== 'list') return;
    pendingListAyah = visibleListAyah();
    clearTimeout(positionTimer);
    positionTimer = setTimeout(flushReadingPosition, Math.max(200, 1000 - (Date.now() - lastPositionFlush)));
  }, { passive:true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushReadingPosition(); });
  window.addEventListener('pagehide', flushReadingPosition);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-app-view]')) { flushReadingPosition(); listScrollEngaged = false; }
  }, true);
  function renderChapters(query = '') {
    const list = $('quran-surah-list');
    const q = query.trim().toLocaleLowerCase();
    list.replaceChildren();
    const currentMembers = selecting ? window.QuranRoutine.members().ids : [];
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
      if (selecting) {
        const present = currentMembers.includes(String(item[0]));
        button.disabled = present;
        button.setAttribute('aria-pressed', String(present || pending.has(String(item[0]))));
        meta.textContent = present ? 'Sudah ditambah' : pending.has(String(item[0])) ? 'Dipilih ✓' : meta.textContent;
      }
      button.append(number, detail, arabic); list.append(button);
    }
    setStatus(list.childElementCount ? '' : 'Tiada surah ditemui.', 'quran-library-status');
  }
  async function loadChapters() {
    if (chapters.length) return;
    try {
      setStatus('Memuatkan senarai surah…', 'quran-library-status');
      chapters = await getJson('./quran/chapters.json');
      if (chapters.length !== 114 || chapters.some((item, i) => item[0] !== i+1)) throw new Error('Incomplete index');
      let historyStorage = null;
      try { historyStorage = localStorage; } catch {}
      favourites ||= window.createQuranFavourites(chapters, historyStorage, bookmarkNotice);
      syncBookmarkButtons();
      renderFavourites();
      recent ||= window.createQuranRecent(chapters, historyStorage, message => setStatus(message, 'quran-recent-status'));
      window.dispatchEvent(new CustomEvent('quran-catalogue', { detail:chapters }));
      renderChapters($('quran-search').value);
      renderRecent();
    } catch (error) {
      setStatus('Senarai surah belum tersedia. Sambung internet dan buka semula tab ini.', 'quran-library-status');
    }
  }
  function bookmarkNotice(message) {
    $('quran-favourites-status').textContent = message;
    $('quran-bookmark-status').textContent = message;
  }
  function syncBookmarkButtons() {
    if (!favourites) return;
    state.bookmarks = favourites.oldestFirst;
    for (const button of $('quran-verse-list').querySelectorAll('[data-bookmark]')) {
      const saved = state.bookmarks.includes(button.dataset.bookmark);
      button.setAttribute('aria-pressed', String(saved));
      button.textContent = saved ? '★ Disimpan' : '☆ Simpan';
    }
  }
  function favouritesActive() {
    return document.body.dataset.currentView === 'allday' && !root.hidden && !$('quran-routine').hidden;
  }
  async function renderFavourites(force = false) {
    if (!favourites || !favouritesActive()) { ++favouriteToken; favouriteSignature = ''; return; }
    favourites.refresh(); syncBookmarkButtons();
    const entries = favourites.entries, script = state.script;
    const signature = JSON.stringify([entries, script, favouriteLimit]);
    if (!force && signature === favouriteSignature) return;
    favouriteSignature = signature;
    const token = ++favouriteToken, list = $('quran-favourites-list');
    list.replaceChildren();
    $('quran-favourites-empty').hidden = entries.length > 0;
    $('quran-favourites-more').hidden = entries.length <= favouriteLimit;
    const groups = new Map();
    for (const key of entries.slice(0, favouriteLimit)) {
      const [number, ayah] = key.split(':').map(Number);
      const article = document.createElement('article'); article.className = 'quran-favourite'; article.dataset.favourite = key;
      const title = document.createElement('h3'); title.textContent = `${chapter(number)[1]} · ${key}`;
      const content = document.createElement('div'); content.className = 'quran-favourite-content'; content.setAttribute('aria-busy', 'true');
      const loading = document.createElement('p'); loading.className = 'quran-favourite-loading'; loading.textContent = 'Memuatkan petikan…'; content.append(loading);
      const actions = document.createElement('div'); actions.className = 'quran-favourite-actions';
      const open = document.createElement('button'); open.type = 'button'; open.dataset.favouriteOpen = key; open.textContent = 'Buka dalam surah'; open.setAttribute('aria-label', `Buka ${chapter(number)[1]} ${key} dalam surah`);
      const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.favouriteRemove = key; remove.textContent = 'Buang daripada kegemaran'; remove.setAttribute('aria-label', `Buang ${key} daripada kegemaran`);
      actions.append(open, remove); article.append(title, content, actions); list.append(article);
      if (!groups.has(number)) groups.set(number, []);
      groups.get(number).push({ key, ayah, content });
    }
    await Promise.all([...groups].map(async ([number, nodes]) => {
      try {
        const data = await selectedChapter(number, script);
        if (token !== favouriteToken || !favouritesActive() || state.script !== script) return;
        for (const { key, ayah, content } of nodes) {
          if (!favourites.entries.includes(key) || !content.isConnected) continue;
          const [, arabic, meaning] = data.verses[ayah - 1];
          const ar = document.createElement('p'); ar.className = 'quran-verse-arabic'; ar.lang = 'ar'; ar.dir = 'rtl'; ar.textContent = arabic;
          content.replaceChildren(ar);
          if (typeof meaning === 'string' && meaning) {
            const ms = document.createElement('p'); ms.className = 'quran-verse-translation'; ms.lang = 'ms'; ms.textContent = meaning; content.append(ms);
          }
          content.setAttribute('aria-busy', 'false');
        }
      } catch {
        if (token !== favouriteToken || !favouritesActive()) return;
        for (const { content } of nodes) {
          content.replaceChildren(); content.setAttribute('aria-busy', 'false');
          const message = document.createElement('p'); message.className = 'quran-favourite-loading'; message.textContent = 'Teks petikan belum tersedia. Sambung internet dan cuba lagi. Rujukan simpanan dikekalkan.';
          const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'quran-bookmark'; retry.dataset.favouriteRetry = ''; retry.textContent = 'Cuba lagi'; content.append(message, retry);
        }
      }
    }));
  }
  async function placeListAnchor(ayah, token) {
    await document.fonts.ready;
    requestAnimationFrame(() => {
      if (token !== requestId || !readerActive() || mode !== 'list') return;
      const anchor = $(`quran-ayah-${ayah}`);
      if (anchor) window.scrollTo({ top:scrollY + anchor.getBoundingClientRect().top - 80, behavior:'instant' });
    });
  }
  $('quran-favourites-more').addEventListener('click', () => { favouriteLimit += 10; renderFavourites(); });
  $('quran-favourites-list').addEventListener('click', async event => {
    if (event.target.closest('[data-favourite-retry]')) { renderFavourites(true); return; }
    const remove = event.target.closest('[data-favourite-remove]');
    if (remove) {
      const buttons = [...$('quran-favourites-list').querySelectorAll('[data-favourite-remove]')], index = buttons.indexOf(remove);
      if (!favourites.set(remove.dataset.favouriteRemove, false)) return;
      syncBookmarkButtons();
      const rendering = renderFavourites();
      const next = $('quran-favourites-list').querySelectorAll('[data-favourite-remove]');
      (next[Math.min(index, next.length - 1)] || $('quran-favourites-title')).focus({ preventScroll:true });
      await rendering; return;
    }
    const button = event.target.closest('[data-favourite-open]'), key = favourites?.canonical(button?.dataset.favouriteOpen);
    if (!key || !favourites.entries.includes(key)) return;
    const [number, ayah] = key.split(':').map(Number);
    favouriteReturn = { key, top:scrollY };
    readerOrigin = 'routine'; originButton = button;
    $('quran-back').querySelector('.quran-back-label').textContent = 'Amalan Saya';
    $('quran-back').setAttribute('aria-label', 'Kembali ke Amalan Saya');
    const opening = openSurah(number, true, 'list', { surah:number, ayah, mode:'list' });
    const token = requestId;
    await opening; placeListAnchor(ayah, token);
  });
  // Only mount content for the visible Amalan Saya view. Invalidate requests on exit.
  new MutationObserver(() => {
    if (favouritesActive()) renderFavourites();
    else { ++favouriteToken; favouriteSignature = ''; }
  }).observe(document.body, { attributes:true, attributeFilter:['data-current-view'] });
  new MutationObserver(() => {
    if (favouritesActive()) renderFavourites();
    else { ++favouriteToken; favouriteSignature = ''; }
  }).observe(root, { attributes:true, attributeFilter:['hidden'] });
  window.addEventListener('storage', event => {
    if (event.key === stateKey || event.key === null) { favourites?.refresh(); syncBookmarkButtons(); renderFavourites(); }
  });
  function updateLast(ayah = 1) {
    state.last = { surah, ayah, mode, page };
    save();
    if (recent && historyIntent?.token === requestId && readerActive()) {
      recent.record(state.last, historyIntent.touch); historyIntent = null;
    }
  }
  function setMode(next) {
    mode = next === 'classic' && state.script !== 'uthmani' ? 'page' : next;
    state.mode = mode;
    if (state.script === 'uthmani') state.uthmaniMode = mode;
    save();
    $('quran-list-mode').setAttribute('aria-pressed', String(mode === 'list'));
    $('quran-page-mode').setAttribute('aria-pressed', String(mode === 'page'));
    $('quran-classic-mode').setAttribute('aria-pressed', String(mode === 'classic'));
    $('quran-list-panel').hidden = mode !== 'list';
    $('quran-page-panel').hidden = mode !== 'page';
    $('quran-classic-panel').hidden = mode !== 'classic';
  }
  async function openSurah(number, resume = false, requestedMode = null, position = null, interaction = 'open') {
    if (!chapter(number)) return;
    flushReadingPosition(); listScrollEngaged = false;
    surah = number;
    const last = position || state.last;
    const token = ++requestId;
    historyIntent = { token, touch:interaction === 'open' };
    const item = chapter(number);
    $('quran-reader-title').textContent = item[1];
    $('quran-reader-arabic-title').textContent = item[2];
    $('quran-reader-meta').textContent = `Surah ${number} · ${item[3]} ayat · ${item[6] === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'}`;
    page = resume && last?.surah === number && Number.isInteger(last.page) ? Math.max(1, Math.min(604, last.page)) : item[4];
    setMode(requestedMode || state.mode);
    $('quran-verse-list').replaceChildren(); $('quran-mushaf-page').replaceChildren(); $('quran-classic-page').replaceChildren();
    showArea('reader');
    setStatus('Memuatkan ayat…');
    if (mode === 'classic') { await renderClassicPage(token, resume ? last?.ayah : null); return; }
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
  function fitDesktopClassicLines() {
    if (mode !== 'classic' || $('quran-classic-panel').hidden) return;
    const sheet = $('quran-classic-page');
    const lines = [...sheet.querySelectorAll('.quran-classic-line')];
    const verseLines = lines.filter(line => !line.classList.contains('quran-page-heading') && !line.classList.contains('quran-page-bismillah'));
    let size = 28;
    // Full Uthmani marks can make dense lines wider on 320px phones.
    while (true) {
      for (const line of verseLines) line.style.fontSize = `${size}px`;
      if (verseLines.every(line => line.scrollWidth <= line.clientWidth + 1) || size <= 11) break;
      size -= 0.5;
    }
    for (const line of lines.filter(item => !verseLines.includes(item))) {
      let headingSize = Math.min(24, size + 2);
      do {
        line.style.fontSize = `${headingSize}px`;
        if (line.scrollWidth <= line.clientWidth + 1) break;
        headingSize -= 1;
      } while (headingSize >= 13);
    }
  }
  // Mobile keeps QCF token groups but may wrap their words. Desktop retains
  // its historical width fitter and the V2.5.1 centered spacing unchanged.
  let classicFitFrame = 0;
  let classicFitForced = false;
  let classicFitSignature = '';
  let classicFontsLoaded;
  const classicMobile = matchMedia('(max-width:620px)');
  function classicOuterHeight(element) {
    const style = getComputedStyle(element);
    if (style.display === 'none') return 0;
    return element.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  }
  function classicMobileHeight(sheet) {
    const reader = $('quran-reader');
    const panel = $('quran-classic-panel');
    let occupied = 0;
    for (const container of [root, reader, panel]) {
      const style = getComputedStyle(container);
      occupied += parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      for (const child of container.children) {
        if (child !== reader && child !== panel && child !== sheet) occupied += classicOuterHeight(child);
      }
    }
    return Math.max(1, Math.floor((window.visualViewport?.height || innerHeight) - occupied));
  }
  function fitMobileClassicLines(sheet, height) {
    const lines = [...sheet.querySelectorAll('.quran-classic-line')];
    const ordinary = lines.filter(line => !line.matches('.quran-page-heading,.quran-page-bismillah'));
    const structural = lines.filter(line => !ordinary.includes(line));
    const minimum = 11, maximum = 28, precision = 0.25;
    sheet.style.setProperty('--classic-fit-height', `${height}px`);
    const style = getComputedStyle(sheet);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    // Keep 3% of the actual inner frame clear; measurements include every
    // heading, basmalah, wrapped Quran row and the folio, with their margins.
    let available = (height - padding - border) * 0.97;
    const horizontalFits = line => line.scrollWidth <= line.clientWidth;
    const sections = [...sheet.querySelectorAll('.quran-classic-section')];
    const headingCaps = structural.map(line => {
      let low = 13 / precision, high = 24 / precision, best = low;
      while (low <= high) {
        const candidate = Math.floor((low + high) / 2);
        line.style.fontSize = `${candidate * precision}px`;
        if (horizontalFits(line)) { best = candidate; low = candidate + 1; }
        else high = candidate - 1;
      }
      return best * precision;
    });
    const apply = size => {
      sheet.style.setProperty('--classic-font-size', `${size}px`);
      for (const line of ordinary) line.style.fontSize = `${size}px`;
      structural.forEach((line, i) => { line.style.fontSize = `${Math.min(headingCaps[i], size + 2)}px`; });
    };
    const contentHeight = () => {
      const top = sheet.getBoundingClientRect().top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
      return Math.max(...[...sheet.children].map(child => {
        const childStyle = getComputedStyle(child);
        return child.getBoundingClientRect().bottom + parseFloat(childStyle.marginBottom) - top;
      }));
    };
    const fits = () => [...structural, ...sections].every(horizontalFits) && contentHeight() <= available;
    let low = minimum / precision, high = maximum / precision, best = low;
    apply(minimum);
    if (!fits()) {
      // Very short landscape/keyboard viewports cannot contain a full page
      // even at the historical minimum. Keep that minimum and a complete
      // frame rather than clipping Quran content; the screen can scroll.
      height = Math.ceil(contentHeight() / 0.97 + padding + border);
      sheet.style.setProperty('--classic-fit-height', `${height}px`);
      available = (height - padding - border) * 0.97;
    }
    while (low <= high) {
      const candidate = Math.floor((low + high) / 2);
      apply(candidate * precision);
      if (fits()) { best = candidate; low = candidate + 1; }
      else high = candidate - 1;
    }
    apply(best * precision);
  }
  function scheduleClassicFit(force = false) {
    if (mode !== 'classic' || $('quran-reader').hidden || $('quran-classic-panel').hidden || !root.getClientRects().length) return;
    classicFitForced ||= force;
    classicFontsLoaded ||= document.fonts
      ? document.fonts.load('28px "UWA Naskh Arabic"').then(() => document.fonts.ready)
      : Promise.resolve();
    classicFontsLoaded.then(() => {
      if (classicFitFrame) return;
      classicFitFrame = requestAnimationFrame(() => {
        classicFitFrame = 0;
        if (mode !== 'classic' || $('quran-reader').hidden || $('quran-classic-panel').hidden || !root.getClientRects().length) return;
        const sheet = $('quran-classic-page');
        if (!sheet.querySelector('.quran-classic-line')) return;
        const height = classicMobile.matches ? classicMobileHeight(sheet) : 0;
        const signature = `${requestId}:${sheet.clientWidth}:${height}:${devicePixelRatio}`;
        if (!classicFitForced && signature === classicFitSignature) return;
        classicFitForced = false;
        classicFitSignature = signature;
        if (classicMobile.matches) fitMobileClassicLines(sheet, height);
        else {
          sheet.style.removeProperty('--classic-fit-height');
          sheet.style.removeProperty('--classic-font-size');
          fitDesktopClassicLines();
        }
        sheet.dataset.fitReady = 'true';
      });
    });
  }
  async function renderClassicPage(token = ++requestId, preferredAyah = null) {
    if (state.script !== 'uthmani') return;
    const sheet = $('quran-classic-page');
    sheet.replaceChildren();
    delete sheet.dataset.fitReady;
    $('quran-classic-counter-bottom').textContent = `${page} / 604`;
    $('quran-prev-classic-bottom').disabled = page === 1;
    $('quran-next-classic-bottom').disabled = page === 604;
    setStatus(`Memuatkan halaman ${page}…`);
    try {
      const requestedPage = page;
      const annotationPromise = tajweedOn
        ? getJson(`./quran/tajweed/pages/${String(requestedPage).padStart(3, '0')}.json?v=24`).catch(() => null)
        : Promise.resolve(null);
      const data = await getJson(path('pages', requestedPage));
      const annotation = await annotationPromise;
      const tajweedTokens = tajweedOn ? await verifiedTajweed(data, annotation).catch(() => null) : null;
      if (token !== requestId || mode !== 'classic') return;
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
      let section = null;
      for (const [lineIndex, items] of data.lines.entries()) {
        const line = document.createElement('div'); line.className = 'quran-classic-line';
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
            marker.append(digit);
            // Keep the verse ending together when mobile sections reflow.
            // Contents wrappers leave desktop flex items unchanged.
            const last = line.lastElementChild;
            const word = last?.classList.contains('quran-page-word') ? last
              : last?.classList.contains('quran-page-sajdah') ? last.previousElementSibling : null;
            if (word?.classList.contains('quran-page-word')) {
              const pair = document.createElement('span'); pair.className = 'quran-classic-end-pair';
              word.replaceWith(pair); pair.append(word);
              if (last !== word) pair.append(last);
              pair.append(marker);
            } else line.append(marker);
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
        if (type === 'surah_header' || type === 'bismillah') {
          section = null;
          fragment.append(line);
        } else {
          if (!section) {
            section = document.createElement('div');
            section.className = 'quran-classic-section';
            fragment.append(section);
          }
          section.append(line);
        }
      }
      const folio = document.createElement('div'); folio.className = 'quran-page-folio'; folio.textContent = arabicDigits(page);
      fragment.append(folio); sheet.replaceChildren(fragment);
      const firstKey = verseKeys.find(key => key.startsWith(`${surah}:`));
      const savedKey = `${surah}:${preferredAyah}`;
      const currentAyah = preferredAyah && verseKeys.includes(savedKey) ? preferredAyah : Number(firstKey.split(':')[1]);
      setStatus(tajweedOn && !tajweedTokens ? 'Warna Tajweed tidak tersedia untuk halaman ini; teks asal dipaparkan.' : '');
      updateLast(currentAyah);
      scheduleClassicFit(true);
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
    flushReadingPosition(); listScrollEngaged = false;
    scriptSwitchPending = true;
    const token = ++requestId;
    historyIntent = { token, touch:false };
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
      const nextMode = next === 'simple' && mode === 'classic' ? 'page'
        : next === 'uthmani' && mode === 'page' && state.uthmaniMode === 'classic' ? 'classic' : mode;
      state.script = next; setMode(nextMode); updateTajweedButtons();
      if (mode === 'classic') await renderClassicPage(token, ayah);
      else if (mode === 'page') await renderPage(token, ayah);
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
    if (!surah || next === mode || (next === 'classic' && state.script !== 'uthmani')) return;
    const previousMode = mode;
    flushReadingPosition(); listScrollEngaged = false;
    const token = ++requestId;
    historyIntent = { token, touch:false };
    setMode(next);
    window.scrollTo(0, 0);
    if (next === 'page' || next === 'classic') {
      if (previousMode === 'list') {
      try {
        versePages ||= await getJson('./quran/verse-pages.json');
        page = versePages[`${surah}:${state.last?.ayah || 1}`] || chapter(surah)[4];
      } catch (error) { page = chapter(surah)[4]; }
      }
      if (token !== requestId || mode !== next) return;
      if (next === 'classic') await renderClassicPage(token, state.last?.ayah);
      else await renderPage(token, state.last?.ayah);
    } else { await openSurah(surah, true, 'list', null, 'metadata'); }
  }

  const settings = $('quran-settings');
  const settingsToggle = $('quran-settings-toggle');
  function closeSettings(returnFocus = false) {
    settings.hidden = true;
    settingsToggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) settingsToggle.focus();
  }
  function selectionCount() {
    $('quran-selection-count').textContent = `Pilih surah · ${pending.size} dipilih`;
  }
  function finishSelection(saveChanges = false) {
    if (saveChanges && !window.QuranRoutine.add([...pending].sort((a,b) => Number(a)-Number(b)))) {
      setStatus(`Surah tidak dapat disimpan. ${window.QuranRoutine.error()}`, 'quran-library-status'); return;
    }
    selecting = false; pending.clear();
    if (history.state?.quranSelecting) history.back();
    $('quran-selection').hidden = true;
    $('quran-search').value = ''; renderChapters(); renderRecent(); showArea('routine');
    $('quran-add').focus({ preventScroll:true });
  }
  $('quran-add').addEventListener('click', async () => {
    if (window.QuranRoutine.members().error) return;
    selecting = true; pending.clear();
    history.pushState({ quranSelecting:true }, '', location.href);
    $('quran-selection').hidden = false;
    $('quran-recent').hidden = true; $('quran-search').value = ''; selectionCount();
    showArea('library'); await loadChapters(); if (selecting) { renderChapters(); $('quran-search').focus(); }
  });
  window.addEventListener('popstate', () => { if (selecting) finishSelection(); });
  document.querySelectorAll('[data-app-view]').forEach(button => button.addEventListener('click', () => { if (selecting) finishSelection(); }));
  $('quran-selection-done').addEventListener('click', () => finishSelection(true));
  $('quran-selection-cancel').addEventListener('click', () => finishSelection());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && selecting) { event.preventDefault(); finishSelection(); }
  });
  $('quran-tab-routine').addEventListener('click', () => { if (selecting) finishSelection(); else showArea('routine'); });
  $('quran-tab-library').addEventListener('click', () => {
    if (selecting) finishSelection();
    readerOrigin = 'library'; showArea('library'); loadChapters();
  });
  $('quran-back').addEventListener('click', () => {
    const recentSurah = originButton?.dataset.recentSurah;
    showArea(readerOrigin); ++requestId;
    if (recentSurah) originButton = $('quran-recent-row').querySelector(`[data-recent-surah="${recentSurah}"]`);
    if (favouriteReturn) {
      const returning = favouriteReturn; favouriteReturn = null;
      const token = requestId;
      renderFavourites(true).then(async () => {
        await document.fonts.ready;
        requestAnimationFrame(() => {
          if (token !== requestId || !favouritesActive()) return;
          const button = [...$('quran-favourites-list').querySelectorAll('[data-favourite-open]')].find(button => button.dataset.favouriteOpen === returning.key);
          (button || $('quran-favourites-title')).focus({ preventScroll:true });
          window.scrollTo({ top:returning.top, behavior:'instant' });
        });
      });
    } else if (originButton?.isConnected) originButton.focus({ preventScroll:true });
  });
  $('quran-search').addEventListener('input', event => renderChapters(event.target.value));
  $('quran-surah-list').addEventListener('click', event => {
    const button = event.target.closest('[data-surah]');
    if (!button || button.disabled) return;
    if (selecting) {
      const id = button.dataset.surah;
      if (pending.has(id)) pending.delete(id); else pending.add(id);
      selectionCount(); renderChapters($('quran-search').value);
      $('quran-surah-list').querySelector(`[data-surah="${id}"]`)?.focus({ preventScroll:true });
    } else {
      favouriteReturn = null;
      readerOrigin = 'library'; originButton = button;
      $('quran-back').querySelector('.quran-back-label').textContent = 'Semua surah';
      $('quran-back').setAttribute('aria-label', 'Kembali ke senarai surah');
      openSurah(Number(button.dataset.surah));
    }
  });
  window.addEventListener('quran-open-checklist', async event => {
    favouriteReturn = null;
    originButton = document.activeElement; await loadChapters();
    readerOrigin = 'routine';
    $('quran-back').querySelector('.quran-back-label').textContent = 'Amalan Saya';
    $('quran-back').setAttribute('aria-label', 'Kembali ke Amalan Saya');
    openSurah(event.detail);
  });
  $('quran-recent-row').addEventListener('click', event => {
    const button = event.target.closest('[data-recent-surah]');
    const entry = recent?.entries.find(item => item.surah === Number(button?.dataset.recentSurah));
    if (!entry || !recent.validate(entry)) return;
    favouriteReturn = null;
    readerOrigin = 'library'; originButton = button;
    $('quran-back').querySelector('.quran-back-label').textContent = 'Semua surah';
    $('quran-back').setAttribute('aria-label', 'Kembali ke senarai surah');
    const opening = openSurah(entry.surah, true, entry.mode, entry);
    const token = requestId;
    opening.then(async () => {
      if (entry.mode !== 'list' || entry.ayah <= 1) return;
      await document.fonts.ready;
      requestAnimationFrame(() => {
        if (token !== requestId || !readerActive() || mode !== 'list') return;
        const anchor = $(`quran-ayah-${entry.ayah}`);
        if (anchor) window.scrollTo({ top:scrollY + anchor.getBoundingClientRect().top - 80, behavior:'instant' });
      });
    });
  });
  $('quran-recent-row').addEventListener('focusin', event => {
    const button = event.target.closest('[data-recent-surah]');
    if (!button) return;
    const row = $('quran-recent-row'), rect = button.getBoundingClientRect(), frame = row.getBoundingClientRect();
    if (rect.left < frame.left) row.scrollLeft -= frame.left - rect.left + 3;
    else if (rect.right > frame.right) row.scrollLeft += rect.right - frame.right + 3;
  });
  $('quran-recent-row').addEventListener('wheel', event => {
    const row = $('quran-recent-row');
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || row.scrollWidth <= row.clientWidth) return;
    const before = row.scrollLeft; row.scrollLeft += event.deltaY;
    if (row.scrollLeft !== before) event.preventDefault();
  }, { passive:false });
  // Only the small catalogue is needed for routine names; no Quran pages loaded.
  loadChapters();
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
  $('quran-classic-mode').addEventListener('click', () => switchMode('classic'));
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
      else if (mode === 'classic' && !$('quran-classic-panel').hidden) renderClassicPage();
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
      const token = ++requestId; historyIntent = { token, touch:true };
      renderPage(token);
    });
  }
  for (const id of ['quran-prev-classic-bottom', 'quran-next-classic-bottom']) {
    $(id).addEventListener('click', () => {
      page = Math.max(1, Math.min(604, page + (id.includes('prev') ? -1 : 1)));
      const token = ++requestId; historyIntent = { token, touch:true };
      renderClassicPage(token);
    });
  }
  new ResizeObserver(() => scheduleClassicFit()).observe(root);
  window.addEventListener('resize', () => scheduleClassicFit());
  window.visualViewport?.addEventListener('resize', () => scheduleClassicFit());
  $('quran-verse-list').addEventListener('click', event => {
    const bookmark = event.target.closest('[data-bookmark]');
    if (bookmark) {
      if (!favourites || !favourites.refresh()) return;
      const key = bookmark.dataset.bookmark;
      if (favourites.set(key, !favourites.entries.includes(key))) syncBookmarkButtons();
      return; // Membership management is not a reading-position interaction.
    }
    const verse = event.target.closest('[data-ayah]');
    if (verse) {
      $('quran-verse-list').querySelector('.is-current')?.classList.remove('is-current');
      verse.classList.add('is-current');
      clearTimeout(positionTimer); pendingListAyah = null; listScrollEngaged = false;
      historyIntent = { token:requestId, touch:true };
      updateLast(Number(verse.dataset.ayah));
    }
  });
})();
