export default function decorate(block) {
  // Get all rows directly from the block
  const rows = [...block.children];

  if (rows.length === 0) {
    return;
  }

  // Destructure rows - [0] = imageRow, [1] = titleRow, [2] = descRow, [3] = buttonRow
  const [imageRow, titleRow, descRow, buttonRow] = rows;

  // Check if we have at least the image row to proceed
  if (!imageRow) {
    return;
  }

  const picture = imageRow.querySelector('picture');

  // Only proceed if we have a picture
  if (!picture) {
    return;
  }

  // Create the main card container
  const card = document.createElement('div');
  card.className = 'content-insert-card';

  const figure = document.createElement('figure');
  figure.className = 'thumb-large smaller';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'thumb';
  imageContainer.appendChild(picture);

  figure.appendChild(imageContainer);

  // Create figcaption for content
  const figcaption = document.createElement('figcaption');
  figcaption.className = 'intro-info';

  // Process title (second row) - only if it exists
  if (titleRow) {
    const titleDiv = titleRow.querySelector('div');
    const titleText = titleDiv?.textContent?.trim();

    if (titleText) {
      const title = document.createElement('h3');
      title.className = 'title-2 line';
      title.textContent = titleText;
      figcaption.appendChild(title);
    }
  }

  // Process description (third row) - only if it exists
  if (descRow) {
    const descDiv = descRow.querySelector('div');
    const descText = descDiv?.textContent?.trim();

    if (descText) {
      const desc = document.createElement('div');
      desc.className = 'desc';
      const paragraph = document.createElement('p');
      paragraph.className = 'text-default';
      paragraph.textContent = descText;
      desc.appendChild(paragraph);
      figcaption.appendChild(desc);
    }
  }

  // Process button (fourth row) - only if it exists
  if (buttonRow) {
    const buttonContainer = buttonRow.querySelector('.button-container');
    const link = buttonContainer?.querySelector('a') || buttonRow.querySelector('a');

    if (link) {
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'button-group';

      // Create new button with proper classes
      const button = document.createElement('a');
      button.className = 'btn-primary';
      button.href = link.href;
      button.textContent = link.textContent || 'Read More';
      button.title = link.title || 'read-more';

      buttonGroup.appendChild(button);
      figcaption.appendChild(buttonGroup);
    }
  }

  figure.appendChild(figcaption);
  card.appendChild(figure);

  // Replace block content with the new card structure
  block.innerHTML = '';
  block.appendChild(card);
}
