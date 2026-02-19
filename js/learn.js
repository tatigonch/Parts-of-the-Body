/* ===== learn.js — Learn new vocabulary section ===== */

function initLearn() {
  loadSVG('learn-svg-wrapper').then(svg => {
    const tooltip = document.getElementById('learn-tooltip');
    const wordEl = tooltip.querySelector('.tooltip-word');
    const transEl = tooltip.querySelector('.tooltip-transcription');
    const translEl = tooltip.querySelector('.tooltip-translation');
    const wrapper = document.getElementById('learn-svg-wrapper');

    svg.querySelectorAll('.body-part').forEach(el => {
      const partId = el.dataset.part || el.id;
      const data = getPartById(partId);
      if (!data) return;

      el.addEventListener('mouseenter', e => {
        wordEl.textContent = data.word;
        transEl.textContent = data.transcription;
        translEl.textContent = data.ru;

        const rect = el.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - wrapperRect.left) + 'px';
        tooltip.style.top = (rect.top - wrapperRect.top - 10) + 'px';
        tooltip.classList.add('visible');
      });

      el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });

      el.addEventListener('click', () => {
        speak(data.word);
      });

      // Touch support
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        wordEl.textContent = data.word;
        transEl.textContent = data.transcription;
        translEl.textContent = data.ru;

        const rect = el.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - wrapperRect.left) + 'px';
        tooltip.style.top = (rect.top - wrapperRect.top - 10) + 'px';
        tooltip.classList.add('visible');
        speak(data.word);

        setTimeout(() => tooltip.classList.remove('visible'), 2500);
      }, { passive: false });
    });
  });
}
