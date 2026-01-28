/**
 * Social Icons Block
 * Displays social media sharing icons with expandable animation
 * Styled like Bangkok Bank's website
 */

export default function decorate(block) {
  // Create social share container
  const socialShare = document.createElement('div');
  socialShare.className = 'social-share';

  // Create share button icon
  const shareIcon = document.createElement('div');
  shareIcon.className = 'icon-share';
  shareIcon.setAttribute('aria-label', 'Share');
  shareIcon.setAttribute('role', 'button');
  shareIcon.setAttribute('tabindex', '0');

  // Create close button icon
  const closeIcon = document.createElement('a');
  closeIcon.className = 'icon-close';
  closeIcon.href = '#';
  closeIcon.textContent = '';
  closeIcon.setAttribute('aria-label', 'Close');

  // Create share icons container
  const shareIconsDiv = document.createElement('div');
  shareIconsDiv.className = 'share-icons';

  // Create icons list
  const iconsList = document.createElement('ul');

  // Parse the block content to extract social icon data
  const rows = Array.from(block.children);

  rows.forEach((row) => {
    // Each row contains: platform name, icon image, and URL
    const cells = Array.from(row.children);

    if (cells.length >= 3) {
      const platformCell = cells[0];
      const iconCell = cells[1];
      const urlCell = cells[2];

      // Get platform name (facebook, x, line)
      const platform = platformCell.textContent.trim().toLowerCase();

      // Get URL
      const link = urlCell.querySelector('a');
      const url = link ? link.href : '#';

      // Get the icon image (picture or img element) from editor
      const picture = iconCell.querySelector('picture');
      const img = iconCell.querySelector('img');

      // Create list item
      const li = document.createElement('li');

      // Create anchor
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.className = `icon-${platform}`;
      anchor.setAttribute('aria-label', `Share on ${platform}`);
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');

      // Clone and append the image from editor
      if (picture) {
        const clonedPicture = picture.cloneNode(true);
        anchor.appendChild(clonedPicture);
      } else if (img) {
        const clonedImg = img.cloneNode(true);
        clonedImg.setAttribute('alt', `${platform} icon`);
        anchor.appendChild(clonedImg);
      }

      li.appendChild(anchor);
      iconsList.appendChild(li);
    }
  });

  // Assemble the structure
  shareIconsDiv.appendChild(iconsList);
  socialShare.appendChild(closeIcon);
  socialShare.appendChild(shareIconsDiv);
  socialShare.appendChild(shareIcon);

  // Clear the block completely including any existing social-share elements
  block.innerHTML = '';

  // Remove any existing social-share from parent elements (in case of duplication)
  const existingSocialShare = block.parentElement?.querySelector('.social-share');
  if (existingSocialShare && existingSocialShare !== socialShare) {
    existingSocialShare.remove();
  }

  block.appendChild(socialShare);

  // IMPORTANT: Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    // Add click to the ENTIRE container (most reliable approach)
    socialShare.addEventListener('click', (e) => {
      const isActive = socialShare.classList.contains('active');

      if (!isActive) {
        // Expand
        socialShare.classList.add('active');
      } else {
        // Check if clicking on close button or outside icons
        const clickedIcon = e.target.closest('.share-icons a');
        const clickedClose = e.target.classList.contains('icon-close');

        if (clickedClose || !clickedIcon) {
          socialShare.classList.remove('active');
        }
      }
    });
  }, 100);

  // Add click handlers for social sharing
  const socialLinks = iconsList.querySelectorAll('a');
  socialLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const platform = link.className.replace('icon-', '');
      const currentUrl = encodeURIComponent(window.location.href);
      const pageTitle = encodeURIComponent(document.title);

      // Prevent default and open share dialog
      e.preventDefault();
      e.stopPropagation(); // Prevent triggering container click

      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
          break;
        case 'x':
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`;
          break;
        case 'line':
          shareUrl = `https://social-plugins.line.me/lineit/share?url=${currentUrl}`;
          break;
        default:
          // Use the original URL if platform is not recognized
          shareUrl = link.href;
      }

      if (shareUrl && shareUrl !== '#') {
        // Open in new window with specific dimensions
        window.open(
          shareUrl,
          'share-dialog',
          'width=600,height=400,left=200,top=100',
        );
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && socialShare.classList.contains('active')) {
      socialShare.classList.remove('active');
    }
  });
}
