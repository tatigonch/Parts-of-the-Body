/* ===== drag-drop.js — Drag & Drop labels game ===== */

function initDragDrop() {
  loadSVG('drag-drop-svg-wrapper').then(svg => {
    const wrapper = document.getElementById('drag-drop-svg-wrapper');
    const wordsContainer = document.getElementById('drag-words');
    const restartBtn = document.getElementById('drag-drop-restart');

    // Use a subset of parts that have clear visual positions for drop zones
    const dropConfig = [
      { id: 'hair',     left: '50%', top: '8%' },
      { id: 'head',     left: '50%', top: '17%' },
      { id: 'eye',      left: '82%', top: '17%' },
      { id: 'ear',      left: '18%', top: '19%' },
      { id: 'nose',     left: '82%', top: '22%' },
      { id: 'mouth',    left: '82%', top: '26%' },
      { id: 'neck',     left: '50%', top: '32%' },
      { id: 'shoulder', left: '18%', top: '34%' },
      { id: 'chest',    left: '50%', top: '40%' },
      { id: 'arm',      left: '10%', top: '48%' },
      { id: 'elbow',    left: '10%', top: '46%' },
      { id: 'stomach',  left: '50%', top: '53%' },
      { id: 'finger',   left: '10%', top: '58%' },
      { id: 'leg',      left: '82%', top: '70%' },
      { id: 'knee',     left: '82%', top: '73%' },
      { id: 'foot',     left: '50%', top: '88%' },
      { id: 'toe',      left: '50%', top: '92%' },
    ];

    let placed = 0;
    const total = dropConfig.length;

    function setup() {
      placed = 0;
      // Clear existing
      wrapper.querySelectorAll('.drop-zone').forEach(z => z.remove());
      wordsContainer.innerHTML = '';
      restartBtn.style.display = 'none';
      document.getElementById('drag-drop-feedback').textContent = '';

      // Create drop zones
      dropConfig.forEach(cfg => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.part = cfg.id;
        zone.style.left = cfg.left;
        zone.style.top = cfg.top;
        zone.style.transform = 'translate(-50%, -50%)';
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
          const word = e.dataTransfer.getData('text/plain');
          handleDrop(zone, word);
        });

        wrapper.appendChild(zone);
      });

      // Create draggable word cards
      const shuffled = shuffle(dropConfig.map(c => c.id));
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

        // Touch support
        setupTouchDrag(card, wrapper);

        wordsContainer.appendChild(card);
      });
    }

    function handleDrop(zone, partId) {
      if (zone.classList.contains('filled')) return;

      if (zone.dataset.part === partId) {
        const part = getPartById(partId);
        zone.textContent = part.word;
        zone.classList.add('filled');
        showFeedback('drag-drop-feedback', true);

        const card = wordsContainer.querySelector(`.drag-card[data-part="${partId}"]`);
        if (card) card.classList.add('placed');

        placed++;
        if (placed >= total) {
          setTimeout(() => {
            showFeedback('drag-drop-feedback', true, '🎉 Perfect! All labels placed!');
            restartBtn.style.display = 'inline-block';
          }, 500);
        }
      } else {
        showFeedback('drag-drop-feedback', false);
      }
    }

    // Touch drag support
    function setupTouchDrag(card, dropParent) {
      let clone = null;
      let startX, startY;

      card.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        clone = card.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.8';
        clone.style.width = card.offsetWidth + 'px';
        clone.style.left = (startX - card.offsetWidth / 2) + 'px';
        clone.style.top = (startY - card.offsetHeight / 2) + 'px';
        document.body.appendChild(clone);
        card.classList.add('dragging');
      }, { passive: true });

      card.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!clone) return;
        const touch = e.touches[0];
        clone.style.left = (touch.clientX - card.offsetWidth / 2) + 'px';
        clone.style.top = (touch.clientY - card.offsetHeight / 2) + 'px';

        // Highlight drop zone under finger
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

    restartBtn.addEventListener('click', setup);
    setup();
  });
}
