(() => {
  'use strict';
  // Keep the accepted oldest-first bookmarks array. The visible order is reversed.
  window.createQuranFavourites = (chapters, storage, notify = () => {}) => {
    const key = 'uwa-quran-reader-v1', backupKey = key + '-bookmarks-backup-v263';
    let entries = [], error = '';
    function message(text) { error = text; notify(text); }
    function canonical(value) {
      if (typeof value !== 'string' || !/^\d{1,3}:\d{1,3}$/.test(value)) return null;
      const [surah, ayah] = value.split(':').map(Number);
      return Number.isInteger(surah) && surah >= 1 && surah <= 114 &&
        Number.isInteger(ayah) && ayah >= 1 && ayah <= chapters[surah - 1]?.[3] ? `${surah}:${ayah}` : null;
    }
    function valid(values) {
      const result = [];
      if (Array.isArray(values)) for (const raw of values) {
        const id = canonical(raw);
        if (!id) continue;
        const index = result.indexOf(id);
        if (index >= 0) result.splice(index, 1);
        result.push(id);
      }
      return result;
    }
    function read() {
      const raw = storage.getItem(key);
      const data = raw === null ? {} : JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid reader state');
      return { raw, data };
    }
    function refresh() {
      try {
        const { data } = read(); entries = valid(data.bookmarks);
        const clean = data.bookmarks === undefined || JSON.stringify(data.bookmarks) === JSON.stringify(entries);
        message(clean ? '' : 'Sebahagian rujukan simpanan tidak sah. Rujukan sah dikekalkan; data asal belum diubah.');
        return true;
      } catch { message('Simpanan tidak dapat dibaca. Muat semula aplikasi atau cuba lagi. Data asal dikekalkan.'); return false; }
    }
    function write(raw, data) {
      const next = JSON.stringify(data);
      try {
        storage.setItem(key, next);
        if (storage.getItem(key) !== next) throw new Error('Readback failed');
        return true;
      } catch {
        // Restore even if a readback failed; do not require another successful read first.
        try { if (raw === null) storage.removeItem(key); else storage.setItem(key, raw); } catch {}
        let restored = false;
        try { restored = storage.getItem(key) === raw; } catch {}
        message(restored ? 'Simpanan gagal. Data asal dikekalkan. Semak ruang storan dan cuba lagi.'
          : 'Simpanan gagal dan pemulihan belum dapat disahkan. Muat semula aplikasi sebelum mencuba lagi.'); return false;
      }
    }
    function set(id, enabled) {
      id = canonical(id);
      if (!id) return false;
      try {
        const { raw, data } = read(), current = valid(data.bookmarks);
        const clean = data.bookmarks === undefined || JSON.stringify(data.bookmarks) === JSON.stringify(current);
        if (!clean) {
          // Preserve exact original evidence before a user mutation cleans references.
          if (storage.getItem(backupKey) === null) {
            const backup = JSON.stringify({ schema:1, bookmarks:data.bookmarks });
            storage.setItem(backupKey, backup);
            if (storage.getItem(backupKey) !== backup) throw new Error('Backup refused');
          }
        }
        const next = enabled ? current.includes(id) ? current : [...current, id] : current.filter(item => item !== id);
        if ((!clean || JSON.stringify(next) !== JSON.stringify(current)) && !write(raw, { ...data, bookmarks:next })) return false;
        entries = next; message(''); return true;
      } catch { message('Simpanan gagal. Data asal dikekalkan. Semak ruang storan dan cuba lagi.'); return false; }
    }
    // Reader position/preferences may change frequently; always retain the latest
    // persisted bookmark field verbatim, including malformed evidence until mutation.
    function saveReader(state) {
      try {
        const { raw, data } = read();
        const { bookmarks, ...fields } = state;
        return write(raw, { ...data, ...fields, bookmarks:data.bookmarks === undefined ? [] : data.bookmarks });
      } catch { message('Simpanan tidak dapat dibaca. Data asal dikekalkan. Muat semula dan cuba lagi.'); return false; }
    }
    refresh();
    return { canonical, refresh, set, saveReader, get entries() { return [...entries].reverse(); }, get oldestFirst() { return [...entries]; }, get error() { return error; } };
  };
})();
