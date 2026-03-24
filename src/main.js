async function loadMapper() {
  const res = await fetch('/src/mapper.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('mapper.json を読み込めませんでした');
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
  const copyBtn = document.getElementById('copy');
  const downloadBtn = document.getElementById('download');

  const regex = buildRegex(Object.keys(mapper));

  function convertText(text) {
    return text.replace(regex, (m) => mapper[m] ?? m);
  }

  convertBtn.addEventListener('click', () => {
    const src = inputEl.value;
    const converted = convertText(src);
    outputEl.value = converted;
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputEl.value);
      copyBtn.textContent = 'コピーしました';
      setTimeout(() => (copyBtn.textContent = 'コピー'), 1200);
    } catch {
      copyBtn.textContent = 'コピー失敗';
      setTimeout(() => (copyBtn.textContent = 'コピー'), 1200);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([outputEl.value], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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