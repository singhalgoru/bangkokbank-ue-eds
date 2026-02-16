/**
 * Converts a date to Bangkok timezone
 * @param {Date} date - The date to convert
 * @returns {Date} - Date in Bangkok timezone
 */
function toBangkokTime(date) {
  // Create a date string in Bangkok timezone
  const bangkokString = date.toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok',
  });
  return new Date(bangkokString);
}

/**
 * Checks if current Bangkok time is within the date range
 * @param {string} startDate - ISO date string for start
 * @param {string} endDate - ISO date string for end
 * @returns {boolean} - True if current time is within range
 */
function isWithinDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return false;
  }

  try {
    const now = new Date();
    const bangkokNow = toBangkokTime(now);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const bangkokStart = toBangkokTime(start);
    const bangkokEnd = toBangkokTime(end);

    return bangkokNow >= bangkokStart && bangkokNow <= bangkokEnd;
  } catch (error) {
    return false;
  }
}

/**
 * Decorates the warning-card block
 * @param {HTMLElement} block - The block element
 */
export default function decorate(block) {
  // Get the first row which contains all the data
  const row = block.querySelector('div');
  if (!row) {
    block.style.display = 'none';
    return;
  }

  const cells = [...row.children];

  // Extract data from cells based on the model structure
  // Expected order: icon, iconAlt, title, description, startDate, endDate
  const [iconCell, iconAltCell, titleCell, descriptionCell, startDateCell, endDateCell] = cells;

  const icon = iconCell?.querySelector('picture') || iconCell?.querySelector('img');
  const iconAlt = iconAltCell?.textContent?.trim() || '';
  const title = titleCell?.textContent?.trim() || '';
  const description = descriptionCell?.innerHTML || '';
  const startDate = startDateCell?.textContent?.trim() || '';
  const endDate = endDateCell?.textContent?.trim() || '';

  // Check if current time is within the date range (Bangkok timezone)
  if (!isWithinDateRange(startDate, endDate)) {
    block.style.display = 'none';
    return;
  }

  // Create structured data for the card
  const cardData = {
    icon: icon?.querySelector('img')?.src || '',
    iconAlt,
    title,
    description,
    startDate,
    endDate,
    timezone: 'Asia/Bangkok',
  };

  // Clear the block
  block.innerHTML = '';

  // Create card wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'warning-card-wrapper';
  wrapper.setAttribute('data-warning-card', JSON.stringify(cardData));

  // Create card item
  const cardItem = document.createElement('div');
  cardItem.className = 'warning-card-item';

  // Create card inner container
  const cardInner = document.createElement('div');
  cardInner.className = 'warning-card-inner';

  // Add icon if present
  if (icon) {
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'warning-card-icon';

    const iconImg = icon.querySelector('img');
    if (iconImg) {
      const newIconImg = iconImg.cloneNode(true);
      newIconImg.className = 'warning-card-icon-img';
      newIconImg.alt = iconAlt;
      newIconImg.loading = 'lazy';
      iconWrapper.appendChild(newIconImg);
    }

    cardInner.appendChild(iconWrapper);
  }

  // Create content container
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'warning-card-content';

  // Add title
  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'warning-card-title';
    titleElement.textContent = title;
    contentWrapper.appendChild(titleElement);
  }

  // Add description
  if (description) {
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'warning-card-description';
    descriptionElement.innerHTML = description;
    contentWrapper.appendChild(descriptionElement);
  }

  cardInner.appendChild(contentWrapper);
  cardItem.appendChild(cardInner);
  wrapper.appendChild(cardItem);

  block.appendChild(wrapper);
  block.classList.add('warning-card-loaded');
}
