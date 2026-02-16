/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Bangkok Bank site-wide DOM cleanup
 * Purpose: Remove navigation, footer, and non-content elements before/after parsing
 * Applies to: www.bangkokbank.com (all templates)
 * Tested: /en/Personal/Save-And-Invest/Mutual-Funds, /en/business-banking/manage-my-business/merchant-services/be-express-pay
 * Generated: 2026-02-16
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow for Mutual Funds and Be Express Pay pages
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform'
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header and navigation
    // EXTRACTED: Found <header id="header"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      'header'
    ]);

    // Remove footer
    // EXTRACTED: Found <footer> in captured DOM
    WebImporter.DOMUtils.remove(element, ['footer']);

    // Remove control bar navigation (tab-like nav below hero)
    // EXTRACTED: Found <div class="control-bar"> in captured DOM
    WebImporter.DOMUtils.remove(element, ['.control-bar']);

    // Remove print-only elements
    // EXTRACTED: Found .for-print-only and .img-print in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.for-print-only',
      '.img-print'
    ]);

    // Remove mobile-specific duplicates (keep desktop versions)
    // EXTRACTED: Found .mobile-banner and .mobile-tools in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.mobile-banner',
      '.mobile-tools'
    ]);

    // Remove hidden inputs
    // EXTRACTED: Found input#pgDisplayName, input#hdnLanguage in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'input[type="hidden"]',
      'input#pgDisplayName',
      'input#hdnLanguage'
    ]);

    // Remove accordion control bar (Expand All / Print buttons)
    // EXTRACTED: Found ul.accordion-control in captured DOM
    WebImporter.DOMUtils.remove(element, ['.accordion-control']);

    // Remove empty spans and anchor divs
    // EXTRACTED: Found span:empty and div.anchor in captured DOM
    const emptySpans = element.querySelectorAll('span:empty');
    emptySpans.forEach(el => el.remove());
    WebImporter.DOMUtils.remove(element, ['div.anchor']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining unwanted elements - standard HTML cleanup
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link'
    ]);
  }
}
