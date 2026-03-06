const updateDropdown = (root, open) => {
  const trigger = root.querySelector('.global-dropdown-trigger');
  if (!trigger) return;

  root.classList.toggle('is-open', open);
  trigger.setAttribute('aria-expanded', open);
};

export default function createGlobalDropdown(label = 'Select', linksHTML = '', doc = document) {
  const root = Object.assign(doc.createElement('div'), { className: 'global-dropdown' });

  const trigger = Object.assign(doc.createElement('button'), {
    type: 'button',
    className: 'global-dropdown-trigger icon-dropdown',
    textContent: label,
  });
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');

  const panel = Object.assign(doc.createElement('div'), {
    className: 'global-dropdown-panel',
    innerHTML: linksHTML,
  });

  trigger.addEventListener('click', () => updateDropdown(root, !root.classList.contains('is-open')));
  root.addEventListener('keydown', ({ key }) => key === 'Escape' && updateDropdown(root, false));
  doc.addEventListener('click', ({ target }) => !root.contains(target) && updateDropdown(root, false));

  root.append(trigger, panel);
  return root;
}
