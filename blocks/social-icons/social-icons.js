/**
 * Social Icons Block – Bangkok Bank style
 * Mobile: opens right, close first
 * Desktop: opens left, close last
 */

export default function decorate(block) {
  // Validate that all required content is present
  const isValid = [...block.children].every((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return false;

    const platform = cells[0].textContent.trim();
    const icon = cells[1].querySelector('picture, img');
    const link = cells[2].querySelector('a');

    return platform && icon && link && link.href;
  });

  // Return early if any tag is empty
  if (!isValid || block.children.length === 0) {
    return;
  }

  const closeIcon = document.createElement('a');
  closeIcon.className = 'icon-close';
  closeIcon.href = '#';
  closeIcon.setAttribute('aria-label', 'Close');

  const iconsContainer = document.createElement('div');
  iconsContainer.className = 'icons-container';

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const platform = cells[0].textContent.trim().toLowerCase();
    const icon = cells[1].querySelector('picture, img');
    const link = cells[2].querySelector('a');

    if (!icon || !link) return;

    const li = document.createElement('li');
    const a = document.createElement('a');

    a.href = link.href;
    a.className = `icon-${platform}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', `Share on ${platform}`);

    a.appendChild(icon.cloneNode(true));
    li.appendChild(a);
    ul.appendChild(li);
  });

  iconsContainer.appendChild(ul);

  const shareBtn = document.createElement('div');
  shareBtn.className = 'btn-share';
  shareBtn.setAttribute('role', 'button');
  shareBtn.setAttribute('tabindex', '0');
  shareBtn.setAttribute('aria-label', 'Share');

  block.innerHTML = '';
  block.append(closeIcon, iconsContainer, shareBtn);

  /* -----------------------------
     Viewport direction handling
  ------------------------------ */
  function setViewportMode() {
    if (window.matchMedia('(min-width: 900px)').matches) {
      block.classList.add('desktop');
      block.classList.remove('mobile');
    } else {
      block.classList.add('mobile');
      block.classList.remove('desktop');
    }
  }

  setViewportMode();
  window.addEventListener('resize', setViewportMode);

  /* -----------------------------
     Toggle logic
  ------------------------------ */
  block.addEventListener('click', (e) => {
    const active = block.classList.contains('active');
    const clickedShareLink = e.target.closest('.icons-container a');
    const clickedClose = e.target.classList.contains('icon-close');

    if (!active) {
      block.classList.add('active');
    } else if (clickedClose || !clickedShareLink) {
      block.classList.remove('active');
    }
  });

  /* -----------------------------
     Share popups
  ------------------------------ */
  ul.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      window.open(a.href, 'share', 'width=600,height=400');
    });
  });

  /* -----------------------------
     ESC closes
  ------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      block.classList.remove('active');
    }
  });
}
