function openModal(modelSrc) {
  const modal = document.getElementById('fullscreenModal');
  const viewer = document.getElementById('fullscreenViewer');
  viewer.setAttribute('src', modelSrc);
  viewer.removeAttribute('auto-rotate'); // Disable rotation in fullscreen
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('fullscreenModal');
  const viewer = document.getElementById('fullscreenViewer');
  modal.style.display = 'none';
  viewer.removeAttribute('src'); // Cleanup
  viewer.setAttribute('auto-rotate', ''); // Re-enable rotation after close
}
