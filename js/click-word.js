/* ===== click-word.js — Click the Word game ===== */

function initClickWord() {
  loadSVG('click-word-svg-wrapper').then(svg => {
    let words = shuffle([...BODY_PARTS]);
    let current = 0;
    const targetEl = document.getElementById('click-word-target');
    const progressBar = document.getElementById('click-word-progress');
    const restartBtn = document.getElementById('click-word-restart');

    function showWord() {
      if (current >= words.length) {
        showFeedback('click-word-feedback', true, '🎉 Amazing! You got them all!');
        targetEl.textContent = '—';
        restartBtn.style.display = 'inline-block';
        return;
      }
      targetEl.textContent = words[current].word;
      progressBar.style.width = (current / words.length * 100) + '%';
    }

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
          showFeedback('click-word-feedback', true);
          speak(words[current].word);
          current++;
          setTimeout(() => {
            clearHighlights();
            showWord();
          }, 1200);
        } else {
          el.classList.add('highlight-wrong');
          showFeedback('click-word-feedback', false);
          setTimeout(clearHighlights, 800);
        }
      });
    });

    restartBtn.addEventListener('click', () => {
      words = shuffle([...BODY_PARTS]);
      current = 0;
      restartBtn.style.display = 'none';
      document.getElementById('click-word-feedback').textContent = '';
      showWord();
    });

    showWord();
  });
}
