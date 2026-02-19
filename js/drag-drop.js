/* ===== drag-drop.js — Drag & Drop labels game with connector lines ===== */

function initDragDrop() {
  loadSVG('drag-drop-svg-wrapper').then(svg => {
    const wrapper = document.getElementById('drag-drop-svg-wrapper');
    const wordsContainer = document.getElementById('drag-words');
    const restartBtn = document.getElementById('drag-drop-restart');

    // Drop zone positions (% of SVG wrapper) + anchor point on body for line
    const dropConfig = [
      { id: 'hair',     left: '-5%',  top: '6%',   ax: '50%', ay: '10%' },
      { id: 'head',     left: '105%', top: '14%',  ax: '60%', ay: '18%' },
      { id: 'eye',      left: '105%', top: '17%',  ax: '56%', ay: '18%' },
      { id: 'ear',      left: '-5%',  top: '17%',  ax: '36%', ay: '18%' },
      { id: 'nose',     left: '105%', top: '20%',  ax: '50%', ay: '21%' },
      { id: 'mouth',    left: '105%', top: '23%',  ax: '50%', ay: '24%' },
      { id: 'neck',     left: '-5%',  top: '28%',  ax: '50%', ay: '30%' },
      { id: 'shoulder', left: '-5%',  top: '32%',  ax: '34%', ay: '32%' },
      { id: 'chest',    left: '105%', top: '35%',  ax: '60%', ay: '38%' },
      { id: 'arm',      left: '-5%',  top: '42%',  ax: '25%', ay: '42%' },
      { id: 'elbow',    left: '-5%',  top: '43%',  ax: '27%', ay: '43%' },
      { id: 'stomach',  left: '105%', top: '48%',  ax: '55%', ay: '50%' },
      { id: 'finger',   left: '-5%',  top: '54%',  ax: '22%', ay: '54%' },
      { id: 'leg',      left: '105%', top: '68%',  ax: '60%', ay: '70%' },
      { id: 'knee',     left: '105%', top: '72%',  ax: '60%', ay: '72%' },
      { id: 'foot',     left: '-5%',  top: '84%',  ax: '40%', ay: '85%' },
      { id: 'toe',      left: '-5%',  top: '88%',  ax: '40%', ay: '89%' },
    ];

    let placed = 0;
    const total = dropConfig.length;

    // SVG overlay for connector lines
    let linesSvg = null;

    function createLinesSvg() {
      if (linesSvg) linesSvg.remove();
      linesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      linesSvg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
      linesSvg.setAttribute('viewBox', '0 0 100 100');
      linesSvg.setAttribute('preserveAspectRatio', 'none');
      wrapper.appendChild(linesSvg);
    }

    function addLine(cfg) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      // From drop zone position to anchor on body
      line.setAttribute('x1', parseFloat(cfg.left));
      line.setAttribute('y1', parseFloat(cfg.top));
      line.setAttribute('x2', parseFloat(cfg.ax));
      line.setAttribute('y2', parseFloat(cfg.ay));
      line.setAttribute('stroke', '#4A90D9');
      line.setAttribute('stroke-width', '0.3');
      line.setAttribute('stroke-dasharray', '1,0.5');
      line.setAttribute('opacity', '0.5');
      line.dataset.part = cfg.id;
      linesSvg.appendChild(line);
    }

    function setup() {
      placed = 0;
      wrapper.querySelectorAll('.drop-zone').forEach(z => z.remove());
      wordsContainer.innerHTML = '';
      restartBtn.style.display = 'none';
      document.getElementById('drag-drop-feedback').textContent = '';

      createLinesSvg();

      // Create drop zones with connector lines
      dropConfig.forEach(cfg => {
        addLine(cfg);

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

        // Make the connector line solid green
        const line = linesSvg.querySelector(`line[data-part="${partId}"]`);
        if (line) {
          line.setAttribute('stroke', '#27ae60');
          line.setAttribute('stroke-dasharray', 'none');
          line.setAttribute('opacity', '0.8');
        }

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

    restartBtn.addEventListener('click', setup);
    setup();
  });
}
