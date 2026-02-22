import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_BUTTON_TEXT = 'Log on';

/**
 * Parses the block content and returns button text and content rows.
 * @param {Element} block The login block element
 * @returns {{ buttonText: string, contentRows: Element[] } | null} Null when block has no children
 */
function parseBlockContent(block) {
  const rows = [...block.children];
  if (rows.length === 0) return null;

  const buttonTextRow = rows[0];
  const buttonText = buttonTextRow.querySelector('p')?.textContent?.trim()
    || buttonTextRow.textContent?.trim()
    || DEFAULT_BUTTON_TEXT;

  const contentRows = rows.slice(1);
  return { buttonText, contentRows };
}

/**
 * Creates the login button element (text on desktop, icon on mobile).
 * @param {string} buttonText
 * @returns {HTMLButtonElement}
 */
function createLoginButton(buttonText) {
  const loginButton = document.createElement('button');

  loginButton.className = 'login-button primary icon-login';
  loginButton.setAttribute('aria-expanded', 'false');
  loginButton.setAttribute('aria-haspopup', 'true');
  loginButton.setAttribute('type', 'button');

  const buttonTextSpan = document.createElement('span');
  buttonTextSpan.className = 'login-button-text';
  buttonTextSpan.textContent = buttonText;
  loginButton.appendChild(buttonTextSpan);

  const dropdownIcon = document.createElement('span');
  dropdownIcon.className = 'icon-dropdown';
  dropdownIcon.setAttribute('aria-hidden', 'true');
  loginButton.appendChild(dropdownIcon);

  return loginButton;
}

/**
 * Builds a single link list element from a list of list items.
 * @param {HTMLUListElement} listEl Source list element
 * @param {string} [listClassName] Optional extra class (e.g. for standalone lists)
 * @returns {HTMLUListElement}
 */
function buildLinkList(listEl, listClassName = '') {
  const linkList = document.createElement('ul');
  linkList.className = `login-link-list${listClassName ? ` ${listClassName}` : ''}`;

  [...listEl.children].forEach((li) => {
    const linkItem = document.createElement('li');
    linkItem.className = 'login-link-item';

    const anchor = li.querySelector('a');
    if (anchor) {
      const link = document.createElement('a');
      link.href = anchor.href;
      link.className = 'login-link';
      link.textContent = anchor.textContent;
      linkItem.appendChild(link);
    } else {
      linkItem.textContent = li.textContent;
    }

    linkList.appendChild(linkItem);
  });

  return linkList;
}

/**
 * Builds a section (heading + list) from a heading element.
 * @param {HTMLHeadingElement} heading
 * @returns {HTMLDivElement|null} Section element or null if no following list
 */
function buildSectionFromHeading(heading) {
  const sectionGroup = document.createElement('div');
  sectionGroup.className = 'login-section';

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'login-section-title';
  sectionTitle.textContent = heading.textContent;
  sectionGroup.appendChild(sectionTitle);

  let nextSibling = heading.nextElementSibling;
  while (nextSibling && nextSibling.tagName !== 'UL' && nextSibling.tagName !== 'H3') {
    nextSibling = nextSibling.nextElementSibling;
  }

  if (nextSibling && nextSibling.tagName === 'UL') {
    const linkList = buildLinkList(nextSibling);
    sectionGroup.appendChild(linkList);
    return sectionGroup;
  }

  return null;
}

/**
 * Builds panel DOM from content rows (sections and standalone lists).
 * Preserves authoring instrumentation by moving data-aue-* from each row to a wrapper.
 * @param {Element[]} contentRows
 * @returns {HTMLDivElement}
 */
function createLoginPanel(contentRows) {
  const loginPanel = document.createElement('div');
  loginPanel.className = 'login-panel';
  loginPanel.setAttribute('aria-hidden', 'true');

  const panelInner = document.createElement('div');
  panelInner.className = 'login-panel-inner';

  contentRows.forEach((row) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'login-panel-content';
    moveInstrumentation(row, wrapper);

    const cells = [...row.children];
    cells.forEach((cell) => {
      const headings = cell.querySelectorAll('h3');
      const lists = cell.querySelectorAll('ul');

      if (headings.length === 0 && lists.length === 0) return;

      headings.forEach((heading) => {
        const section = buildSectionFromHeading(heading);
        if (section) wrapper.appendChild(section);
      });

      lists.forEach((list) => {
        if (list.previousElementSibling?.tagName === 'H3') return;
        const linkList = buildLinkList(list, 'login-link-list-standalone');
        wrapper.appendChild(linkList);
      });
    });

    panelInner.appendChild(wrapper);
  });

  loginPanel.appendChild(panelInner);
  return loginPanel;
}

function applyLayout(block) {
  // Use a less "private" property name; remove the dangling underscore.
  let loginContent = block.loginContent || parseBlockContent(block);
  if (!loginContent) return;

  const { buttonText, contentRows } = loginContent;
  if (!block.loginContent) {
    block.loginContent = {
      buttonText,
      contentRows: contentRows.map((el) => el.cloneNode(true)),
    };
    loginContent = block.loginContent;
  }
  const rowsToUse = loginContent.contentRows;

  block.innerHTML = '';

  const loginWrapper = document.createElement('div');
  loginWrapper.className = 'login-wrapper';

  const loginButton = createLoginButton(loginContent.buttonText);
  const loginPanel = createLoginPanel(rowsToUse);
  loginWrapper.appendChild(loginButton);
  loginWrapper.appendChild(loginPanel);

  block.appendChild(loginWrapper);
}

/**
 * Decorates the Login block.
 * Creates a login button with a dropdown panel containing categorized login links.
 * - Button with configurable text (e.g., 'Log on')
 * - Dropdown panel with sections (Personal, Business) and login links
 * @param {Element} block The login block element
 */
export default function decorate(block) {
  applyLayout(block);
}
