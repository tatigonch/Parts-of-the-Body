/* ===== listen-find.js — Listen & Find game ===== */

function initListenFind() {
  loadSVG('listen-find-svg-wrapper').then(svg => {
    let words = shuffle([...BODY_PARTS]);
    let current = 0;
    const progressBar = document.getElementById('listen-find-progress');
    const playBtn = document.getElementById('listen-play-btn');
    const hintEl = document.getElementById('listen-hint');
    const restartBtn = document.getElementById('listen-find-restart');

    function speakCurrent() {
      if (current < words.length) {
        speak('Touch the ' + words[current].word.toLowerCase());
      }
    }

    function showCurrent() {
      if (current >= words.length) {
        showFeedback('listen-find-feedback', true, '🎉 Excellent! All done!');
        hintEl.textContent = '';
        playBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        return;
      }
      progressBar.style.width = (current / words.length * 100) + '%';
      hintEl.textContent = 'Press 🔊 to hear the word, then click the right body part.';
    }

    playBtn.addEventListener('click', speakCurrent);

    function clearHighlights() {
      svg.querySelectorAll('.body-part').forEach(el => {
        el.classList.remove('highlight-correct', 'highlight-wrong');
      });
    }

    svg.querySelectorAll('.body-part').forEach(el => {
      const partId = el.dataset.part || el.id;

      el.addEventListener('click', () => {
        if (current >= words.length) return;
        clearHighlights();

        if (partId === words[current].id) {
          el.classList.add('highlight-correct');
          showFeedback('listen-find-feedback', true);
          current++;
          setTimeout(() => {
            clearHighlights();
            showCurrent();
          }, 1200);
        } else {
          el.classList.add('highlight-wrong');
          showFeedback('listen-find-feedback', false);
          setTimeout(clearHighlights, 800);
        }
      });
    });

    restartBtn.addEventListener('click', () => {
      words = shuffle([...BODY_PARTS]);
      current = 0;
      restartBtn.style.display = 'none';
      playBtn.style.display = 'inline-block';
      document.getElementById('listen-find-feedback').textContent = '';
      showCurrent();
    });

    showCurrent();
  });
}
