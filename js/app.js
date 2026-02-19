/* ===== app.js — Navigation, SVG loading, shared helpers ===== */

// --- Speech API helper ---
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

// --- Load SVG into a wrapper element ---
function loadSVG(wrapperId) {
  return fetch('assets/body.svg')
    .then(r => r.text())
    .then(svgText => {
      const wrapper = document.getElementById(wrapperId);
      wrapper.innerHTML = svgText;
      return wrapper.querySelector('svg');
    });
}

// --- Shuffle array (Fisher–Yates) ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Show feedback message ---
function showFeedback(elId, correct, message) {
  const el = document.getElementById(elId);
  el.textContent = message || (correct ? '✅ Well done!' : '❌ Try again');
  el.className = 'game-feedback ' + (correct ? 'correct anim-pop' : 'wrong anim-shake');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.textContent = '';
    el.className = 'game-feedback';
  }, 1800);
}

// --- Exact anchor points for each body part in SVG viewBox coords (400x650) ---
const BODY_ANCHORS = {
  hair:     { x: 200, y: 85 },
  head:     { x: 200, y: 105 },
  forehead: { x: 200, y: 90 },
  eye:      { x: 220, y: 115 },
  ear:      { x: 145, y: 120 },
  nose:     { x: 200, y: 130 },
  cheek:    { x: 232, y: 135 },
  mouth:    { x: 200, y: 153 },
  lip:      { x: 200, y: 147 },
  chin:     { x: 200, y: 168 },
  neck:     { x: 200, y: 188 },
  shoulder: { x: 135, y: 210 },
  chest:    { x: 200, y: 240 },
  arm:      { x: 95,  y: 310 },
  elbow:    { x: 105, y: 282 },
  stomach:  { x: 200, y: 325 },
  finger:   { x: 83,  y: 355 },
  leg:      { x: 157, y: 445 },
  knee:     { x: 157, y: 468 },
  foot:     { x: 152, y: 548 },
  toe:      { x: 151, y: 573 },
};

// --- Draw connector lines from drop zones to SVG body parts ---
function drawConnectorLines(wrapper, svg) {
  let canvas = wrapper.querySelector('.connector-canvas');
  if (canvas) canvas.remove();

  canvas = document.createElement('canvas');
  canvas.className = 'connector-canvas';
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';

  const wRect = wrapper.getBoundingClientRect();
  canvas.width = wRect.width;
  canvas.height = wRect.height;
  wrapper.appendChild(canvas);

  // Figure out where the SVG is rendered inside the wrapper
  const svgRect = svg.getBoundingClientRect();
  const svgViewBox = svg.viewBox.baseVal;
  const scaleX = svgRect.width / svgViewBox.width;
  const scaleY = svgRect.height / svgViewBox.height;
  const svgOffX = svgRect.left - wRect.left;
  const svgOffY = svgRect.top - wRect.top;

  const ctx = canvas.getContext('2d');

  wrapper.querySelectorAll('.drop-zone').forEach(zone => {
    const partId = zone.dataset.part;
    const anchor = BODY_ANCHORS[partId];
    if (!anchor) return;

    const zRect = zone.getBoundingClientRect();

    // Drop zone center relative to wrapper
    const x1 = zRect.left + zRect.width / 2 - wRect.left;
    const y1 = zRect.top + zRect.height / 2 - wRect.top;

    // Body anchor point converted from SVG coords to wrapper pixels
    const x2 = svgOffX + anchor.x * scaleX;
    const y2 = svgOffY + anchor.y * scaleY;

    const filled = zone.classList.contains('filled');

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = filled ? '#27ae60' : '#4A90D9';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = filled ? 0.8 : 0.4;
    ctx.setLineDash(filled ? [] : [6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Dot at body part end
    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, Math.PI * 2);
    ctx.fillStyle = filled ? '#27ae60' : '#4A90D9';
    ctx.globalAlpha = filled ? 0.8 : 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  return canvas;
}

// --- Mobile nav toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close mobile nav on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  // Initialize all sections
  initLearn();
  initClickWord();
  initListenFind();
  initDragDrop();
  initLabelBody();
  initDictionary();
});

// --- Dictionary init ---
function initDictionary() {
  const tbody = document.getElementById('dictionary-body');
  BODY_PARTS.forEach(part => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${part.word}</strong></td>
      <td>${part.transcription}</td>
      <td>${part.ru}</td>
      <td>${part.be}</td>
      <td><button class="speak-btn" data-word="${part.word}">🔊</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.speak-btn');
    if (btn) speak(btn.dataset.word);
  });
}
