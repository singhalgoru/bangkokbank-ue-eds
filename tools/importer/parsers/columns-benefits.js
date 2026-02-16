/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-benefits block
 *
 * Source: https://www.bangkokbank.com/en/business-banking/manage-my-business/merchant-services/be-express-pay
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Columns-Benefits")
 * - Row 2: 3 columns, each with icon + title + description
 *
 * Source HTML Pattern:
 * <div class="new-margin wrapper pad-top">
 *   <div class="col-md-4">
 *     <div class="thumb-info">
 *       <div class="thumb"><img /></div>
 *       <div class="content">
 *         <h4 class="sub-title-medium">Title</h4>
 *         <p class="text-default">Description</p>
 *       </div>
 *     </div>
 *   </div>
 *   ... (repeated 3 times)
 * </div>
 *
 * Generated: 2026-02-16
 */
export default function parse(element, { document }) {
  // Find all benefit columns - each is a .col-md-4 with a .thumb-info inside
  const benefitCols = element.querySelectorAll('.col-md-4 .thumb-info, .thumb-info');

  // Build a single row with 3 columns
  const row = [];

  benefitCols.forEach((col) => {
    const cellContent = document.createElement('div');

    // Extract icon image
    const icon = col.querySelector('.thumb img') ||
                 col.querySelector('img');
    if (icon) {
      cellContent.appendChild(icon.cloneNode(true));
    }

    // Extract title
    const title = col.querySelector('.sub-title-medium') ||
                  col.querySelector('h4') ||
                  col.querySelector('h3, h5');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      cellContent.appendChild(strong);
    }

    // Extract description
    const desc = col.querySelector('.text-default') ||
                 col.querySelector('p') ||
                 col.querySelector('.content p');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      cellContent.appendChild(p);
    }

    row.push(cellContent);
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Benefits', cells });
  element.replaceWith(block);
}
