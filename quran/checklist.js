// Independent membership and daily completion. Legacy content is read only once.
(() => {
  'use strict';
  const prefix = 'uwa-quran-checklist-v1';
  const legacy = 'uwa-navigation-renovation-trial-v1';
  const backupKey = `${prefix}-migration-backup`;
  const markerKey = `${prefix}-migrated`;
  const keys = {
    members: `${prefix}-members`, order: `${prefix}-order`,
    daily: day => `${prefix}-daily-${day}`
  };
  const validId = id => typeof id === 'string' && /^(?:[1-9]|[1-9]\d|10\d|11[0-4])$/.test(id);
  const day = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  };
  let ready = false;
  let notice = '';
  const array = raw => {
    const result = raw === null || raw === undefined ? [] : JSON.parse(raw);
    if (!Array.isArray(result) || result.some(id => !['string','number'].includes(typeof id) || !/^[a-z0-9_-]+$/i.test(String(id)))) throw new Error('Invalid legacy array');
    return result.map(String);
  };
  function write(key, value) {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    if (localStorage.getItem(key) !== raw) throw new Error('Storage verification failed');
  }
  function validate() {
    const members = JSON.parse(localStorage.getItem(keys.members));
    const order = JSON.parse(localStorage.getItem(keys.order));
    if (![members,order].every(ids => Array.isArray(ids) && ids.every(validId) && new Set(ids).size === ids.length) ||
        order.length !== members.length || !order.every(id => members.includes(id))) throw new Error('Invalid canonical checklist');
  }
  function initialize() {
    try {
      const marker = JSON.parse(localStorage.getItem(markerKey));
      if (marker) {
        if (marker.schema !== 1 || !Array.isArray(marker.unmapped)) throw new Error('Invalid migration marker');
        validate();
        notice = marker.unmapped.length ? 'Sebahagian bacaan lama ialah petikan atau bacaan tersuai dan tidak ditukar kepada surah penuh. Bacaan asal kekal dalam Isi; sandaran migrasi disimpan.' : '';
        ready = true; return;
      }
      let backup = JSON.parse(localStorage.getItem(backupKey));
      if (!backup) {
        const raw = {};
        for (let i=0; i<localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key === `${legacy}-initialized` || key === 'uwa-custom-readings-v1' ||
              key === `${legacy}-members-allday` || key === `${legacy}-order-allday` ||
              key === 'uwa-routine-members-allday-v1' || key === 'uwa-routine-order-allday-v1' ||
              /^(?:uwa-navigation-renovation-trial-v1-daily-|uwa-daily-)\d{4}-\d{2}-\d{2}-allday$/.test(key)) raw[key] = localStorage.getItem(key);
        }
        backup = { schema:1, day:day(), raw };
        write(backupKey, backup); // Durable recovery point, before ANY new state.
      }
      if (backup.schema !== 1 || !backup.raw || typeof backup.day !== 'string') throw new Error('Invalid backup');
      const raw = backup.raw;
      const trialMembers = raw[`${legacy}-members-allday`];
      // Pre-trial defaults also consist of Tiga Qul + excerpts. An explicit
      // pre-trial membership is respected; no new classification of custom text.
      const oldMembers = raw['uwa-routine-members-allday-v1'];
      const fresh = trialMembers === undefined && oldMembers === undefined && raw[`${legacy}-initialized`] === undefined;
      const members = fresh ? ['4'] : array(trialMembers ?? oldMembers ?? '["4","15","17"]');
      const order = array(raw[trialMembers !== undefined ? `${legacy}-order-allday` : 'uwa-routine-order-allday-v1']);
      const ordered = [...order.filter(id => members.includes(id)), ...members.filter(id => !order.includes(id))];
      const done = new Set(backup.day === day() ? array(raw[trialMembers !== undefined ? `${legacy}-daily-${day()}-allday` : `uwa-daily-${day()}-allday`]) : []);
      // Only audited source 4 contains entire surahs. Duplicate occurrences cannot
      // be distinguished by the old daily set: preserve membership, not completion.
      const mapping = { '4':['112','113','114'] };
      const ids = [], contributors = new Map(), unmapped = [];
      for (const id of ordered) {
        if (!mapping[id]) { if (!unmapped.includes(id)) unmapped.push(id); continue; }
        for (const surah of mapping[id]) {
          if (!ids.includes(surah)) ids.push(surah);
          if (!contributors.has(surah)) contributors.set(surah, []);
          contributors.get(surah).push(id);
        }
      }
      const completed = ids.filter(id => {
        const source = contributors.get(id);
        return new Set(source).size === source.length && source.every(value => done.has(value)) && members.filter(value => value === source[0]).length === 1;
      });
      write(keys.members, ids); write(keys.order, ids); write(keys.daily(day()), completed);
      validate();
      const savedDone = JSON.parse(localStorage.getItem(keys.daily(day())));
      if (JSON.stringify(savedDone) !== JSON.stringify(completed)) throw new Error('Invalid migrated completion');
      write(markerKey, { schema:1, unmapped }); // Last: restart retries from backup.
      notice = unmapped.length ? 'Sebahagian bacaan lama ialah petikan atau bacaan tersuai dan tidak ditukar kepada surah penuh. Bacaan asal kekal dalam Isi; sandaran migrasi disimpan.' : '';
      ready = true;
    } catch {
      ready = false;
      notice = 'Checklist Quran belum dapat disediakan. Data asal dan sandaran yang tersedia dikekalkan. Semak storan pelayar dan muat semula.';
    }
  }
  initialize();
  window.QuranChecklist = { keys, validId, day, get ready() { return ready; }, get notice() { return notice; } };
})();
