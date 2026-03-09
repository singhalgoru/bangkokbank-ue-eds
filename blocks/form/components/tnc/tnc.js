const textIntersectionClass = 'tnc__text-intersect';
const textDecorationClass = 'tnc-text-decoration';

class TermsAndConditions {
  constructor(fieldDiv, fieldJson) {
    this.fieldDiv = fieldDiv;
    this.fieldJson = fieldJson;
    this.formModel = null;
    this.approvalCheckboxModel = null;
    this.decorate();
  }

  setFormModel(model) {
    this.formModel = model;
    // Find the approval checkbox model from the panel's items
    this.approvalCheckboxModel = model?.items?.find(
      (item) => item.name === 'approvalcheckbox',
    );
  }

  getfieldDiv() {
    return this.fieldDiv;
  }

  decorate() {
    const textWrapper = this.fieldDiv.querySelector('.plain-text-wrapper');
    const helpText = this.fieldDiv.querySelector('.field-description');
    if (helpText) {
      this.fieldDiv.append(helpText);
    }
    if (!textWrapper) { // rendition does not have a plain-text-wrapper => link rendition of TnC
      // eslint-disable-next-line no-console
      console.debug('No plain-text found in TnC field. Assuming Link based rendition and Skipping decoration.');
      this.fieldDiv.classList.add('link');
      return;
    }
    textWrapper.classList.add(textDecorationClass);
    const intersection = document.createElement('div');
    intersection.classList.add(textIntersectionClass);
    textWrapper.appendChild(intersection);
    this.handleScroll();
  }

  handleScroll() {
    const intersection = this.fieldDiv.querySelector(`.${textIntersectionClass}`);
    if (intersection) {
      const io = new IntersectionObserver(([{ isIntersecting }]) => {
        if (isIntersecting) {
          // Enable the checkbox via the form model
          if (this.approvalCheckboxModel) {
            this.approvalCheckboxModel.enabled = true;
          }
          io.unobserve(intersection);
        }
      }, {
        threshold: [1],
      });
      io.observe(intersection);
    }
  }
}
export default async function decorate(tncDiv, fieldJson, container, formId) {
  const tnc = new TermsAndConditions(tncDiv, fieldJson);

  // Import subscribe function from rules engine
  const { subscribe } = await import('../../rules/index.js');

  // Subscribe to get form model access when it's ready
  subscribe(tncDiv, formId, (fieldDiv, fieldModel, eventType) => {
    if (eventType === 'register') {
      // Form model is ready, store it in the TNC instance
      tnc.setFormModel(fieldModel);
    }
  }, { listenChanges: false });

  return tnc.getfieldDiv();
}
