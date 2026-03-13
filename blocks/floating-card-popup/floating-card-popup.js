function readConfigFromBlock(block) {
  const cfg = {
    popupImage: block.dataset.popupImage || '',
    popupImageAlt: block.dataset.popupImageAlt || '',
    title: block.dataset.title || '',
    description: block.dataset.description || '',
    link: block.dataset.link || '',
    linkText: block.dataset.linkText || '',
    linkTitle: block.dataset.linkTitle || '',
    linkType: block.dataset.linkType || 'primary',
    delaySeconds: block.dataset.delaySeconds || 0,
    reopenOnRevisit: block.dataset.reopenOnRevisit === 'true',
    targetSettings: {
      targetLink: block.dataset.targetLink === 'true',
    },
  };

  return cfg;
}

function buildPopupElementFromBlock(block, config) {
  const { targetSettings = {} } = config;
  const wrapper = document.createElement('div');
  wrapper.className = 'floating-popup';

  const inner = document.createElement('div');
  inner.className = 'floating-popup-inner';

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'floating-popup-close';
  closeBtn.setAttribute('aria-label', 'Close popup');
  closeBtn.textContent = '×';

  inner.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'floating-popup-content';

  while (block.firstChild) {
    content.appendChild(block.firstChild);
  }

  inner.appendChild(content);
  wrapper.appendChild(inner);

  if (targetSettings.targetLink) {
    const linkEl = content.querySelector('a');
    if (linkEl) {
      linkEl.setAttribute('target', '_blank');
      linkEl.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return wrapper;
}

export default function decorate(block) {
  const config = readConfigFromBlock(block);
  if (!config.title && !block.textContent.trim()) {
    return;
  }

  const delay = Math.min(
    Math.max(Number(config.delaySeconds) || 0, 0),
    30,
  );

  const reopenOnRevisit = config.reopenOnRevisit !== false;
  const storageKey = `floatingCardPopupDismissed:${window.location.pathname}`;

  const shouldShowPopup = () => {
    if (reopenOnRevisit) return true;
    try {
      const dismissed = localStorage.getItem(storageKey);
      return dismissed !== 'true';
    } catch (e) {
      return true;
    }
  };

  const markDismissed = () => {
    if (reopenOnRevisit) return;
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {
      // ignore
    }
  };

  const showPopup = () => {
    if (!shouldShowPopup()) return;

    const popupEl = buildPopupElementFromBlock(block, config);
    document.body.appendChild(popupEl);

    requestAnimationFrame(() => {
      popupEl.classList.add('floating-popup-visible');
    });

    // Close button
    const closeBtn = popupEl.querySelector('.floating-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popupEl.classList.remove('floating-popup-visible');
        markDismissed();
        setTimeout(() => popupEl.remove(), 300);
      });
    }

    // CTA tracking – use first anchor from authored markup
    const cta = popupEl.querySelector('a');
    if (cta) {
      cta.addEventListener('click', () => {
        // analytics hook if needed
      });
    }
  };

  const scheduleShow = () => {
    if (delay > 0) {
      setTimeout(showPopup, delay * 1000);
    } else {
      showPopup();
    }
  };

  scheduleShow();
  block.classList.add('floating-popup-config-hidden');
}
