// Toast notification component

let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
  }
  return container;
}

export function showToast(message, type = 'success') {
  const c = getContainer();
  if (!c) return;

  const toast = document.createElement('div');
  toast.className = `sg-toast sg-toast--${type}`;

  const icon = type === 'success'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  toast.innerHTML = `${icon}<span>${message}</span>`;
  c.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('sg-toast--hiding');
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}
