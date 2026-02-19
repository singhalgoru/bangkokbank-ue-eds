import { createElementWithClasses } from '../../scripts/utils/dom.js'; // eslint-disable-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  EVENT_NAME,
  triggerAccordionClickEvent,
} from '../../scripts/martech/datalayer.js'; // eslint-disable-line import/no-unresolved

const decorate = async (block, isExpand, accordionId, accordionHeadingType = 'H3') => {
  const accordionItemEl = createElementWithClasses('div', 'accordion-item');
  moveInstrumentation(block, accordionItemEl);
  if (isExpand) {
    accordionItemEl.classList.add('active');
  }

  const [titleEl, idEl, descriptionEl] = [...block.children];
  const title = titleEl?.textContent.trim();
  const id = idEl?.textContent.trim();

  // Create heading element (h3/h4)
  const heading = document.createElement(accordionHeadingType.toLowerCase());

  // Create button inside heading
  const headingButton = createElementWithClasses('button', 'accordion-button');
  headingButton.classList.add('body-01');
  headingButton.id = id;
  headingButton.setAttribute('aria-expanded', isExpand);
  headingButton.setAttribute('aria-controls', accordionId);
  headingButton.setAttribute('data-wae-event', EVENT_NAME.ACCORDION_CLICK);
  headingButton.textContent = title;

  heading.appendChild(headingButton);
  accordionItemEl.appendChild(heading);

  // Accordion toggle handler
  headingButton.addEventListener('click', (e) => {
    const clickedButton = e.currentTarget;
    const thisItem = accordionItemEl;
    const accordionContainer = thisItem.parentElement;
    const accordionTitle = headingButton.textContent;

    const isExpandAllActive = accordionContainer.getAttribute('data-expand-all-active') === 'true';

    if (isExpandAllActive) {
      e.preventDefault();
      return;
    }

    const thisContent = thisItem.querySelector('.accordion-panel');
    const isCurrentlyExpanded = thisContent.getAttribute('aria-hidden') === 'false';
    const headingId = clickedButton?.id;

    const allItems = accordionContainer.querySelectorAll('.accordion-item');
    allItems.forEach((item) => {
      const panel = item.querySelector('.accordion-panel');
      const button = item.querySelector('.accordion-button');
      item.classList.remove('active');
      if (panel) panel.setAttribute('aria-hidden', 'true');
      if (button) button.setAttribute('aria-expanded', 'false');
    });

    if (!isCurrentlyExpanded) {
      // Expand the clicked item
      thisItem.classList.add('active');
      thisContent.setAttribute('aria-hidden', 'false');
      clickedButton.setAttribute('aria-expanded', 'true');

      // Append hash to URL
      if (headingId) {
        window.location.hash = headingId;
      }
    } else {
      // If collapsing the same item, remove the hash

      // eslint-disable-next-line no-restricted-globals
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    triggerAccordionClickEvent(accordionTitle);
  });

  // Check if p has only anchor
  function addHasAnchorClass(elements) {
    const elementsArray = elements.length !== undefined ? Array.from(elements) : [elements];

    elementsArray.forEach((elem) => {
      const anchors = elem.querySelectorAll('a');
      anchors.forEach((anchor) => {
        const parentP = anchor.closest('p');
        if (parentP && !parentP.classList.contains('has-anchor')) {
          const pTextContent = parentP.textContent.trim();
          const anchorTextContent = anchor.textContent.trim();
          if (pTextContent === anchorTextContent) {
            parentP.classList.add('has-anchor');
            anchor.classList.add('standalone', 'body-01');
          }
        }
      });
    });
  }

  // Add content section
  if (descriptionEl) {
    const description = descriptionEl.innerHTML;
    const accordionContentContainer = createElementWithClasses(
      'div',
      'accordion-panel',
      'body-01',
    );

    accordionContentContainer.setAttribute('aria-hidden', !isExpand);
    accordionContentContainer.setAttribute('id', accordionId);

    accordionContentContainer.innerHTML = description;

    const anchorElements = accordionContentContainer.querySelectorAll('p');

    addHasAnchorClass(anchorElements);

    accordionItemEl.append(accordionContentContainer);
  }

  return accordionItemEl;
};

export default decorate;
