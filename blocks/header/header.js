import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 1025px)');

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
