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

export default function decorate(block) {
  const [variantcell] = block.children;
  const variant = variantcell?.textContent?.trim() || 'default';

  const mainImgContainer = document.createElement('div');
  mainImgContainer.classList = 'hero-banner-container';

  const bannerList = document.createElement('ul');
  bannerList.classList = 'hero-banner-list';

  let bannerIndex = 0;

  const items = [...block.children].slice(1, 8);

  items.forEach((row) => {
    // eslint-disable-next-line no-unused-vars
    const [imageCell, logoImageCell, headingCell, textCell, linkCell, thumbImgCell] = [
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

    const contentGroup = document.createElement('div');
    contentGroup.classList = 'hero-banner-content-group';

    const logoPicture = logoImageCell?.querySelector('picture');
    const logoImg = logoPicture?.querySelector('img');
    if (logoImg) {
      logoImg.className = 'hero-banner-logo';
      const logoWrapper = document.createElement('div');
      logoWrapper.className = 'hero-banner-logo-wrapper';
      logoWrapper.append(logoImg);

      contentInner.append(logoWrapper);
    }

    if (headingCell) {
      contentGroup.innerHTML += headingCell.innerHTML;
    }

    if (textCell) {
      const textElement = textCell.firstElementChild || textCell;
      textElement.classList.add('hero-banner-content-inner-text');
      contentGroup.innerHTML += textCell.innerHTML;
    }

    if (linkCell) {
      contentGroup.innerHTML += linkCell.innerHTML;
    }

    decorateButtonsV1(contentGroup);
    contentGroup.querySelector('a')?.classList.add('button-m');

    contentInner.append(contentGroup);
    content.append(contentInner);
    bannerItem.append(content);
    bannerList.append(bannerItem);

    bannerIndex += 1;
  });

  mainImgContainer.append(bannerList);

  const wrapper = document.createElement('div');
  wrapper.className = `hero-banner hero-banner-${variant}`;
  wrapper.append(mainImgContainer);

  block.replaceChildren(wrapper);

  changeBanner(block);
}
