function decorateButtonsV1(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button-tertiary';
          up.classList.add('button-container');
        }
      }
    }
  });
}

function decorateTerritoryButtons(main) {
  // Find anchors that are "button" only (no variants like primary/secondary)
  // and convert them to "button territory".
  main.querySelectorAll('a.button:not([class*=" "])').forEach((a) => {
    a.className = 'button-tertiary';
  });
}

export {
  decorateTerritoryButtons,
  decorateButtonsV1,
};
