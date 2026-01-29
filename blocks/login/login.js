// Desktop media query
const isDesktop = window.matchMedia('(min-width: 1025px)');

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
  loginButton.className = isDesktop.matches ? 'login-button primary' : 'login-button icon-login';
  loginButton.setAttribute('aria-expanded', 'false');
  loginButton.setAttribute('aria-haspopup', 'true');
  loginButton.setAttribute('type', 'button');

  if (isDesktop.matches) {
    const buttonTextSpan = document.createElement('span');
    buttonTextSpan.className = 'login-button-text';
    buttonTextSpan.textContent = buttonText;
    loginButton.appendChild(buttonTextSpan);
  }

  if (!isDesktop.matches) {
    const dropdownIcon = document.createElement('span');
    dropdownIcon.className = 'icon-dropdown';
    dropdownIcon.setAttribute('aria-hidden', 'true');
    loginButton.appendChild(dropdownIcon);
  }

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
    const cells = [...row.children];

    cells.forEach((cell) => {
      const headings = cell.querySelectorAll('h3');
      const lists = cell.querySelectorAll('ul');

      if (headings.length === 0 && lists.length === 0) return;

      headings.forEach((heading) => {
        const section = buildSectionFromHeading(heading);
        if (section) panelInner.appendChild(section);
      });

      lists.forEach((list) => {
        if (list.previousElementSibling?.tagName === 'H3') return;
        const linkList = buildLinkList(list, 'login-link-list-standalone');
        panelInner.appendChild(linkList);
      });
    });
  });

  loginPanel.appendChild(panelInner);
  return loginPanel;
}

/**
 * Creates the overlay element and appends it to body.
 * @returns {HTMLDivElement}
 */
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'login-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Opens the login panel and applies desktop nav state if needed.
 * @param {{ button: HTMLButtonElement, panel: HTMLElement, overlay: HTMLElement }} state
 */
function openPanel(state) {
  const { button, panel, overlay } = state;
  button.setAttribute('aria-expanded', 'true');
  panel.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-active');
  document.body.classList.add('login-panel-open');

  if (isDesktop.matches) {
    const mainNavDesktop = document.querySelector('.main-nav-desktop');
    const topNav = document.querySelector('.header-nav > .top-nav');
    if (mainNavDesktop) mainNavDesktop.classList.add('is-scrolled');
    if (topNav) topNav.classList.add('is-hidden');
  }
}

/**
 * Closes the login panel and restores desktop nav state when appropriate.
 * @param {{ button: HTMLButtonElement, panel: HTMLElement, overlay: HTMLElement }} state
 */
function closePanel(state) {
  const { button, panel, overlay } = state;
  button.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-active');
  document.body.classList.remove('login-panel-open');

  if (isDesktop.matches) {
    const mainNavDesktop = document.querySelector('.main-nav-desktop');
    const topNav = document.querySelector('.header-nav > .top-nav');
    const topNavHeight = topNav ? topNav.getBoundingClientRect().height : 0;
    const hasMegamenuActive = document.querySelector('.main-nav-item.is-active');

    if (!hasMegamenuActive && window.scrollY <= topNavHeight) {
      if (mainNavDesktop) mainNavDesktop.classList.remove('is-scrolled');
      if (topNav) topNav.classList.remove('is-hidden');
    }
  }
}

/**
 * Closes any other open login panels (single-open behavior).
 * @param {HTMLButtonElement} currentButton
 */
function closeOtherLoginPanels(currentButton) {
  document.querySelectorAll('.login-button[aria-expanded="true"]').forEach((btn) => {
    if (btn === currentButton) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.closest('.login-wrapper')
      ?.querySelector('.login-panel')
      ?.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('.login-overlay.is-active').forEach((el) => {
    el.classList.remove('is-active');
  });
}

/**
 * Binds click and keyboard events for the login panel.
 * @param {HTMLElement} wrapper
 * @param {{ button: HTMLButtonElement, panel: HTMLElement, overlay: HTMLElement }} state
 */
function bindPanelEvents(wrapper, state) {
  const { button, overlay } = state;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeOtherLoginPanels(button);

    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closePanel(state);
    } else {
      openPanel(state);
    }
  });

  overlay.addEventListener('click', () => closePanel(state));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closePanel(state);
      button.focus();
    }
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });
}

/**
 * Decorates the Login block.
 * Creates a login button with a dropdown panel containing categorized login links.
 * - Button with configurable text (e.g., 'Log on')
 * - Dropdown panel with sections (Personal, Business) and login links
 * @param {Element} block The login block element
 */
export default function decorate(block) {
  const parsed = parseBlockContent(block);
  if (!parsed) return;

  const { buttonText, contentRows } = parsed;
  block.textContent = '';

  const loginWrapper = document.createElement('div');
  loginWrapper.className = 'login-wrapper';

  const loginButton = createLoginButton(buttonText);
  const loginPanel = createLoginPanel(contentRows);
  const overlay = createOverlay();

  loginWrapper.appendChild(loginButton);
  loginWrapper.appendChild(loginPanel);

  const state = { button: loginButton, panel: loginPanel, overlay };
  bindPanelEvents(loginWrapper, state);

  block.appendChild(loginWrapper);
}
