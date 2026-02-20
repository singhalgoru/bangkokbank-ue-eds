export default function decorate(block) {
  // Get the first child div which contains all the rows
  const mainDiv = block.children[0];
  if (!mainDiv) {
    return;
  }

  // Get all rows from the main div
  const rows = [...mainDiv.children];

  // Check if required title field (row 2) has content
  const titleRow = rows[2];
  const titleText = titleRow?.textContent.trim();

  if (!titleText) {
    return; // Title is required, cannot render without it
  }

  // Create the main card container
  const card = document.createElement('div');
  card.className = 'content-insert-card';

  // Process the promo tag (first row) - optional, but always create div
  const promoRow = rows[0];
  const promoText = promoRow?.textContent.trim();
  const promoTag = document.createElement('div');
  promoTag.className = 'promo-tag';
  if (promoText) {
    promoTag.textContent = promoText;
  }
  card.appendChild(promoTag);

  // Process the image (second row) - optional, but always create structure
  const imageRow = rows[1];
  const picture = imageRow?.querySelector('picture');

  const figure = document.createElement('figure');
  figure.className = 'thumb-large smaller';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'thumb';
  if (picture) {
    imageContainer.appendChild(picture);
  }
  figure.appendChild(imageContainer);

  // Create figcaption for content
  const figcaption = document.createElement('figcaption');
  figcaption.className = 'intro-info';

  // Process title (third row) - required
  const title = document.createElement('h3');
  title.className = 'title-2 line';
  title.textContent = titleText;
  figcaption.appendChild(title);

  // Process description (fourth row) - optional, but always create div
  const descRow = rows[3];
  const descText = descRow?.textContent.trim();
  const desc = document.createElement('div');
  desc.className = 'desc';
  if (descText) {
    const paragraph = document.createElement('p');
    paragraph.className = 'text-default';
    paragraph.textContent = descText;
    desc.appendChild(paragraph);
  }
  figcaption.appendChild(desc);

  // Process button (fifth row) - optional, but always create div
  const buttonRow = rows[4];
  const buttonContainer = buttonRow?.querySelector('.button-container');
  const link = buttonContainer?.querySelector('a') || buttonRow?.querySelector('a');

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';
  if (link && link.textContent.trim()) {
    // Create new button with proper classes
    const button = document.createElement('a');
    button.className = 'btn-primary';
    button.href = link.href;
    button.textContent = link.textContent.trim();
    button.title = link.title || 'read-more';
    buttonGroup.appendChild(button);
  }
  figcaption.appendChild(buttonGroup);

  figure.appendChild(figcaption);
  card.appendChild(figure);

  // Replace block content with the new card structure
  block.innerHTML = '';
  block.appendChild(card);
}
