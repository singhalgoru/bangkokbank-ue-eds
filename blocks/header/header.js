import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 1025px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      // toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      // toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      // toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      // toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    // toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
// function toggleAllNavSections(sections, expanded = false) {
//   sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
//     section.setAttribute('aria-expanded', expanded);
//   });
// }

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
// function toggleMenu(nav, navSections, forceExpanded = null) {
//   const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
//   const button = nav.querySelector('.nav-hamburger button');
//   document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
//   nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
//   // toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
//   button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
//   // enable nav dropdown keyboard accessibility
//   const navDrops = navSections.querySelectorAll('.nav-drop');
//   if (isDesktop.matches) {
//     navDrops.forEach((drop) => {
//       if (!drop.hasAttribute('tabindex')) {
//         drop.setAttribute('tabindex', 0);
//         drop.addEventListener('focus', focusNavSection);
//       }
//     });
//   } else {
//     navDrops.forEach((drop) => {
//       drop.removeAttribute('tabindex');
//       drop.removeEventListener('focus', focusNavSection);
//     });
//   }

//   // enable menu collapse on escape keypress
//   if (!expanded || isDesktop.matches) {
//     // collapse menu on escape press
//     window.addEventListener('keydown', closeOnEscape);
//     // collapse menu on focus lost
//     nav.addEventListener('focusout', closeOnFocusLost);
//   } else {
//     window.removeEventListener('keydown', closeOnEscape);
//     nav.removeEventListener('focusout', closeOnFocusLost);
//   }
// }

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

	if (!fragment) return;

	// Clear block and create header structure
  block.textContent = '';

  const header = document.createElement('div');
  header.className = 'header-nav';

	// Find all blocks in fragment
	const topNavBlock = fragment.querySelector('.top-nav');
	const brandLogoBlock = fragment.querySelector('.brand-logo');
	const mainNavBlocks = fragment.querySelectorAll('.main-nav-item');
	const loginBlock = fragment.querySelector('.login');
	const locationBlock = fragment.querySelector('.location');
	const searchBlock = fragment.querySelector('.search');

	// Add top nav
	if (topNavBlock) header.appendChild(topNavBlock);

	// Desktop structure
	if (isDesktop.matches) {
		// Create desktop container for brand-logo and nav actions
		const mainNavDesktop = document.createElement('div');
		mainNavDesktop.className = 'main-nav-desktop';

		// Add brand logo
		if (brandLogoBlock) mainNavDesktop.appendChild(brandLogoBlock);

		// Create nav actions group for main-nav-items, login, location, search
		const mainNavRight = document.createElement('div');
		mainNavRight.className = 'main-nav-right';

		// Add main nav items
		mainNavBlocks.forEach((navBlock) => mainNavRight.appendChild(navBlock));

		// Add login, location, search
		if (loginBlock) mainNavRight.appendChild(loginBlock);
		if (locationBlock) mainNavRight.appendChild(locationBlock);
		if (searchBlock) mainNavRight.appendChild(searchBlock);

		mainNavDesktop.appendChild(mainNavRight);
		header.appendChild(mainNavDesktop);
	} else {
		// Mobile structure (existing behavior)
		if (brandLogoBlock) header.appendChild(brandLogoBlock);
		mainNavBlocks.forEach((navBlock) => header.appendChild(navBlock));
		if (loginBlock) header.appendChild(loginBlock);
		if (locationBlock) header.appendChild(locationBlock);
		if (searchBlock) header.appendChild(searchBlock);
	}

	block.append(header);
}
