import createAccordionItem from './accordionItem.js';
import { createElementWithClasses } from '../../scripts/utils/dom.js'; // eslint-disable-line import/no-unresolved
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js'; // eslint-disable-line import/named
import { isAuthorEditMode, attachTestId } from '../../scripts/utils/common-utils.js'; // eslint-disable-line import/no-unresolved

function attachTestIdToElements(block) {
  const elementsToAttach = [
    { selector: '.expand-all-button', elementName: 'expand-all' },
    { selector: '.accordion-item', elementName: 'item' },
    { selector: '.accordion-button', elementName: 'item-button' },
    { selector: '.accordion-panel', elementName: 'item-panel' },
  ];

  elementsToAttach.forEach(({ selector, elementName }) => {
    attachTestId({ block, selector, elementName });
  });
}

const toggleAccordion = (block, isAllExpanded) => [...block.querySelectorAll('.accordion-item')].forEach((item) => {
  if (isAllExpanded) {
    item.classList.add('active');
  } else {
    item.classList.remove('active');
  }
  const contentArea = item.querySelector('.accordion-panel');
  contentArea.setAttribute('aria-hidden', !isAllExpanded);
  const button = item.querySelector('.accordion-button');
  if (button) button.setAttribute('aria-expanded', isAllExpanded);
});

const activateAccordionFromHash = () => {
  const { hash } = window.location;
  if (!hash) return;

  const id = hash.substring(1);
  if (!id) return;

  const targetElement = document.getElementById(id);
  if (!targetElement) return;

  // Check if it's an accordion-botton class
  if (!targetElement.classList.contains('accordion-button')) return;

  const accordionItem = targetElement.closest('.accordion-item');
  if (!accordionItem) return;

  const accordionPanel = accordionItem.querySelector('.accordion-panel');
  if (!accordionPanel) return;

  // Expand the accordion item
  accordionItem.classList.add('active');
  targetElement.setAttribute('aria-expanded', 'true');
  accordionPanel.setAttribute('aria-hidden', 'false');
};

const decorate = async (block) => {
  const [accordionHeadingTypeEl, isExpandFirstAccordionEl, , ...accordionListEl] = [
    ...block.children,
  ];

  block.innerHTML = '';

  if (isAuthorEditMode()) block.classList.add('author-edit');

  block.classList.add('accordion');
  let isAllExpanded = false;

  // Add data attribute to track expand all state
  block.setAttribute('data-expand-all-active', 'false');

  // Fetching placeholders.json data
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return;

  function getLabel() {
    return isAllExpanded
      ? placeholder.accordionCollapseAll
      : placeholder.accordionExpandAll;
  }
  const accordionHeadingType = accordionHeadingTypeEl?.textContent.trim();
  const isExpandFirstAccordion = isExpandFirstAccordionEl?.textContent.trim() === 'true';
  const expandAllButton = createElementWithClasses('button', 'expand-all-button');
  expandAllButton.textContent = getLabel();
  expandAllButton.setAttribute('aria-expanded', isAllExpanded.toString());
  expandAllButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isAllExpanded = !isAllExpanded;
    expandAllButton.setAttribute('aria-expanded', isAllExpanded.toString());

    // Update the data attribute to track state
    block.setAttribute('data-expand-all-active', isAllExpanded.toString());

    toggleAccordion(block, isAllExpanded);
    e.currentTarget.textContent = getLabel();
  });

  if (accordionListEl.length > 0) block.append(expandAllButton);

  block.append(
    ...(await Promise.all(
      accordionListEl.map((accordionItem, idx) => createAccordionItem(
        accordionItem,
        isExpandFirstAccordion && idx === 0,
        `acc-${idx}`,
        accordionHeadingType,
      )),
    )),
  );

  // open accordion if id added to URL
  activateAccordionFromHash();

  // testing requirement - set attribute 'data-testid' for elements
  attachTestIdToElements(block);
};

export default decorate;
