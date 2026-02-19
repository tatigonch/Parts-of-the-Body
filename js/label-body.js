/* ===== label-body.js — Label the Body (type the words) ===== */

function initLabelBody() {
  loadSVG('label-body-svg-wrapper').then(svg => {
    const wrapper = document.getElementById('label-body-svg-wrapper');
    const checkBtn = document.getElementById('label-body-check');
    const restartBtn = document.getElementById('label-body-restart');

    // Input fields: alternating left/right
    const labelConfig = [
      { id: 'head',     left: '105%', top: '14%' },
      { id: 'shoulder', left: '-5%',  top: '32%' },
      { id: 'chest',    left: '105%', top: '38%' },
      { id: 'arm',      left: '-5%',  top: '43%' },
      { id: 'stomach',  left: '105%', top: '50%' },
      { id: 'leg',      left: '105%', top: '68%' },
      { id: 'knee',     left: '-5%',  top: '72%' },
      { id: 'foot',     left: '-5%',  top: '85%' },
    ];

    let inputs = [];

    function redrawLines() {
      drawConnectorLines(wrapper, svg);
    }

    function setup() {
      // Clear old inputs and canvas
      wrapper.querySelectorAll('.label-input-box').forEach(el => el.remove());
      wrapper.querySelectorAll('.drop-zone').forEach(el => el.remove());
      const oldCanvas = wrapper.querySelector('.connector-canvas');
      if (oldCanvas) oldCanvas.remove();
      inputs = [];
      checkBtn.style.display = 'inline-block';
      restartBtn.style.display = 'none';
      document.getElementById('label-body-feedback').textContent = '';

      labelConfig.forEach(cfg => {
        const box = document.createElement('div');
        box.className = 'label-input-box drop-zone';
        box.dataset.part = cfg.id;
        box.style.left = cfg.left;
        box.style.top = cfg.top;
        box.style.transform = 'translate(-50%, -50%)';
        box.style.zIndex = '2';
        box.style.padding = '0';
        box.style.minWidth = '90px';
        box.style.height = '34px';
        box.style.background = '#fff';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'label-input';
        input.placeholder = '?';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.dataset.part = cfg.id;

        box.appendChild(input);
        wrapper.appendChild(box);
        inputs.push(input);
      });

      // Draw connector lines after layout
      requestAnimationFrame(() => requestAnimationFrame(redrawLines));
    }

    checkBtn.addEventListener('click', () => {
      let allCorrect = true;
      let correctCount = 0;

      inputs.forEach(input => {
        const partId = input.dataset.part;
        const part = getPartById(partId);
        const val = input.value.trim().toLowerCase();
        const box = input.parentElement;

        if (val === part.word.toLowerCase()) {
          input.classList.remove('wrong');
          input.classList.add('correct');
          box.classList.add('filled');
          input.readOnly = true;
          correctCount++;
        } else {
          input.classList.remove('correct');
          input.classList.add('wrong');
          box.classList.remove('filled');
          allCorrect = false;
        }
      });

      redrawLines();

      if (allCorrect) {
        showFeedback('label-body-feedback', true, '🎉 All parts labeled correctly!');
        checkBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
      } else if (correctCount > 0) {
        showFeedback('label-body-feedback', false, '❌ Some answers are wrong — try again!');
      } else {
        showFeedback('label-body-feedback', false, '❌ Try again!');
      }
    });

    restartBtn.addEventListener('click', setup);

    window.addEventListener('resize', redrawLines);
    setup();
  });
}
