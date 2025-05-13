const container = document.getElementById('modelSections');
const loadingMessage = document.getElementById('loadingMessage');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenViewer = document.getElementById('fullscreenViewer');
let currentPath = '';
let currentOrientation = '';
let currentViews = [];
let activeCard = null;
let activeView = '3d';

fetch('models.json')
  .then(res => res.json())
  .then(async sections => {
    if (loadingMessage) loadingMessage.remove();

    for (const section of sections) {
      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = section.section;
      container.appendChild(sectionTitle);

      const row = document.createElement('div');
      row.className = 'row';

      const results = await Promise.all(
        section.paths.map(async path => {
          try {
            const meta = await fetch(`content/${path}/meta.json`).then(res => res.json());
            return { path, meta };
          } catch (err) {
            console.error(`Failed to load meta.json for ${path}`, err);
            return null;
          }
        })
      );

      for (const result of results) {
        if (!result) continue;
        const { path, meta } = result;

        const column = document.createElement('div');
        column.className = 'column';

        const card = document.createElement('div');
        card.className = 'model-card';

        const orientationAttr = meta.orientation ? `orientation="${meta.orientation}"` : '';
        const availableViews = [];
        const viewChecks = ['top', 'front', 'side'];

        for (const view of viewChecks) {
          const imagePath = `content/${path}/${view}.png`;
          const exists = await fetch(imagePath, { method: 'HEAD' }).then(res => res.ok).catch(() => false);
          if (exists) availableViews.push(view);
        }

        const buttonHTML = [];

        if (availableViews.length > 0) {
          buttonHTML.push(`<button onclick="swapView(this, '${path}', '3d', '${meta.orientation || ''}')" class="active">3D</button>`);
          availableViews.forEach(view => {
            buttonHTML.push(`<button onclick="swapView(this, '${path}', '${view}', '${meta.orientation || ''}')">${view.charAt(0).toUpperCase() + view.slice(1)}</button>`);
          });
        }

        card.innerHTML = `
          ${availableViews.length > 0 ? `<button class="fullscreen-btn">⛶</button>` : ''}
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

        // Attach fullscreen behavior
        const fsBtn = card.querySelector('.fullscreen-btn');
        if (fsBtn) {
          fsBtn.addEventListener('click', () => {
            const viewer = card.querySelector('model-viewer');
            const img = card.querySelector('img');
            let current = '3d';
            if (img) {
              const match = img.src.match(/\/(top|front|side)\.png/i);
              if (match) current = match[1];
            }
            openModal(path, current, meta.orientation || '', availableViews.join(','));
          });
        }

        column.appendChild(card);
        row.appendChild(column);
      }

      container.appendChild(row);
    }
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
  activeView = view;

  updateFullscreenView(view);

  const viewButtons = [];
  if (currentViews.length > 0) {
    viewButtons.push(`<button onclick="updateFullscreenView('3d')">3D</button>`);
    currentViews.forEach(view =>
      viewButtons.push(`<button onclick="updateFullscreenView('${view}')">${view.charAt(0).toUpperCase() + view.slice(1)}</button>`)
    );
  }

  document.getElementById('fullscreenControls').innerHTML = viewButtons.join('');
  document.querySelectorAll('#fullscreenControls button').forEach(btn => {
    if (btn.textContent.toLowerCase() === view) btn.classList.add('active');
  });

  fullscreenModal.style.display = 'flex';

  activeCard = [...document.querySelectorAll('.model-card')].find(card =>
    card.querySelector(`.fullscreen-btn`)
      ?.getAttribute('onclick')?.includes(path)
  );
}

function updateFullscreenView(view) {
  activeView = view;
  const container = fullscreenModal.querySelector('#fullscreenViewer');
  const existing = container.querySelector('model-viewer, img');
  if (existing) existing.remove();

  document.querySelectorAll('#fullscreenControls button').forEach(btn =>
    btn.classList.remove('active')
  );
  const activeBtn = [...document.querySelectorAll('#fullscreenControls button')]
    .find(btn => btn.textContent.toLowerCase() === view);
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

  if (activeCard) {
    const viewButtons = activeCard.querySelectorAll('.view-buttons button');
    const btnToTrigger = [...viewButtons].find(btn => btn.textContent.toLowerCase() === activeView);
    if (btnToTrigger) btnToTrigger.click();
  }

  activeCard = null;
}
