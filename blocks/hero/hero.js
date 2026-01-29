import { moveInstrumentation } from '../../scripts/scripts.js';
import { decorateButtonsV1 } from '../../scripts/bbl-decorators.js';

function changeBanner(block) {
  block.addEventListener('mouseenter', (e) => {
    const thumbnail = e.target.closest('.hero-banner__thumbnail-item');

    const idx = thumbnail.dataset.index;
    block.querySelectorAll('[data-index]').forEach((el) => {
      el.classList.toggle('hero-banner__item--active', el.classList.contains('hero-banner__item') && el.dataset.index === idx);
      el.classList.toggle('hero-banner__thumbnail-item--active', el.classList.contains('hero-banner__thumbnail-item') && el.dataset.index === idx);
    });
  }, true);
}

export default function decorate(block) {
  const mainImgContainer = document.createElement('div');
  mainImgContainer.className = 'hero-banner__main-img-container';

  const bannerList = document.createElement('ul');
  bannerList.className = 'hero-banner__list';

  const thumbnailOuter = document.createElement('div');
  thumbnailOuter.className = 'hero-banner__thumbnail-outer section full-bleed-special hero-banner__thumbnail-outer--active';

  const thumbnailList = document.createElement('ul');
  thumbnailList.className = 'hero-banner__thumbnail-list';

  let bannerIndex = 0;

  const items = [...block.children].slice(0, 7);

  items.forEach((row) => {
    const [imageCell, headingCell, textCell, linkCell, thumbImgCell] = [
      ...row.children,
    ];

    const bannerItem = document.createElement('li');
    bannerItem.className = 'hero-banner__item';
    bannerItem.dataset.index = bannerIndex;
    if (bannerIndex === 0) bannerItem.classList.add('hero-banner__item--active');

    moveInstrumentation(row, bannerItem);

    const picture = imageCell?.querySelector('picture');
    const img = picture?.querySelector('img');

    if (img) {
      img.className = 'hero-banner__desktop-img';
      img.loading = 'lazy';
      bannerItem.append(img);
    }

    /* content */
    const content = document.createElement('div');
    content.className = 'hero-banner__content section full-bleed-special';

    const contentInner = document.createElement('div');
    contentInner.className = 'hero-banner__content-inner col-md-8';

    if (headingCell) {
      contentInner.innerHTML += headingCell.innerHTML;
    }

    if (textCell) {
      contentInner.innerHTML += textCell.innerHTML;
    }

    if (linkCell) {
      contentInner.innerHTML += linkCell.innerHTML;
    }

    decorateButtonsV1(contentInner);

    content.append(contentInner);
    bannerItem.append(content);
    bannerList.append(bannerItem);

    /* ---------------- thumbnail item ---------------- */
    const thumbnailItem = document.createElement('li');
    thumbnailItem.className = 'hero-banner__thumbnail-item';
    thumbnailItem.dataset.index = bannerIndex;
    if (bannerIndex === 0) thumbnailItem.classList.add('hero-banner__thumbnail-item--active');

    const thumbPicture = thumbImgCell?.querySelector('picture');
    const thumbImg = thumbPicture?.querySelector('img');

    if (thumbImg) {
      thumbImg.className = 'hero-banner__thumbnail-img';
      thumbImg.loading = 'lazy';
      thumbnailItem.append(thumbImg);
    }

    thumbnailList.append(thumbnailItem);

    bannerIndex += 1;
  });

  mainImgContainer.append(bannerList);
  thumbnailOuter.append(thumbnailList);

  const wrapper = document.createElement('div');
  wrapper.className = 'hero-banner';
  wrapper.append(mainImgContainer);
  wrapper.append(thumbnailOuter);

  block.replaceChildren(wrapper);

  changeBanner(block);
}
