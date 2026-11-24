// Gentle falling snow in the background (pure CSS animation per flake).

export function startSnow(container, count = window.innerWidth < 600 ? 28 : 55) {
  if (!container || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const flake = document.createElement('span');
    flake.className = 'flake';
    const size = 2 + Math.random() * 4;
    flake.style.width = flake.style.height = `${size}px`;
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.opacity = (0.25 + Math.random() * 0.55).toFixed(2);
    flake.style.animationDuration = `${9 + Math.random() * 12}s`;
    flake.style.animationDelay = `${-Math.random() * 20}s`;
    flake.style.setProperty('--drift', `${-30 + Math.random() * 60}px`);
    if (size > 4.5) flake.style.filter = 'blur(1px)';
    frag.append(flake);
  }
  container.append(frag);
}
