import { moveInstrumentation } from '../../scripts/scripts.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

function changeBanner(block) {
  block.addEventListener('mouseenter', (e) => {
    const thumbnail = e.target.closest('.hero-banner-thumbnail-item');
    if (!thumbnail) return;

    const idx = thumbnail.dataset.index;
    block.querySelectorAll('[data-index]').forEach((el) => {
      el.classList.toggle('hero-banner-item-active', el.classList.contains('hero-banner-item') && el.dataset.index === idx);
      el.classList.toggle('hero-banner-thumbnail-item-active', el.classList.contains('hero-banner-thumbnail-item') && el.dataset.index === idx);
    });
  }, true);
}

function lazyLoadThumbnails(block) {
  const load = () => {
    block.querySelector('.hero-banner-thumbnail-outer')?.classList.add('hero-banner-thumbnail-outer-active');
    window.removeEventListener('scroll', load);
  };
  window.addEventListener('scroll', load, { passive: true });
}

export default function decorate(block) {
  const [variantcell] = block.children;
  const variant = variantcell?.textContent?.trim() || 'default';

  const mainImgContainer = document.createElement('div');
  mainImgContainer.className = 'hero-banner-container';

  const bannerList = document.createElement('ul');
  bannerList.className = 'hero-banner-list';

  const thumbnailOuter = document.createElement('div');
  thumbnailOuter.className = 'hero-banner-thumbnail-outer'; // Removed hero-banner-thumbnail-outer-active

  const thumbnailList = document.createElement('ul');
  thumbnailList.className = 'hero-banner-thumbnail-list content';

  let bannerIndex = 0;

  const items = [...block.children].slice(1, 8);

  items.forEach((row) => {
    const [imageCell, headingCell, textCell, linkCell, thumbImgCell] = [
      ...row.children,
    ];

    const bannerItem = document.createElement('li');
    bannerItem.className = 'hero-banner-item';
    bannerItem.dataset.index = bannerIndex;
    if (bannerIndex === 0) bannerItem.classList.add('hero-banner-item-active');

    moveInstrumentation(row, bannerItem);

    const picture = imageCell?.querySelector('picture');
    const img = picture?.querySelector('img');

    if (img) {
      img.className = 'hero-banner-img';
      img.loading = 'lazy';
      bannerItem.append(img);
    }

    const content = document.createElement('div');
    content.className = 'hero-banner-content content';

    const contentInner = document.createElement('div');
    contentInner.className = 'hero-banner-content-inner';

    if (headingCell) {
      contentInner.innerHTML += headingCell.innerHTML;
    }

    if (textCell) {
      const textElement = textCell.firstElementChild || textCell;
      textElement.classList.add('hero-banner-content-inner-text');
      contentInner.innerHTML += textCell.innerHTML;
    }

    if (linkCell) {
      contentInner.innerHTML += linkCell.innerHTML;
    }

    decorateButtonsV1(contentInner);

    contentInner.querySelector('a')?.classList.add('button-m');

    content.append(contentInner);
    bannerItem.append(content);
    bannerList.append(bannerItem);

    /* ---------------- thumbnail item ---------------- */
    const thumbnailItem = document.createElement('li');
    thumbnailItem.className = 'hero-banner-thumbnail-item';
    thumbnailItem.dataset.index = bannerIndex;
    if (bannerIndex === 0) thumbnailItem.classList.add('hero-banner-thumbnail-item-active');

    const thumbPicture = thumbImgCell?.querySelector('picture');
    const thumbImg = thumbPicture?.querySelector('img');

    if (thumbImg) {
      thumbImg.className = 'hero-banner-thumbnail-img';
      thumbImg.loading = 'lazy';
      thumbnailItem.append(thumbImg);
    }

    thumbnailList.append(thumbnailItem);

    bannerIndex += 1;
  });

  mainImgContainer.append(bannerList);
  thumbnailOuter.append(thumbnailList);

  const wrapper = document.createElement('div');
  wrapper.className = `hero-banner hero-banner--${variant}`;
  wrapper.append(mainImgContainer);
  wrapper.append(thumbnailOuter);

  block.replaceChildren(wrapper);

  changeBanner(block);
  lazyLoadThumbnails(block);
}
