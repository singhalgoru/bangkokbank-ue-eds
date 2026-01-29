/**
 * Social Share Block – Bangkok Bank style
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
  
  const socialShare = document.createElement('div');
  socialShare.className = 'social-share';

  const closeIcon = document.createElement('a');
  closeIcon.className = 'icon-close';
  closeIcon.href = '#';
  closeIcon.setAttribute('aria-label', 'Close');

  const shareIcons = document.createElement('div');
  shareIcons.className = 'share-icons';

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

  shareIcons.appendChild(ul);

  const shareIcon = document.createElement('div');
  shareIcon.className = 'icon-share';
  shareIcon.setAttribute('role', 'button');
  shareIcon.setAttribute('tabindex', '0');
  shareIcon.setAttribute('aria-label', 'Share');

  socialShare.append(closeIcon, shareIcons, shareIcon);
  block.innerHTML = '';
  block.appendChild(socialShare);

  /* -----------------------------
     Viewport direction handling
  ------------------------------ */
  function setViewportMode() {
    if (window.matchMedia('(min-width: 900px)').matches) {
      socialShare.classList.add('desktop');
      socialShare.classList.remove('mobile');
    } else {
      socialShare.classList.add('mobile');
      socialShare.classList.remove('desktop');
    }
  }

  setViewportMode();
  window.addEventListener('resize', setViewportMode);

  /* -----------------------------
     Toggle logic
  ------------------------------ */
  socialShare.addEventListener('click', (e) => {
    const active = socialShare.classList.contains('active');
    const clickedShareLink = e.target.closest('.share-icons a');
    const clickedClose = e.target.classList.contains('icon-close');

    if (!active) {
      socialShare.classList.add('active');
    } else if (clickedClose || !clickedShareLink) {
      socialShare.classList.remove('active');
    }
  });

  /* -----------------------------
     Share popups
  ------------------------------ */
  ul.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const platform = a.className.replace('icon-', '');
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);

      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'x':
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'line':
          shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
          break;
        default:
          shareUrl = a.href;
      }

      window.open(shareUrl, 'share', 'width=600,height=400');
    });
  });

  /* -----------------------------
     ESC closes
  ------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      socialShare.classList.remove('active');
    }
  });
}
