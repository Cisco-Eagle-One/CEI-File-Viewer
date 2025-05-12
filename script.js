const container = document.getElementById('modelSections');
const fullscreenModal = document.getElementById('fullscreenModal');
const fullscreenViewer = document.getElementById('fullscreenViewer');

fetch('models.json')
  .then(response => response.json())
  .then(sections => {
    sections.forEach(group => {
      // Add section title
      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = group.section;
      container.appendChild(sectionTitle);

      // Create row
      const row = document.createElement('div');
      row.className = 'row';

      group.models.forEach(model => {
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

        row.appendChild(column);
      });

      container.appendChild(row);
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
