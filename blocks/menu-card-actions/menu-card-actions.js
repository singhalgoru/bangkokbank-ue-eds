import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function createElement(tag, ...classNames) {
  const el = document.createElement(tag);
  if (classNames.length) el.classList.add(...classNames);
  return el;
}

function buildDropdownCta(ctaCell, dropLinksCell) {
  const links = [...(dropLinksCell?.querySelectorAll('a') || [])];
  const primaryLink = ctaCell?.querySelector('a');
  if (primaryLink) links.unshift(primaryLink);
  if (!links.length) return null;

  const wrapper = createElement('div', 'menu-card-actions-cta', 'menu-card-actions-cta--dropdown');

  const selectBtn = createElement('button', 'menu-card-actions-select');
  selectBtn.setAttribute('aria-expanded', 'false');
  selectBtn.setAttribute('aria-haspopup', 'listbox');
  selectBtn.innerHTML = `<span class="menu-card-actions-select-label">${links[0].textContent.trim()}</span>
                         <span class="menu-card-actions-select-icon" aria-hidden="true"></span>`;

  const dropdown = createElement('ul', 'menu-card-actions-dropdown');
  dropdown.setAttribute('role', 'listbox');

  links.forEach((link) => {
    const li = createElement('li');
    li.setAttribute('role', 'option');
    li.innerHTML = `<a href="${link.href}">${link.textContent.trim()}</a>`;
    dropdown.append(li);
  });

  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = selectBtn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.menu-card-actions-select[aria-expanded="true"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      btn.nextElementSibling?.classList.remove('is-open');
    });
    if (!isOpen) {
      selectBtn.setAttribute('aria-expanded', 'true');
      dropdown.classList.add('is-open');
    }
  });

  document.addEventListener('click', () => {
    selectBtn.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('is-open');
  });

  wrapper.append(selectBtn, dropdown);
  return wrapper;
}

function buildButtonCta(ctaCell, isDownload) {
  const link = ctaCell?.querySelector('a');
  if (!link) return null;

  const wrapper = createElement('div', 'menu-card-actions-cta', 'menu-card-actions-cta--button');
  const btn = createElement('a', 'menu-card-actions-btn');
  btn.href = link.href;
  btn.textContent = link.textContent.trim();
  if (link.title) btn.title = link.title;
  if (isDownload) {
    btn.setAttribute('download', '');
    btn.classList.add('menu-card-actions-btn--download');
  }

  wrapper.append(btn);
  return wrapper;
}

function createCard(row, variant) {
  const [
    imageCell,
    titleCell,
    titleTypeCell,
    descCell,
    ctaCell,
    enableDropdownCell,
    dropLinksCell,
    mobileCell,
  ] = row.children;
  const mobileExperience = mobileCell?.textContent.trim() || 'stacked';
  const enableDropdown = enableDropdownCell?.textContent.trim().toLowerCase() === 'true';
  const titleType = titleTypeCell?.textContent.trim() || 'h3';
  const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(titleType) ? titleType : 'h3';

  const card = createElement('div', 'menu-card-actions-item');
  card.dataset.mobile = mobileExperience;

  // Image
  const rawImg = imageCell?.querySelector('img');
  if (rawImg) {
    const pic = createOptimizedPicture(rawImg.src, rawImg.alt || '', false);
    moveInstrumentation(rawImg, pic.querySelector('img'));
    const figure = createElement('figure', 'menu-card-actions-image');
    figure.append(pic);
    card.append(figure);
  }

  // Title
  if (titleCell?.textContent.trim()) {
    const heading = createElement(tag, 'menu-card-actions-title');
    heading.textContent = titleCell.textContent.trim();
    card.append(heading);
  }

  if (descCell?.innerHTML.trim()) {
    const desc = createElement('div', 'menu-card-actions-description');
    desc.innerHTML = descCell.innerHTML;
    card.append(desc);
  }

  card.append(createElement('hr', 'menu-card-actions-divider'));

  const useDropdown = enableDropdown || variant === 'menu-card-cta-dropdown';
  const cta = useDropdown
    ? buildDropdownCta(ctaCell, dropLinksCell)
    : buildButtonCta(ctaCell, variant === 'menu-card-text-download');

  if (cta) card.append(cta);

  return card;
}

export default function decorate(block) {
  const variant = block.children[0]?.textContent.trim() || 'default';

  const itemRows = [...block.children].slice(1);
  const mobileExp = itemRows[0]?.children[8]?.textContent.trim() || 'stacked';

  if (variant !== 'default') block.classList.add(`menu-card-actions--${variant}`);
  block.classList.add(`menu-card-actions--mobile-${mobileExp}`);

  const list = createElement('div', 'menu-card-actions-list');

  itemRows.forEach((row) => {
    const card = createCard(row, variant);
    moveInstrumentation(row, card);
    list.append(card);
  });

  block.replaceChildren(list);
}
