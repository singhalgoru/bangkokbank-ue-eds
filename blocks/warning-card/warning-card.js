import { createElementFromHTML } from '../../scripts/scripts.js';

/**
 * Check if the current date in Bangkok timezone falls within the specified date range
 * @param {string} startDate - Start date in ISO format or parseable date string
 * @param {string} endDate - End date in ISO format or parseable date string
 * @returns {boolean} True if current Bangkok time is within the range
 */
function isWithinDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return true; // If dates are not specified, show the warning card
  }

  try {
    // Get current time in Bangkok timezone (Asia/Bangkok)
    const bangkokTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok',
    });
    const currentBangkokDate = new Date(bangkokTime);

    // Parse start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end date to end of day (23:59:59)
    end.setHours(23, 59, 59, 999);

    // Check if current Bangkok time is within range
    return currentBangkokDate >= start && currentBangkokDate <= end;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing dates for warning-card:', error);
    return true; // Show warning card if there's an error parsing dates
  }
}

/**
 * Create structured JSON data from block fields
 * @param {object} fields - The extracted fields from the block
 * @returns {object} Structured JSON data
 */
function createStructuredJSON(fields) {
  return {
    icon: fields.icon || '',
    iconAlt: fields.iconAlt || '',
    title: fields.title || '',
    description: fields.description || '',
    startDate: fields.startDate || '',
    endDate: fields.endDate || '',
    visible: fields.visible || false,
  };
}

/**
 * Decorate the warning-card block
 * @param {Element} block - The warning-card block element
 */
export default function decorate(block) {
  const doc = block.ownerDocument;
  const children = [...block.children];

  // Extract fields from block children based on component model
  // Expected structure (matches component-models.json):
  // Row 0: Icon (reference - image)
  // Row 1: Icon Alt Text (text)
  // Row 2: Title (text, required)
  // Row 3: Description (richtext)
  // Row 4: Start Date (date-time, required)
  // Row 5: End Date (date-time, required)

  const iconCell = children[0];
  const iconAltCell = children[1];
  const titleCell = children[2];
  const descriptionCell = children[3];
  const startDateCell = children[4];
  const endDateCell = children[5];

  // Extract icon
  const iconPicture = iconCell?.querySelector('picture');
  const iconImg = iconPicture?.querySelector('img');
  const iconSrc = iconImg?.src || '';
  const iconAlt = iconAltCell?.textContent?.trim() || iconImg?.alt || '';
  const title = titleCell?.textContent?.trim() || '';
  const description = descriptionCell?.innerHTML || '';
  const startDate = startDateCell?.textContent?.trim() || '';
  const endDate = endDateCell?.textContent?.trim() || '';

  // Check if warning card should be visible based on Bangkok timezone
  const isVisible = isWithinDateRange(startDate, endDate);

  // Create structured data
  const structuredData = createStructuredJSON({
    icon: iconSrc,
    iconAlt,
    title,
    description,
    startDate,
    endDate,
    visible: isVisible,
  });

  // Store structured JSON as data attribute for potential frontend use
  block.dataset.warningCard = JSON.stringify(structuredData);

  // If not visible, hide the block and return
  if (!isVisible) {
    block.style.display = 'none';
    return;
  }

  // Create warning card HTML structure
  const warningCardHTML = `
    <div class="warning-card-container">
      <div class="warning-card-header">
        ${iconImg ? `<div class="warning-card-icon"><img src="${iconSrc}" alt="${iconAlt}" loading="lazy"></div>` : ''}
        ${title ? `<h2 class="warning-card-title">${title}</h2>` : ''}
      </div>
      ${description ? `<div class="warning-card-description">${description}</div>` : ''}
    </div>
  `;

  const warningCard = createElementFromHTML(warningCardHTML, doc);

  // Replace block content with the decorated warning card
  block.textContent = '';
  block.appendChild(warningCard);
}
