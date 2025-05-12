const modelGrid = document.getElementById('modelGrid');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenViewer = document.getElementById('fullscreenViewer');

fetch('models.json')
  .then(response => response.json())
  .then(models => {
    models.forEach(model => {
      const column = document.createElement('div');
      column.className = 'column';

      column.innerHTML = `
        <div class="model-card">
          <button onclick="openModal('models/${model.file}')" class="fullscreen-btn">⛶</button>
          <model-viewer 
            src="models/${model.file}" 
            auto-rotate 
            camera-controls 
            shadow-intensity="1" 
            exposure="0.35">
          </model-viewer>
          <h3>${model.title}</h3>
          <p>${model.description}</p>
        </div>
      `;

      modelGrid.appendChild(column);
    });
  });

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
