/* ===== build-body.js — Build the Body game (Phase 1 + Phase 2) ===== */

function initBuildBody() {
  const target = document.getElementById('build-target');
  const partsContainer = document.getElementById('build-parts');
  const descEl = document.getElementById('build-body-desc');
  const restartBtn = document.getElementById('build-body-restart');

  // Phase 1: Build body parts config — positions on the silhouette
  const buildParts = [
    { id: 'head',    label: 'Head',    x: 100, y: 10,  w: 100, h: 100, color: '#FFDBB4' },
    { id: 'chest',   label: 'Chest',   x: 75,  y: 110, w: 150, h: 100, color: '#4A90D9' },
    { id: 'stomach', label: 'Stomach', x: 85,  y: 200, w: 130, h: 80,  color: '#4A90D9' },
    { id: 'arm',     label: 'Arms',    x: 10,  y: 120, w: 65,  h: 140, color: '#FFDBB4' },
    { id: 'leg',     label: 'Legs',    x: 90,  y: 280, w: 120, h: 140, color: '#5B6EAE' },
    { id: 'foot',    label: 'Feet',    x: 80,  y: 410, w: 140, h: 50,  color: '#E74C3C' },
  ];

  // Phase 2: Label positions
  const labelConfig = [
    { id: 'head',    left: '50%', top: '12%' },
    { id: 'chest',   left: '50%', top: '32%' },
    { id: 'stomach', left: '50%', top: '48%' },
    { id: 'arm',     left: '15%', top: '38%' },
    { id: 'leg',     left: '50%', top: '70%' },
    { id: 'foot',    left: '50%', top: '88%' },
  ];

  let placedCount = 0;
  let phase = 1;

  function setup() {
    placedCount = 0;
    phase = 1;
    target.innerHTML = '';
    partsContainer.innerHTML = '';
    restartBtn.style.display = 'none';
    descEl.textContent = 'Drag body parts onto the silhouette to build the character!';
    document.getElementById('build-body-feedback').textContent = '';

    // Create silhouette outline
    const silhouette = document.createElement('div');
    silhouette.style.cssText = 'position:absolute;inset:20px;border:2px dashed #ccc;border-radius:50% 50% 10% 10%;opacity:0.3;';
    target.appendChild(silhouette);

    // Create drop zones
    buildParts.forEach(part => {
      const zone = document.createElement('div');
      zone.className = 'build-drop-zone';
      zone.dataset.part = part.id;
      zone.style.left = part.x + 'px';
      zone.style.top = part.y + 'px';
      zone.style.width = part.w + 'px';
      zone.style.height = part.h + 'px';
      zone.textContent = part.label;

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
        const droppedId = e.dataTransfer.getData('text/plain');
        handleBuildDrop(zone, droppedId);
      });

      target.appendChild(zone);
    });

    // Create draggable pieces
    const shuffled = shuffle(buildParts);
    shuffled.forEach(part => {
      const piece = document.createElement('div');
      piece.className = 'build-piece';
      piece.draggable = true;
      piece.dataset.part = part.id;

      // Draw a simple colored rectangle to represent the part
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('viewBox', '0 0 80 80');
      svgEl.setAttribute('width', '80');
      svgEl.setAttribute('height', '80');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '5');
      rect.setAttribute('y', '5');
      rect.setAttribute('width', '70');
      rect.setAttribute('height', '70');
      rect.setAttribute('rx', part.id === 'head' ? '35' : '10');
      rect.setAttribute('fill', part.color);
      rect.setAttribute('stroke', '#333');
      rect.setAttribute('stroke-width', '2');
      svgEl.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '40');
      text.setAttribute('y', '45');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#333');
      text.textContent = part.label;
      svgEl.appendChild(text);

      piece.appendChild(svgEl);

      const span = document.createElement('span');
      span.textContent = part.label;
      piece.appendChild(span);

      piece.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', part.id);
        piece.classList.add('dragging');
      });

      piece.addEventListener('dragend', () => {
        piece.classList.remove('dragging');
      });

      // Touch support
      setupBuildTouchDrag(piece, target);

      partsContainer.appendChild(piece);
    });
  }

  function handleBuildDrop(zone, partId) {
    if (zone.classList.contains('filled')) return;

    if (zone.dataset.part === partId) {
      const part = buildParts.find(p => p.id === partId);
      zone.classList.add('filled');
      zone.textContent = part.label;
      zone.style.background = part.color;
      zone.style.opacity = '0.8';
      zone.style.borderStyle = 'solid';
      zone.style.color = '#333';
      zone.style.fontWeight = '700';
      showFeedback('build-body-feedback', true);

      const piece = partsContainer.querySelector(`.build-piece[data-part="${partId}"]`);
      if (piece) piece.classList.add('placed');

      placedCount++;
      if (placedCount >= buildParts.length) {
        if (phase === 1) {
          setTimeout(startPhase2, 1000);
        } else {
          setTimeout(() => {
            showFeedback('build-body-feedback', true, '🎉 Fantastic! Body complete!');
            restartBtn.style.display = 'inline-block';
          }, 500);
        }
      }
    } else {
      showFeedback('build-body-feedback', false);
    }
  }

  function startPhase2() {
    phase = 2;
    placedCount = 0;
    descEl.textContent = 'Now label the body parts! Drag the words to the correct spots.';
    showFeedback('build-body-feedback', true, '✅ Body assembled! Now label it!');

    // Remove old drop zones, keep filled background
    target.querySelectorAll('.build-drop-zone').forEach(z => {
      z.style.borderStyle = 'solid';
      z.style.borderColor = '#aaa';
      z.style.color = 'transparent';
    });

    // Add label drop zones
    labelConfig.forEach(cfg => {
      const zone = document.createElement('div');
      zone.className = 'build-label-zone';
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
        const droppedId = e.dataTransfer.getData('text/plain');
        handleLabelDrop(zone, droppedId);
      });

      target.appendChild(zone);
    });

    // Create label word cards
    partsContainer.innerHTML = '';
    const shuffled = shuffle(buildParts);
    shuffled.forEach(part => {
      const card = document.createElement('div');
      card.className = 'drag-card';
      card.textContent = part.label;
      card.draggable = true;
      card.dataset.part = part.id;

      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', part.id);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // Touch support
      setupLabelTouchDrag(card, target);

      partsContainer.appendChild(card);
    });
  }

  function handleLabelDrop(zone, partId) {
    if (zone.classList.contains('filled')) return;

    if (zone.dataset.part === partId) {
      const part = buildParts.find(p => p.id === partId);
      zone.textContent = part.label;
      zone.classList.add('filled');
      showFeedback('build-body-feedback', true);

      const card = partsContainer.querySelector(`.drag-card[data-part="${partId}"]`);
      if (card) card.classList.add('placed');

      placedCount++;
      if (placedCount >= buildParts.length) {
        setTimeout(() => {
          showFeedback('build-body-feedback', true, '🎉 Fantastic! Body complete and labeled!');
          restartBtn.style.display = 'inline-block';
        }, 500);
      }
    } else {
      showFeedback('build-body-feedback', false);
    }
  }

  // Touch drag for build pieces
  function setupBuildTouchDrag(piece, dropParent) {
    let clone = null;

    piece.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      clone = piece.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.8';
      clone.style.width = piece.offsetWidth + 'px';
      clone.style.left = (touch.clientX - piece.offsetWidth / 2) + 'px';
      clone.style.top = (touch.clientY - piece.offsetHeight / 2) + 'px';
      document.body.appendChild(clone);
      piece.classList.add('dragging');
    }, { passive: true });

    piece.addEventListener('touchmove', e => {
      e.preventDefault();
      if (!clone) return;
      const touch = e.touches[0];
      clone.style.left = (touch.clientX - piece.offsetWidth / 2) + 'px';
      clone.style.top = (touch.clientY - piece.offsetHeight / 2) + 'px';

      dropParent.querySelectorAll('.build-drop-zone').forEach(z => z.classList.remove('drag-over'));
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('build-drop-zone')) {
        el.classList.add('drag-over');
      }
    }, { passive: false });

    piece.addEventListener('touchend', e => {
      piece.classList.remove('dragging');
      if (!clone) return;
      const touch = e.changedTouches[0];
      clone.remove();
      clone = null;

      dropParent.querySelectorAll('.build-drop-zone').forEach(z => z.classList.remove('drag-over'));
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('build-drop-zone')) {
        handleBuildDrop(el, piece.dataset.part);
      }
    });
  }

  // Touch drag for label cards
  function setupLabelTouchDrag(card, dropParent) {
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

      dropParent.querySelectorAll('.build-label-zone').forEach(z => z.classList.remove('drag-over'));
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('build-label-zone')) {
        el.classList.add('drag-over');
      }
    }, { passive: false });

    card.addEventListener('touchend', e => {
      card.classList.remove('dragging');
      if (!clone) return;
      const touch = e.changedTouches[0];
      clone.remove();
      clone = null;

      dropParent.querySelectorAll('.build-label-zone').forEach(z => z.classList.remove('drag-over'));
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.classList.contains('build-label-zone')) {
        handleLabelDrop(el, card.dataset.part);
      }
    });
  }

  restartBtn.addEventListener('click', setup);
  setup();
}
