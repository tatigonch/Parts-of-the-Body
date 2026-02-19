/* ===== label-body.js — Label the Body (drag labels onto SVG) ===== */

function initLabelBody() {
  loadSVG('label-body-svg-wrapper').then(svg => {
    const wrapper = document.getElementById('label-body-svg-wrapper');
    const wordsContainer = document.getElementById('label-body-words');
    const restartBtn = document.getElementById('label-body-restart');

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

    let placed = 0;
    const total = labelConfig.length;

    function redrawLines() {
      drawConnectorLines(wrapper, svg);
    }

    function setup() {
      placed = 0;
      wrapper.querySelectorAll('.drop-zone').forEach(z => z.remove());
      const oldCanvas = wrapper.querySelector('.connector-canvas');
      if (oldCanvas) oldCanvas.remove();
      wordsContainer.innerHTML = '';
      restartBtn.style.display = 'none';
      document.getElementById('label-body-feedback').textContent = '';

      labelConfig.forEach(cfg => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.part = cfg.id;
        zone.style.left = cfg.left;
        zone.style.top = cfg.top;
        zone.style.transform = 'translate(-50%, -50%)';
        zone.style.zIndex = '2';
        zone.textContent = '?';

        zone.addEventListener('dragover', e => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
          zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', e => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          handleDrop(zone, e.dataTransfer.getData('text/plain'));
        });

        wrapper.appendChild(zone);
      });

      const shuffled = shuffle(labelConfig.map(c => c.id));
      shuffled.forEach(id => {
        const part = getPartById(id);
        if (!part) return;
        const card = document.createElement('div');
        card.className = 'drag-card';
        card.textContent = part.word;
        card.draggable = true;
        card.dataset.part = id;

        card.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', id);
          card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        setupTouchDrag(card, wrapper);
        wordsContainer.appendChild(card);
      });

      requestAnimationFrame(() => requestAnimationFrame(redrawLines));
    }

    function handleDrop(zone, partId) {
      if (zone.classList.contains('filled')) return;

      if (zone.dataset.part === partId) {
        const part = getPartById(partId);
        zone.textContent = part.word;
        zone.classList.add('filled');
        showFeedback('label-body-feedback', true);

        const card = wordsContainer.querySelector(`.drag-card[data-part="${partId}"]`);
        if (card) card.classList.add('placed');

        placed++;
        redrawLines();

        if (placed >= total) {
          setTimeout(() => {
            showFeedback('label-body-feedback', true, '🎉 All parts labeled!');
            restartBtn.style.display = 'inline-block';
          }, 500);
        }
      } else {
        showFeedback('label-body-feedback', false);
      }
    }

    function setupTouchDrag(card, dropParent) {
      let clone = null;

      card.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        clone = card.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.8';
        clone.style.width = card.offsetWidth + 'px';
        clone.style.left = (touch.clientX - card.offsetWidth / 2) + 'px';
        clone.style.top = (touch.clientY - card.offsetHeight / 2) + 'px';
        document.body.appendChild(clone);
        card.classList.add('dragging');
      }, { passive: true });

      card.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!clone) return;
        const touch = e.touches[0];
        clone.style.left = (touch.clientX - card.offsetWidth / 2) + 'px';
        clone.style.top = (touch.clientY - card.offsetHeight / 2) + 'px';

        dropParent.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el.classList.contains('drop-zone')) {
          el.classList.add('drag-over');
        }
      }, { passive: false });

      card.addEventListener('touchend', e => {
        card.classList.remove('dragging');
        if (!clone) return;
        const touch = e.changedTouches[0];
        clone.remove();
        clone = null;

        dropParent.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el.classList.contains('drop-zone')) {
          handleDrop(el, card.dataset.part);
        }
      });
    }

    window.addEventListener('resize', redrawLines);

    restartBtn.addEventListener('click', setup);
    setup();
  });
}
