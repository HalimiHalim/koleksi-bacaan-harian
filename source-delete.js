(() => {
  'use strict';
  // Only live source-reading references. Quran IDs and recovery snapshots are separate.
  window.planCustomSourceDeletion = (storage, id, items, deleted) => {
    if (typeof id !== 'string' || !/^u-[a-z0-9-]+$/.test(id) || !items.some(item => item.id === id)) {
      throw new Error('Bacaan asal dikunci atau bacaan tersuai tidak ditemui. Tiada bacaan dipadam.');
    }
    const changes = [
      ['uwa-custom-readings-v1', JSON.stringify(items.filter(item => item.id !== id))],
      ['uwa-deleted-reading-ids-v1', JSON.stringify(deleted.includes(id) ? deleted : [...deleted, id])]
    ];
    const valid = value => typeof value === 'string' ? /^[a-z0-9_-]+$/i.test(value)
      : typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
    function read(key, label, unique = true) {
      let raw;
      try { raw = storage.getItem(key); }
      catch { throw new Error(`Storan ${label} tidak dapat diakses. Tiada bacaan dipadam.`); }
      if (raw === null) return null; // No explicit collection, not a failed read.
      try {
        const values = JSON.parse(raw);
        if (!Array.isArray(values) || !values.every(valid) ||
            (unique && new Set(values.map(String)).size !== values.length)) throw new Error();
        return values;
      } catch { throw new Error(`Data ${label} tidak sah. Data asal dikekalkan; tiada bacaan dipadam.`); }
    }
    function remove(key, values) {
      if (values?.some(value => String(value) === id)) {
        changes.push([key, JSON.stringify(values.filter(value => String(value) !== id))]);
      }
    }
    for (const [type, label] of [['morning', 'Zikir'], ['evening', 'Himpunan Doa']]) {
      for (const [membersKey, orderKey, suffix] of [
        [`uwa-navigation-renovation-trial-v1-members-${type}`, `uwa-navigation-renovation-trial-v1-order-${type}`, ''],
        [`uwa-routine-members-${type}-v1`, `uwa-routine-order-${type}-v1`, ' asal']
      ]) {
        const members = read(membersKey, label + suffix + ' (senarai)'), order = read(orderKey, label + suffix + ' (susunan)');
        // With an explicit membership, an unrelated orphan order is invalid data.
        if (members !== null && order?.some(value => !members.some(member => String(member) === String(value)))) {
          throw new Error(`Susunan ${label}${suffix} tidak sepadan dengan senarai. Tiada bacaan dipadam.`);
        }
        remove(membersKey, members); remove(orderKey, order);
      }
    }
    let keys;
    try { keys = Array.from({ length:storage.length }, (_, index) => storage.key(index)); }
    catch { throw new Error('Senarai storan tidak dapat diakses. Tiada bacaan dipadam.'); }
    for (const key of keys) {
      const match = /^(?:uwa-daily-|uwa-navigation-renovation-trial-v1-daily-)\d{4}-\d{2}-\d{2}-(morning|evening)$/.exec(key);
      if (!match) continue; // Never read obsolete Quran assignments or historical backups.
      remove(key, read(key, (match[1] === 'morning' ? 'Zikir' : 'Himpunan Doa') + ' (tanda selesai)', false));
    }
    return changes;
  };
})();
