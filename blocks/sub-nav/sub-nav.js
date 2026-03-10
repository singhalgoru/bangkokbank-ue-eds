import { getMetadata } from '../../scripts/aem.js';
import createGlobalDropdown from '../../scripts/utils/dropdown-helpers.js';

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Collect all sections on the page that have a section-level data-id.
 * Adjust the selector if your sections live somewhere else.
 */
function collectSections() {
  // For your decorateSections, sections are direct children of main: main > div.section
  const sections = [...document.querySelectorAll('main > .section')];

  return sections
    .map((section) => {
      // Prefer dataset.id; fallback to DOM id; fallback to generated id
      const dataId = section.dataset.id;
      if (!dataId) return null;

      // Label to show in dropdown:
      // 1) use metadata label if you introduce one, e.g. data-navLabel
      // 2) otherwise use first heading text
      const label = section.dataset.navLabel || dataId || section.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim();

      return { id: dataId, label, element: section };
    })
    .filter(Boolean);
}

/**
 * Main decorate function for the sub-nav block.
 * Will turn the block into a dropdown that navigates between sections.
 */
export default function decorate(block) {
  const isSubNav = getMetadata('issubnav') === 'true';

  if (!isSubNav) {
    block.remove();
    return;
  }

  // Read block config from the table or dataset (depending on how you process block config)
  // Common pattern: first row / first cell contains class row –
  // but your model already sets `classes`
  // If Crosswalk already applies classes from the `classes` field,
  // you can also read them from block.classList.
  const blockClasses = [...block.classList];
  const hasDropdownClass = blockClasses.includes('subnav-dropdown');

  // If this sub-nav is configured as "without dropdown", do nothing (or render alternative UI)
  if (!hasDropdownClass) {
    // Optionally: you may want to strip table markup or render a static nav here.
    return;
  }

  // 1. Collect sections
  const sections = collectSections();
  if (!sections.length) {
    // No sections to navigate to, keep the block empty/hidden
    block.textContent = '';
    return;
  }

  // 2. Build UI: wrapper + back button + select
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper content';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'sub-nav-back';
  backButton.setAttribute('aria-label', 'Go back to previous page');
  backButton.innerHTML = '<span class="sub-nav-back-circle icon-arrow-left"></span>';
  backButton.addEventListener('click', () => {
    window.history.back();
  });

  // Build dropdown links HTML (ul/li/a) for createGlobalDropdown
  const linksHTML = `<ul>${sections.map(({ id, label: optLabel }) => `<li><a href="#" data-section-id="${escapeHtml(id)}" class="global-dropdown-link">${escapeHtml(optLabel)}</a></li>`).join('')}</ul>`;
  const initialLabel = sections[0]?.label ?? 'Select';
  const subNavSelect = createGlobalDropdown(initialLabel, linksHTML, document);
  subNavSelect.classList.add('sub-nav-select');

  // Wire link clicks: scroll to section, update trigger label, close dropdown
  subNavSelect.querySelectorAll('.global-dropdown-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.sectionId;
      if (!targetId) return;

      const targetSection = document.querySelector(`main > .section[data-id="${CSS.escape(targetId)}"]`);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      subNavSelect.querySelector('.global-dropdown-trigger').textContent = link.textContent;
      subNavSelect.classList.remove('is-open');
      subNavSelect.querySelector('.global-dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });

  wrapper.append(backButton, subNavSelect);

  // 4. Clean up any existing table markup from authoring and inject our UI
  block.textContent = '';
  block.appendChild(wrapper);
}
