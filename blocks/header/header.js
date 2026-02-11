import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 1025px)');

/**
 * Extracts nav blocks from the loaded fragment.
 * @param {DocumentFragment} fragment
 * @returns {{
 *   topNavBlock: Element|null,
 *   brandLogoBlock: Element|null,
 *   mainNavBlocks: NodeListOf<Element>,
 *   loginBlock: Element|null,
 *   locationBlock: Element|null,
 *   searchBlock: Element|null
 * }}
 */
function getNavBlocks(fragment) {
  return {
    topNavBlock: fragment.querySelector('.top-nav'),
    brandLogoBlock: fragment.querySelector('.brand-logo'),
    mainNavBlocks: fragment.querySelectorAll('.main-nav-item'),
    loginBlock: fragment.querySelector('.login'),
    locationBlock: fragment.querySelector('.location'),
    searchBlock: fragment.querySelector('.search'),
  };
}

/**
 * Desktop scroll: hide top-nav when scrolled past, add/remove is-scrolled on main nav.
 * @param {Element|null} topNavBlock
 * @param {HTMLElement} mainNavDesktop
 * @param {() => boolean} getIsNavItemActive
 */
function setupDesktopScrollBehavior(topNavBlock, mainNavDesktop, getIsNavItemActive) {
  let topNavHeight = 0;

  const getTopNavHeight = () => {
    if (topNavBlock) {
      topNavHeight = topNavBlock.getBoundingClientRect().height;
    }
    return topNavHeight;
  };

  setTimeout(getTopNavHeight, 100);

  const handleDesktopScroll = () => {
    const currentScrollY = window.scrollY;
    if (topNavHeight === 0) getTopNavHeight();

    if (currentScrollY >= topNavHeight && topNavHeight > 0) {
      if (topNavBlock) topNavBlock.classList.add('is-hidden');
      mainNavDesktop.classList.add('is-scrolled');
    } else if (!getIsNavItemActive()) {
      if (topNavBlock) topNavBlock.classList.remove('is-hidden');
      mainNavDesktop.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleDesktopScroll, { passive: true });
}

/**
 * Desktop megamenu: toggle is-active on main-nav-items, is-scrolled when open,
 * close on outside click.
 * @param {HTMLElement} mainNavDesktop
 * @param {NodeListOf<Element>} mainNavBlocks
 * @param {Element|null} topNavBlock
 * @param {{ isNavItemActive: boolean }} desktopState
 */
function setupDesktopMegamenuBehavior(mainNavDesktop, mainNavBlocks, topNavBlock, desktopState) {
  let topNavHeight = 0;

  const getTopNavHeight = () => {
    if (topNavBlock) {
      topNavHeight = topNavBlock.getBoundingClientRect().height;
    }
    return topNavHeight;
  };

  const closeMegamenu = () => {
    getTopNavHeight();
    mainNavBlocks.forEach((block) => block.classList.remove('is-active'));
    desktopState.isNavItemActive = false;
    if (window.scrollY <= topNavHeight) {
      mainNavDesktop.classList.remove('is-scrolled');
    }
  };

  mainNavBlocks.forEach((navBlock) => {
    navBlock.addEventListener('click', (e) => {
      const megamenuPanel = navBlock.querySelector('.megamenu-panel');
      if (megamenuPanel && megamenuPanel.contains(e.target)) {
        e.stopPropagation();
        return;
      }

      e.stopPropagation();

      const isAlreadyActive = navBlock.classList.contains('is-active');
      mainNavBlocks.forEach((block) => block.classList.remove('is-active'));

      if (!isAlreadyActive) {
        navBlock.classList.add('is-active');
        desktopState.isNavItemActive = true;
        mainNavDesktop.classList.add('is-scrolled');
      } else {
        closeMegamenu();
      }
    });
  });

  mainNavDesktop.addEventListener('click', (e) => {
    const clickedNavItem = e.target.closest('.main-nav-item');
    if (!clickedNavItem && desktopState.isNavItemActive) {
      e.stopPropagation();
    }
  });

  document.addEventListener('click', () => {
    if (desktopState.isNavItemActive) closeMegamenu();
  });
}

/**
 * Builds desktop header: top-nav, main-nav (brand + main-nav-items, login, location, search).
 * @param {HTMLElement} header
 * @param {ReturnType<getNavBlocks>} blocks
 */
function buildDesktopLayout(header, blocks) {
  const {
    topNavBlock, brandLogoBlock, mainNavBlocks, loginBlock, locationBlock, searchBlock,
  } = blocks;

  if (topNavBlock) header.appendChild(topNavBlock);

  const mainNavDesktop = document.createElement('div');
  mainNavDesktop.className = 'main-nav-desktop';

  if (brandLogoBlock) mainNavDesktop.appendChild(brandLogoBlock);

  const mainNavRight = document.createElement('div');
  mainNavRight.className = 'main-nav-right';

  mainNavBlocks.forEach((navBlock) => mainNavRight.appendChild(navBlock));
  if (loginBlock) mainNavRight.appendChild(loginBlock);
  if (locationBlock) mainNavRight.appendChild(locationBlock);
  if (searchBlock) mainNavRight.appendChild(searchBlock);

  mainNavDesktop.appendChild(mainNavRight);
  header.appendChild(mainNavDesktop);

  const desktopState = { isNavItemActive: false };
  setupDesktopScrollBehavior(topNavBlock, mainNavDesktop, () => desktopState.isNavItemActive);
  setupDesktopMegamenuBehavior(mainNavDesktop, mainNavBlocks, topNavBlock, desktopState);
}

/**
 * Mobile scroll: fix mobile-top-bar on top with dark background when user scrolls.
 * @param {HTMLElement} header
 * @param {HTMLElement} mobileTopBar
 */
function setupMobileScrollBehavior(header, mobileTopBar) {
  const applyScrollState = () => {
    if (isDesktop.matches) return;
    const scrolled = window.scrollY > 0;
    if (scrolled) {
      mobileTopBar.classList.add('is-scrolled');
      header.style.paddingTop = `${mobileTopBar.offsetHeight}px`;
    } else {
      mobileTopBar.classList.remove('is-scrolled');
      header.style.paddingTop = '';
    }
  };
  window.addEventListener('scroll', applyScrollState, { passive: true });
  applyScrollState();
}

/**
 * Builds mobile main-nav items (nested lists with back buttons and megamenu content).
 * @param {HTMLElement} mobileNavContent
 * @param {NodeListOf<Element>} mainNavBlocks
 */
function buildMobileMainNavItems(mobileNavContent, mainNavBlocks) {
  mainNavBlocks.forEach((navBlock) => {
    const navItem = document.createElement('div');
    navItem.className = 'mobile-nav-item-nested';
    const navItemWrapper = navBlock.querySelector('.main-nav-item-wrapper');
    const navTrigger = navBlock.querySelector('.main-nav-trigger');

    navItem.appendChild(navTrigger);

    const innerList = document.createElement('ul');
    innerList.className = 'first-level-list';
    const firstLevelBackBtn = document.createElement('li');
    firstLevelBackBtn.className = 'first-level-list-item back-btn';
    firstLevelBackBtn.innerHTML = `
      <button class="button">
        <span class="icon">Back</span>
      </button>
    `;
    innerList.appendChild(firstLevelBackBtn);

    firstLevelBackBtn.addEventListener('click', () => {
      innerList.classList.remove('active');
    });

    navItemWrapper.querySelectorAll('.megamenu-panel .megamenu-column .megamenu-column-links').forEach((column) => {
      const columnList = document.createElement('li');
      columnList.className = 'first-level-list-item';
      columnList.appendChild(column);
      innerList.appendChild(columnList);

      const columnMenuList = column.querySelector('.megamenu-link-list');

      const secondLevelBackBtn = document.createElement('li');
      secondLevelBackBtn.className = 'megamenu-link-item back-btn';
      secondLevelBackBtn.innerHTML = `
        <button class="button">
          <span class="icon">Back</span>
        </button>
      `;
      columnMenuList.prepend(secondLevelBackBtn);

      secondLevelBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        columnList.querySelector('.megamenu-link-list').classList.remove('active');
      });

      columnList.addEventListener('click', () => {
        columnList.querySelector('.megamenu-link-list').classList.add('active');
      });
    });

    navItem.appendChild(innerList);

    mobileNavContent.appendChild(navItem);

    navTrigger.addEventListener('click', () => {
      innerList.classList.add('active');
    });
  });
}

/**
 * Wires hamburger open/close, overlay click, document click, escape.
 * @param {HTMLButtonElement} hamburger
 * @param {HTMLElement} mobileNavMenu
 * @param {HTMLElement} mobileNavOverlay
 */
function setupMobileMenuBehavior(hamburger, mobileNavMenu, mobileNavOverlay) {
  const closeMobileMenu = () => {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    hamburger.classList.remove('is-hidden');
    mobileNavMenu.setAttribute('aria-hidden', 'true');
    mobileNavMenu.classList.remove('is-open');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
    mobileNavOverlay.classList.remove('is-visible');
    document.body.style.overflowY = '';
  };

  const openMobileMenu = () => {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation');
    hamburger.classList.add('is-hidden');
    mobileNavMenu.setAttribute('aria-hidden', 'false');
    mobileNavMenu.classList.add('is-open');
    mobileNavOverlay.setAttribute('aria-hidden', 'false');
    mobileNavOverlay.classList.add('is-visible');
    document.body.style.overflowY = 'hidden';
  };

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!mobileNavMenu.classList.contains('is-open')) {
      openMobileMenu();
    }
  });

  mobileNavOverlay.addEventListener('click', closeMobileMenu);
  document.addEventListener('click', (e) => {
    if (mobileNavMenu.classList.contains('is-open')) {
      if (!mobileNavMenu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileMenu();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && mobileNavMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  });
}

/**
 * Builds mobile header: top bar (hamburger, brand, login) + nav menu
 * (search, location, main-nav, top-nav) + overlay.
 * @param {HTMLElement} header
 * @param {ReturnType<getNavBlocks>} blocks
 */
function buildMobileLayout(header, blocks) {
  const {
    topNavBlock, brandLogoBlock, mainNavBlocks, loginBlock, locationBlock, searchBlock,
  } = blocks;

  const mobileTopBar = document.createElement('div');
  mobileTopBar.className = 'mobile-top-bar';

  const hamburger = document.createElement('div');
  hamburger.className = 'hamburger-icon';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  mobileTopBar.appendChild(hamburger);

  if (brandLogoBlock) {
    brandLogoBlock.classList.add('mobile-brand-logo');
    mobileTopBar.appendChild(brandLogoBlock);
  }

  if (loginBlock) {
    loginBlock.classList.add('mobile-login');
    mobileTopBar.appendChild(loginBlock);
  }

  const mobileNavMenu = document.createElement('div');
  mobileNavMenu.className = 'mobile-nav-menu';
  mobileNavMenu.setAttribute('aria-hidden', 'true');

  const mobileNavContent = document.createElement('div');
  mobileNavContent.className = 'mobile-nav-content';

  const mobileMenuTopRow = document.createElement('div');
  mobileMenuTopRow.className = 'mobile-menu-top-row';
  if (searchBlock) mobileMenuTopRow.appendChild(searchBlock);
  if (locationBlock) mobileMenuTopRow.appendChild(locationBlock);
  mobileNavContent.appendChild(mobileMenuTopRow);

  buildMobileMainNavItems(mobileNavContent, mainNavBlocks);

  if (topNavBlock) mobileNavContent.appendChild(topNavBlock);

  mobileNavMenu.appendChild(mobileNavContent);

  const mobileNavOverlay = document.createElement('div');
  mobileNavOverlay.className = 'mobile-nav-overlay';
  mobileNavOverlay.setAttribute('aria-hidden', 'true');

  header.appendChild(mobileTopBar);
  header.appendChild(mobileNavOverlay);
  header.appendChild(mobileNavMenu);

  setupMobileMenuBehavior(hamburger, mobileNavMenu, mobileNavOverlay);
  setupMobileScrollBehavior(header, mobileTopBar);
}

/**
 * Loads and decorates the header (nav). Delegates to desktop or mobile layout.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  if (!fragment) return;

  block.textContent = '';
  const header = document.createElement('div');
  header.className = 'header-nav';

  const blocks = getNavBlocks(fragment);

  if (isDesktop.matches) {
    buildDesktopLayout(header, blocks);
  } else {
    buildMobileLayout(header, blocks);
  }

  block.append(header);
}
