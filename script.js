const container = document.getElementById('modelSections');
const loadingMessage = document.getElementById('loadingMessage');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenViewer = document.getElementById('fullscreenViewer');

fetch('models.json')
  .then(res => res.json())
  .then(sections => {
    if (loadingMessage) loadingMessage.remove();

    sections.forEach(section => {
      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = section.section;
      container.appendChild(sectionTitle);

      const row = document.createElement('div');
      row.className = 'row';

      section.paths.forEach(async path => {
        try {
          const meta = await fetch(`content/${path}/meta.json`).then(res => res.json());

          const column = document.createElement('div');
          column.className = 'column';

          const card = document.createElement('div');
          card.className = 'model-card';

          const orientationAttr = meta.orientation ? `orientation=\"${meta.orientation}\"` : '';

          // Check which views exist
          const views = ['top', 'front', 'side'];
          const buttonHTML = [];

          for (const view of views) {
            const imagePath = `content/${path}/${view}.png`;
            const exists = await fetch(imagePath, { method: 'HEAD' }).then(res => res.ok).catch(() => false);
            if (exists) {
              buttonHTML.push(`<button onclick=\"swapView(this, '${path}', '${view}', '${meta.orientation || ''}')\">${view.charAt(0).toUpperCase() + view.slice(1)}</button>`);
            }
          }

          if (buttonHTML.length > 0) {
            buttonHTML.unshift(`<button onclick=\"swapView(this, '${path}', '3d', '${meta.orientation || ''}')\">3D</button>`);
          }

          card.innerHTML = `
            <button onclick=\"openModal('content/${path}/model.glb')\" class=\"fullscreen-btn\">⛶</button>
            <model-viewer 
              src=\"content/${path}/model.glb\" 
              poster=\"content/${path}/${meta.poster || 'thumb.jpg'}\"
              auto-rotate 
              camera-controls 
              shadow-intensity=\"1\" 
              exposure=\"0.35\"
              ${orientationAttr}>
            </model-viewer>
            <h3>${meta.title}</h3>
            <p>${meta.description}</p>
            ${buttonHTML.length > 0 ? `<div class=\"view-buttons\">${buttonHTML.join('')}</div>` : ''}
          `;

          column.appendChild(card);
          row.appendChild(column);
        } catch (err) {
          console.error(`Failed to load model at ${path}`, err);
        }
      });

      container.appendChild(row);
    });
  })
  .catch(err => {
    if (loadingMessage) loadingMessage.textContent = 'Failed to load model data.';
    console.error('Error loading models.json:', err);
  });

function swapView(button, path, view, orientation = '') {
  const card = button.closest('.model-card');
  const existing = card.querySelector('model-viewer, img');
  if (existing) existing.remove();

  if (view === '3d') {
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', `content/${path}/model.glb`);
    viewer.setAttribute('poster', `content/${path}/thumb.jpg`);
    if (orientation) viewer.setAttribute('orientation', orientation);
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('exposure', '0.35');
    card.insertBefore(viewer, card.querySelector('h3'));
  } else {
    const img = document.createElement('img');
    const src = `content/${path}/${view}.png`;
    img.src = src;
    img.alt = `${view} view`;
    img.onerror = () => swapView(button, path, '3d', orientation);
    img.style.width = '100%';
    card.insertBefore(img, card.querySelector('h3'));
  }
}

function openModal(modelSrc) {
  fullscreenViewer.setAttribute('src', modelSrc);
  fullscreenViewer.removeAttribute('auto-rotate');
  fullscreenModal.style.display = 'flex';
}

function closeModal() {
  fullscreenModal.style.display = 'none';
  fullscreenViewer.removeAttribute('src');
  fullscreenViewer.setAttribute('auto-rotate', '');
}
