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
    const imageWrap = createElementFromHTML(
      '<div class="floating-popup-image-wrap"></div>',
      doc,
    );
    imageWrap.appendChild(config.image);
    cardBody.appendChild(imageWrap);
  }

  const content = createElementFromHTML(
    '<div class="floating-popup-content"></div>',
    doc,
  );

  if (config.titleElement) {
    config.titleElement.classList.add('floating-popup-title');
    content.appendChild(config.titleElement);
  }

  if (config.descriptionElement) {
    config.descriptionElement.classList.add('floating-popup-description');
    content.appendChild(config.descriptionElement);
  }

  cardBody.appendChild(content);
  inner.appendChild(cardBody);

  if (config.linkElement) {
    config.linkElement.classList.add('button-m');
    inner.appendChild(config.linkElement);
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
    imageAltDiv,
    titleDiv,
    descriptionDiv,
    linkDiv,
    linkTextDiv,
    linkTitleDiv,
    linkTypeDiv,
    targetSettingsDiv,
    delaySecondsDiv,
    reopenOnRevisitDiv,
  ] = [...block.children];

  const link = linkDiv?.querySelector('a');
  const image = imageDiv?.querySelector('picture, img');
  const titleElement = titleDiv?.firstElementChild;
  const descriptionElement = descriptionDiv?.firstElementChild;
  const imageAlt = imageAltDiv?.textContent?.trim() || '';

  const config = {
    image,
    imageAlt,
    titleElement,
    descriptionElement,
    linkElement: link || null,
    title: titleElement?.textContent?.trim() || '',
    targetLink: targetSettingsDiv?.querySelector('div')?.textContent?.trim() === 'true',
    delaySeconds: Number(delaySecondsDiv?.querySelector('div')?.textContent?.trim()) || 0,
    reopenOnRevisit: reopenOnRevisitDiv?.querySelector('div')?.textContent?.trim() === 'true',
  };

  if (config.imageAlt && config.image?.tagName === 'IMG') {
    config.image.setAttribute('alt', config.imageAlt);
  }

  if (config.linkElement && linkTextDiv?.textContent?.trim()) {
    config.linkElement.textContent = linkTextDiv.textContent.trim();
  }

  if (config.linkElement && linkTitleDiv?.textContent?.trim()) {
    config.linkElement.setAttribute('title', linkTitleDiv.textContent.trim());
  }

  if (config.linkElement && linkTypeDiv?.textContent?.trim()) {
    config.linkElement.classList.add(linkTypeDiv.textContent.trim().toLowerCase());
  }

  if (!config.title && !config.linkElement) return;

  const delay = Number(config.delaySeconds) || 0;
  const storageKey = `${STORAGE_KEY_PREFIX}${window.location.pathname}`;
  const popupEl = buildPopupElement(config, doc);
  block.replaceChildren(popupEl);

  const show = () => {
    if (!shouldShowPopup(storageKey, config.reopenOnRevisit)) return;

    requestAnimationFrame(() => popupEl.classList.add('floating-popup-visible'));

    const closePopup = () => {
      popupEl.classList.remove('floating-popup-visible');
      markDismissed(storageKey, config.reopenOnRevisit);
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
