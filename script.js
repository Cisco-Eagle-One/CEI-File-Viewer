const container = document.getElementById('modelSections');
const loadingMessage = document.getElementById('loadingMessage');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenViewer = document.getElementById('fullscreenViewer');
let currentPath = '';
let currentOrientation = '';
let currentViews = [];

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

          const orientationAttr = meta.orientation ? `orientation="${meta.orientation}"` : '';
          currentOrientation = meta.orientation || '';

          // Check which views exist
          const views = ['top', 'front', 'side'];
          const availableViews = [];

          for (const view of views) {
            const imagePath = `content/${path}/${view}.png`;
            const exists = await fetch(imagePath, { method: 'HEAD' }).then(res => res.ok).catch(() => false);
            if (exists) availableViews.push(view);
          }

          const buttonHTML = [];

          if (availableViews.length > 0) {
            buttonHTML.push(`<button onclick="swapView(this, '${path}', '3d', '${currentOrientation}')" class="active">3D</button>`);
            availableViews.forEach(view => {
              buttonHTML.push(`<button onclick="swapView(this, '${path}', '${view}', '${currentOrientation}')">${view.charAt(0).toUpperCase() + view.slice(1)}</button>`);
            });
          }

          card.innerHTML = `
            ${availableViews.length > 0 ? `<button onclick="openModal('${path}', '3d', '${currentOrientation}', '${availableViews.join(',')}')" class="fullscreen-btn">⛶</button>` : ''}
            <model-viewer 
              src="content/${path}/model.glb" 
              poster="content/${path}/${meta.poster || 'thumb.jpg'}"
              auto-rotate 
              camera-controls 
              shadow-intensity="1" 
              exposure="0.35"
              ${orientationAttr}>
            </model-viewer>
            <h3>${meta.title}</h3>
            <p>${meta.description}</p>
            <div class="view-buttons">${buttonHTML.join('')}</div>
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

  card.querySelectorAll('.view-buttons button').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');

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
    img.style.aspectRatio = '1 / 1';
    card.insertBefore(img, card.querySelector('h3'));
  }
}

function openModal(path, view, orientation = '', views = '') {
  currentPath = path;
  currentOrientation = orientation;
  currentViews = views.split(',');

  updateFullscreenView(view);

  const viewButtons = currentViews.map(view =>
    `<button onclick="updateFullscreenView('${view}')">${view.charAt(0).toUpperCase() + view.slice(1)}</button>`
  );

  viewButtons.unshift(`<button onclick="updateFullscreenView('3d')" class="active">3D</button>`);

  document.getElementById('fullscreenControls').innerHTML = viewButtons.join('');
  fullscreenModal.style.display = 'flex';
}

function updateFullscreenView(view) {
  const container = fullscreenModal.querySelector('#fullscreenViewer');
  const existing = container.querySelector('model-viewer, img');
  if (existing) existing.remove();

  fullscreenModal.querySelectorAll('#fullscreenControls button').forEach(btn =>
    btn.classList.remove('active')
  );

  const activeBtn = Array.from(fullscreenModal.querySelectorAll('#fullscreenControls button')).find(
    btn => btn.textContent.toLowerCase() === view
  );
  if (activeBtn) activeBtn.classList.add('active');

  if (view === '3d') {
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', `content/${currentPath}/model.glb`);
    viewer.setAttribute('poster', `content/${currentPath}/thumb.jpg`);
    if (currentOrientation) viewer.setAttribute('orientation', currentOrientation);
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('exposure', '0.35');
    container.appendChild(viewer);
  } else {
    const img = document.createElement('img');
    const src = `content/${currentPath}/${view}.png`;
    img.src = src;
    img.alt = `${view} view`;
    img.onerror = () => updateFullscreenView('3d');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    container.appendChild(img);
  }
}

function closeModal() {
  fullscreenModal.style.display = 'none';
  fullscreenViewer.innerHTML = '';
}
