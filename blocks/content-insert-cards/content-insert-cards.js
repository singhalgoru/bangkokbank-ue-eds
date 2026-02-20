export default function decorate(block) {
  // Get the first child div which contains all the rows from the block
  const mainDiv = block.children[0];
  if (!mainDiv) {
    return;
  }

  // Get all rows from the main div
  const rows = [...mainDiv.children];

  // Check if content is empty - if all rows are empty, just return
  const hasContent = rows.some((row) => {
    const text = row.textContent.trim();
    const hasImage = row.querySelector('picture');
    return text || hasImage;
  });

  if (!hasContent) {
    return;
  }

  // Create the main card container
  const card = document.createElement('div');
  card.className = 'content-insert-card';

  // Process the promo tag (first row)
  const promoRow = rows[0];
  const promoText = promoRow.textContent.trim();
  if (promoText) {
    const promoTag = document.createElement('div');
    promoTag.className = 'promo-tag';
    promoTag.textContent = promoText;
    card.appendChild(promoTag);
  }

  // Process the image (second row)
  const imageRow = rows[1];
  const picture = imageRow.querySelector('picture');

  if (picture) {
    const figure = document.createElement('figure');
    figure.className = 'thumb-large smaller';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'thumb';
    imageContainer.appendChild(picture);

    figure.appendChild(imageContainer);

    // Create figcaption for content
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'intro-info';

    // Process title (third row)
    const titleRow = rows[2];
    const titleText = titleRow.textContent.trim();
    if (titleText) {
      const title = document.createElement('h3');
      title.className = 'title-2 line';
      title.textContent = titleText;
      figcaption.appendChild(title);
    }

    // Process description (fourth row)
    const descRow = rows[3];
    const descText = descRow.textContent.trim();
    if (descText) {
      const desc = document.createElement('div');
      desc.className = 'desc';
      const paragraph = document.createElement('p');
      paragraph.className = 'text-default';
      paragraph.textContent = descText;
      desc.appendChild(paragraph);
      figcaption.appendChild(desc);
    }

    // Process button (fifth row)
    const buttonRow = rows[4];
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

    figure.appendChild(figcaption);
    card.appendChild(figure);
  }

  // Replace block content with the new card structure
  block.innerHTML = '';
  block.appendChild(card);
}
