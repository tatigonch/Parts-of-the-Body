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
