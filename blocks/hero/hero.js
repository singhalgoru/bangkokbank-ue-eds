import { moveInstrumentation } from '../../scripts/scripts.js';

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

  [...block.children].forEach((row) => {
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

    const link = linkCell?.querySelector('a');
    if (link) {
      link.className = 'hero-banner__btn';
      contentInner.append(link);
    }

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

  const bannerItems = block.querySelectorAll('.hero-banner__item');
  const thumbnailItems = block.querySelectorAll('.hero-banner__thumbnail-item');

  if (bannerItems.length && thumbnailItems.length) {
    block.addEventListener(
      'mouseenter',
      (e) => {
        const thumbnailItem = e.target.closest('.hero-banner__thumbnail-item');
        if (!thumbnailItem) return;

        const index = Number(thumbnailItem.dataset.index);

        bannerItems.forEach((item) => {
          item.classList.remove('hero-banner__item--active');
        });

        thumbnailItems.forEach((item) => item.classList.remove('hero-banner__thumbnail-item--active'));

        bannerItems[index].classList.add('hero-banner__item--active');
        thumbnailItem.classList.add('hero-banner__thumbnail-item--active');
      },
      true,
    );
  }
}
