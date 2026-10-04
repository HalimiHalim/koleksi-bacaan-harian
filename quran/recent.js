// Compact reading metadata only; catalogue identities validate every entry.
(() => {
  'use strict';
  window.createQuranRecent = (chapters, storage, status = () => {}) => {
    const key = 'uwa-quran-recent-v1';
    const backupKey = `${key}-legacy-backup`;
    let entries = [];
    let seedBackup = null;
    let readable = true;
    let notice = '';
    let dirty = false;
    function validate(value) {
      if (!value || !Number.isInteger(value.surah) || !['list','page','classic'].includes(value.mode)) return null;
      const chapter = chapters[value.surah - 1];
      if (!chapter || chapter[0] !== value.surah || !Number.isInteger(value.ayah) || value.ayah < 1 || value.ayah > chapter[3]) return null;
      const entry = { surah:value.surah, mode:value.mode, ayah:value.ayah };
      if (value.mode !== 'list') {
        if (!Number.isInteger(value.page) || value.page < chapter[4] || value.page > chapter[5]) return null;
        entry.page = value.page;
      }
      return entry;
    }
    function write(target, value) {
      const raw = JSON.stringify(value);
      const previous = storage.getItem(target);
      try {
        storage.setItem(target, raw);
        if (storage.getItem(target) !== raw) throw new Error('Storage verification failed');
      } catch (error) {
        try {
          if (previous === null) storage.removeItem(target); else storage.setItem(target, previous);
        } catch {}
        throw error;
      }
    }
    function protectLegacy() {
      if (!readable) return false;
      if (!seedBackup) return true;
      try {
        if (storage.getItem(backupKey) === null) write(backupKey, { schema:1, last:seedBackup });
        seedBackup = null;
        return true;
      } catch {
        notice = 'Bacaan terkini belum dapat disimpan. Bacaan masih boleh dibuka.';
        status(notice); return false;
      }
    }
    function persist() {
      dirty = true;
      try {
        if (!protectLegacy()) return false;
        if (!readable) throw new Error('Storage unavailable');
        write(key, { schema:1, entries });
        dirty = false; notice = ''; status(notice); return true;
      } catch {
        notice = 'Bacaan terkini belum dapat disimpan. Bacaan masih boleh dibuka.';
        status(notice); return false;
      }
    }
    try {
      const raw = storage.getItem(key);
      if (raw === null) {
        const original = JSON.parse(storage.getItem('uwa-quran-reader-v1'));
        const seed = validate(original?.last);
        if (seed) { entries = [seed]; seedBackup = original.last; }
        // A persisted empty schema is also the one-time seed marker.
        persist();
      } else {
        const saved = JSON.parse(raw);
        if (saved?.schema !== 1 || !Array.isArray(saved.entries)) throw new Error('Invalid history schema');
        const seen = new Set();
        for (const value of saved.entries) {
          const entry = validate(value);
          if (!entry || seen.has(entry.surah)) continue;
          seen.add(entry.surah); entries.push(entry);
          if (entries.length === 10) break;
        }
      }
    } catch {
      // Do not seed again over an existing malformed history or overwrite the
      // unreadable legacy record. Genuine reading can repair readable history.
      try { storage.getItem(key); } catch { readable = false; }
      notice = 'Sebahagian data bacaan terkini tidak dapat dibaca. Bacaan masih boleh dibuka.';
      status(notice);
    }
    function record(value, touch = true) {
      const entry = validate(value);
      if (!entry) return false;
      const index = entries.findIndex(item => item.surah === entry.surah);
      if (index >= 0 && JSON.stringify(entries[index]) === JSON.stringify(entry) && (!touch || index === 0)) {
        if (dirty) persist();
        return false;
      }
      const next = entries.filter(item => item.surah !== entry.surah);
      if (touch || index < 0) next.unshift(entry);
      else next.splice(index, 0, entry);
      entries = next.slice(0, 10);
      persist(); return true;
    }
    return { key, backupKey, validate, protectLegacy, record, get entries() { return entries.map(entry => ({...entry})); }, get notice() { return notice; } };
  };
})();
