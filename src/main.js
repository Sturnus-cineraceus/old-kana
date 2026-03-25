async function loadMapper() {
  const res = await fetch('/src/mapper.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('mapper.json を読み込めませんでした');
  // 配列を維持して返す（変換時に毎回ランダム選択する）
  return await res.json();
}

function escapeRegex(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function buildRegex(keys) {
  // 長いキーを優先するためソート（降順）
  const sorted = keys.slice().sort((a, b) => b.length - a.length);
  return new RegExp(sorted.map(escapeRegex).join('|'), 'g');
}

function setupUI(mapper) {
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const convertBtn = document.getElementById('convert');

  const regex = buildRegex(Object.keys(mapper));

  function convertText(text) {
    return text.replace(regex, (m) => {
      const v = mapper[m];
      if (Array.isArray(v) && v.length > 0) {
        const pick = v[Math.floor(Math.random() * v.length)];
        return String.fromCodePoint(parseInt(pick.replace(/^U\+/i, ''), 16));
      } else if (typeof v === 'string') {
        return v;
      }
      return m;
    });
  }

  convertBtn.addEventListener('click', () => {
    const src = inputEl.value;
    const converted = convertText(src);
    outputEl.value = converted;
  });
}

(async () => {
  try {
    const mapper = await loadMapper();
    setupUI(mapper);
  } catch (err) {
    console.error(err);
    const container = document.querySelector('.container');
    container.innerHTML = '<p style="color:red">初期化中にエラーが発生しました。コンソールを確認してください。</p>';
  }
})();