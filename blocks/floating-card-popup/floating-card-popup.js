import { createElementFromHTML } from '../../scripts/scripts.js';

const STORAGE_KEY_PREFIX = 'floatingCardPopupDismissed:';

function buildPopupElement(config, doc) {
  const wrapper = createElementFromHTML('<div class="floating-popup"></div>', doc);
  const inner = createElementFromHTML('<div class="floating-popup-inner"></div>', doc);

  inner.appendChild(
    createElementFromHTML(
      '<button class="floating-popup-close" aria-label="Close popup"></button>',
      doc,
    ),
  );

  const cardBody = createElementFromHTML(
    '<div class="floating-popup-body"></div>',
    doc,
  );

  if (config.image) {
    cardBody.appendChild(config.image.cloneNode(true));
  }

  const content = createElementFromHTML(
    '<div class="floating-popup-content"></div>',
    doc,
  );

  if (config.title) {
    content.appendChild(
      createElementFromHTML(
        `<h2 class="floating-popup-title">${config.title}</h2>`,
        doc,
      ),
    );
  }

  if (config.description) {
    content.appendChild(
      createElementFromHTML(
        `<div class="floating-popup-description">${config.description}</div>`,
        doc,
      ),
    );
  }

  cardBody.appendChild(content);
  inner.appendChild(cardBody);

  if (config.link) {
    const anchor = config.link.cloneNode(true);
    anchor.classList.add('button-m');
    inner.appendChild(anchor);
  }

  wrapper.appendChild(inner);
  return wrapper;
}

function shouldShowPopup(storageKey, reopenOnRevisit) {
  const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  if (isReload || reopenOnRevisit) return true;
  try {
    return localStorage.getItem(storageKey) !== 'true';
  } catch {
    return true;
  }
}

function markDismissed(storageKey, reopenOnRevisit) {
  if (reopenOnRevisit) return;
  try {
    localStorage.setItem(storageKey, 'true');
  } catch { /* ignore */ }
}

export default function decorate(block) {
  const doc = block.ownerDocument;

  const [
    imageDiv,
    titleDiv,
    descriptionDiv,
    linkDiv,
    targetSettingsDiv,
    delaySecondsDiv,
    reopenOnRevisitDiv,
  ] = [...block.children];

  const link = linkDiv?.querySelector('a');

  const config = {
    image: imageDiv?.querySelector('img') || null,
    imageAlt: imageDiv?.querySelector('img')?.getAttribute('alt') || '',
    title: titleDiv?.querySelector('div')?.textContent?.trim() || '',
    description: descriptionDiv?.querySelector('div')?.innerHTML || '',
    link: link || null,
    linkText: link?.textContent?.trim() || '',
    linkTitle: link?.getAttribute('title') || '',
    targetLink: targetSettingsDiv?.querySelector('div')?.textContent?.trim() === 'true',
    delaySeconds: Number(delaySecondsDiv?.querySelector('div')?.textContent?.trim()) || 0,
    reopenOnRevisit: reopenOnRevisitDiv?.querySelector('div')?.textContent?.trim() === 'true',
  };

  block.textContent = '';
  block.classList.add('floating-popup-config-hidden');

  if (!config.title && !config.link) return;

  const delay = Number(config.delaySeconds) || 0;
  const storageKey = `${STORAGE_KEY_PREFIX}${window.location.pathname}`;
  const popupEl = buildPopupElement(config, doc);

  const show = () => {
    if (!shouldShowPopup(storageKey, config.reopenOnRevisit)) return;

    document.body.appendChild(popupEl);
    requestAnimationFrame(() => popupEl.classList.add('floating-popup-visible'));

    const closePopup = () => {
      popupEl.classList.remove('floating-popup-visible');
      markDismissed(storageKey, config.reopenOnRevisit);
      setTimeout(() => popupEl.remove(), 300);
    };

    popupEl.querySelector('.floating-popup-close')?.addEventListener('click', closePopup);

    popupEl.addEventListener('click', (e) => {
      if (!e.target.closest('.floating-popup-inner')) {
        closePopup();
      }
    });
  };

  if (delay > 0) {
    setTimeout(show, delay * 1000);
  } else {
    show();
  }
}
