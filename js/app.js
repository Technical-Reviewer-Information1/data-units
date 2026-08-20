(function () {
  'use strict';
  const T = window.Tools, $ = id => document.getElementById(id);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const UNITS = [
    { n: 'B', m: 1, d: 'バイト（1B＝8ビット）' },
    { n: 'KB', m: 1e3, d: 'キロバイト＝1000B' },
    { n: 'MB', m: 1e6, d: 'メガバイト＝1000KB' },
    { n: 'GB', m: 1e9, d: 'ギガバイト＝1000MB' },
    { n: 'TB', m: 1e12, d: 'テラバイト＝1000GB' }
  ];
  const fmt = v => {
    if (v === 0) return '0';
    if (Math.abs(v) >= 1e15 || Math.abs(v) < 1e-4) return v.toExponential(3);
    return (Math.round(v * 1e4) / 1e4).toLocaleString('ja-JP');
  };

  /* ---------- STEP1 ---------- */
  function drawLadder() {
    const sel = $('unitIn').value;
    $('ladder').innerHTML = UNITS.slice().reverse().map((u, i, arr) =>
      '<div class="u' + (u.n === sel ? ' sel' : '') + '"><div class="nm">1 ' + u.n + '</div><div class="sz">' + u.d + '</div></div>' +
      (i < arr.length - 1 ? '<div class="ar">↑ 1000倍</div>' : '')).join('');
  }
  function drawConv() {
    const v = parseFloat($('valIn').value) || 0;
    const u = UNITS.find(x => x.n === $('unitIn').value) || UNITS[0];
    const bytes = v * u.m;
    $('convTable').innerHTML = '<thead><tr><th>単位</th><th>値</th></tr></thead><tbody>' +
      UNITS.map(x => '<tr' + (x.n === u.n ? ' style="background:var(--warn-bg);font-weight:700"' : '') +
        '><td>' + x.n + '</td><td class="mono">' + fmt(bytes / x.m) + '</td></tr>').join('') +
      '<tr><td>bit（ビット）</td><td class="mono">' + fmt(bytes * 8) + '</td></tr></tbody>';
    drawLadder();
  }

  /* ---------- STEP2 ドリル ---------- */
  let dScore = 0, dTotal = 0, dAns = '', drillNo = 0;
  function newDrill() {
    const VS = [1, 2, 4, 5, 8, 10, 16, 20, 32, 50, 64, 100, 128, 200, 256, 500];
    const up = (drillNo++ % 2 === 0);
    let from, to, v, ans;
    do {
      from = UNITS[Math.floor(Math.random() * 5)];
      to = UNITS[Math.floor(Math.random() * 5)];
      v = VS[Math.floor(Math.random() * VS.length)];
      ans = v * from.m / to.m;
    } while (to.n === from.n || ans < 0.001 || ans > 1e9 ||
             (up ? to.m <= from.m : to.m >= from.m));
    dAns = fmt(ans);
    $('dText').textContent = v + ' ' + from.n + ' は何 ' + to.n + ' か。';
    const choices = [dAns, fmt(ans * 1000), fmt(ans / 1000), fmt(ans * 8)];
    const box = $('dChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle([...new Set(choices)]).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c + ' ' + to.n; b.dataset.c = c; b.style.textAlign = 'center';
      b.addEventListener('click', () => answerDrill(c));
      box.appendChild(b);
    });
    $('dFb').hidden = true;
    $('dProgress').textContent = (dTotal + 1) + ' 問目';
  }
  function answerDrill(c) {
    const ok = c === dAns, box = $('dChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === dAns) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    dTotal++; if (ok) dScore++;
    $('dScore').textContent = dScore; $('dTotal').textContent = dTotal;
    const fb = $('dFb'); fb.hidden = false;
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = ok ? '正解です。' : '正解は <strong>' + dAns + '</strong>。1つ上の単位に上がるごとに1000で割り、下がるごとに1000をかけます。';
  }

  /* ---------- STEP3 容量 ---------- */
  function drawCap() {
    const cap = +$('capV').value, fa = +$('fA').value, na = +$('nA').value, fb2 = +$('fB').value, nb = +$('nB').value;
    ['capVv', 'fAv', 'nAv', 'fBv', 'nBv'].forEach((id, i) => $(id).textContent = [cap, fa, na, fb2, nb][i].toLocaleString());
    const totalMb = fa * na + fb2 * nb;
    const capMb = cap * 1000;
    $('totMb').textContent = fmt(totalMb) + ' MB（' + fmt(totalMb / 1000) + ' GB）';
    const p = capMb ? totalMb / capMb * 100 : 0;
    $('pct').textContent = p.toFixed(1) + '％';
    $('capBar').style.width = Math.min(100, p) + '%';
    $('capBar').className = p > 100 ? 'over' : '';
    const n = $('capNote');
    n.className = 'note ' + (p > 100 ? 'ng' : 'ok');
    n.innerHTML = fa + 'MB × ' + na.toLocaleString() + ' ＝ ' + fmt(fa * na) + 'MB、' +
      fb2 + 'MB × ' + nb.toLocaleString() + ' ＝ ' + fmt(fb2 * nb) + 'MB。合計 <strong>' + fmt(totalMb) + 'MB ＝ ' +
      fmt(totalMb / 1000) + 'GB</strong>。<br>' +
      (p > 100
        ? '容量 ' + cap + 'GB を <strong>' + fmt(totalMb / 1000 - cap) + 'GB 超えています</strong>。保存できません。'
        : '容量 ' + cap + 'GB に<strong>収まります</strong>（残り ' + fmt(cap - totalMb / 1000) + 'GB）。');
  }

  /* ---------- STEP4 本文の判定 ---------- */
  const JUDGE = [
    { L: 'a', t: '256GBのスマートフォンに、4MBの画像40000枚と200MBの動画600本を保存できる。',
      calc: '4 × 40000 ＝ 160,000MB ＝ 160GB、200 × 600 ＝ 120,000MB ＝ 120GB。合計 <strong>280GB</strong>。',
      ok: false, why: '256GB を 24GB 超えるので保存できません。' },
    { L: 'b', t: '16GBのUSBメモリに、2MBの画像を8000枚以上保存できる。',
      calc: '2 × 8000 ＝ 16,000MB ＝ <strong>16GB</strong>。',
      ok: true, why: '16GB にちょうど収まります。（実際は管理領域があるためぎりぎりですが、計算上は保存できます。）' },
    { L: 'c', t: '1TBのハードディスクに、1分あたり100MBの番組を200時間以上保存できる。',
      calc: '200時間 ＝ 12,000分。100 × 12,000 ＝ 1,200,000MB ＝ <strong>1,200GB ＝ 1.2TB</strong>。',
      ok: false, why: '1TB を超えるので保存できません。1TB では約166時間までです。' },
    { L: 'd', t: '10MBの画像5,000枚と200MBの動画500本を保存するには、128GBまでのクラウドサービスに登録する必要がある。',
      calc: '10 × 5,000 ＝ 50,000MB ＝ 50GB、200 × 500 ＝ 100,000MB ＝ 100GB。合計 <strong>150GB</strong>。',
      ok: false, why: '150GB 必要なので、128GB では足りません。もっと大きな容量が必要です。' }
  ];
  let showCalc = false;
  function drawJudge() {
    $('judgeTable').innerHTML = '<thead><tr><th style="width:2.4em"></th><th>記述</th>' + (showCalc ? '<th>計算</th>' : '') + '<th>判定</th></tr></thead><tbody>' +
      JUDGE.map(j => '<tr><td class="mono" style="font-weight:700">' + j.L + '</td><td>' + j.t + '</td>' + (showCalc ? '<td>' + j.calc + '<br><span class="small">' + j.why + '</span></td>' : '') +
        '<td class="' + (showCalc ? (j.ok ? 'ok' : 'ng') : '') + '">' + (showCalc ? (j.ok ? '正しい' : '誤り') : '？') + '</td></tr>').join('') + '</tbody>';
    const n = $('judgeNote');
    if (showCalc) {
      n.className = 'note ok';
      n.innerHTML = '正しいものは <strong>1つ（b のみ）</strong>です。' +
        'いずれも<strong>MBにそろえてから合計する</strong>だけで判定できます。桁を1つ間違えると答えが変わるので注意しましょう。';
    } else {
      n.className = 'note info';
      n.textContent = 'まず自分で計算してみてから、「計算を表示する」を押してください。';
    }
  }

  /* ---------- STEP5 クイズ ---------- */
  const QUIZ = [
    { t: '情報量の大小関係として正しいものはどれか。',
      choices: ['1KB＜1MB＜1GB＜1TB', '1KB＜1MB＜1TB＜1GB', '1TB＜1KB＜1MB＜1GB', '1KB＜1TB＜1MB＜1GB'],
      a: '1KB＜1MB＜1GB＜1TB',
      why: 'キロ → メガ → ギガ → テラ の順に1000倍ずつ大きくなります。' },
    { t: '1GBは何MBか。', choices: ['1000MB', '100MB', '10000MB', '8000MB'], a: '1000MB',
      why: '1つ上の単位は1000倍です。8倍するのはバイトとビットの変換です。' },
    { t: '1MBは何ビットか。', choices: ['8,000,000ビット', '1,000,000ビット', '800,000ビット', '8,000ビット'],
      a: '8,000,000ビット', why: '1MB ＝ 1,000,000B。1B＝8bit なので8倍して8,000,000ビットです。' },
    { t: '4MBの画像を40000枚保存するには何GB必要か。',
      choices: ['160GB', '16GB', '1600GB', '40GB'], a: '160GB',
      why: '4 × 40000 ＝ 160,000MB。1000で割って160GBです。' },
    { t: '1TBに1分100MBの番組は何時間保存できるか（およそ）。',
      choices: ['約166時間', '約200時間', '約100時間', '約1000時間'], a: '約166時間',
      why: '1TB ＝ 1,000,000MB。1,000,000 ÷ 100 ＝ 10,000分 ＝ 約166.7時間です。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  function startQuiz() { qList = shuffle(QUIZ); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').textContent = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle(it.choices).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c; b.style.textAlign = 'center';
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  function init() {
    $('unitIn').innerHTML = UNITS.map(u => '<option value="' + u.n + '"' + (u.n === 'GB' ? ' selected' : '') + '>' + u.n + '</option>').join('');
    ['valIn', 'unitIn'].forEach(i => $(i).addEventListener('input', drawConv));
    $('unitIn').addEventListener('change', drawConv);
    $('dNext').addEventListener('click', newDrill);
    ['capV', 'fA', 'nA', 'fB', 'nB'].forEach(i => $(i).addEventListener('input', drawCap));
    $('showCalc').addEventListener('click', () => { showCalc = true; drawJudge(); });
    $('hideCalc').addEventListener('click', () => { showCalc = false; drawJudge(); });
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', startQuiz);
    window.Terms.glossary($('glossBox'), ['デジタル', 'ビット毎秒', '基数変換', '2進法', '解像度']);
    drawConv(); newDrill(); drawCap(); drawJudge(); startQuiz();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
