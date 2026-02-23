// Reusable modal component

let overlay = null;
let titleEl = null;
let bodyEl = null;
let closeBtn = null;
let initialized = false;

function init() {
  if (initialized) return;
  overlay = document.getElementById('modal-overlay');
  titleEl = document.getElementById('modal-title');
  bodyEl = document.getElementById('modal-body');
  closeBtn = document.getElementById('modal-close');

  if (!overlay) return;

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  initialized = true;
}

export function openModal(title, contentHtml) {
  init();
  if (!overlay) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;
  overlay.classList.add('sg-modal-overlay--visible');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('sg-modal-overlay--visible');
  document.body.style.overflow = '';
}
