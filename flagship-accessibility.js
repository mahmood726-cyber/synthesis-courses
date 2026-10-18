/* Shared keyboard and focus behavior for the twelve flagship routes.
 * Labels reuse visible course text, whose translations remain provisional.
 * No scientific data, calculations or progress-storage formats are modified.
 */
(function () {
  'use strict';
  const d = document;
  const main = d.getElementById('main-content');
  main.tabIndex = -1; // The existing skip link now has a reliable focus destination.
  const focusable = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const visible = e => !e.closest('[hidden],[inert]') && e.getClientRects().length > 0;
  const dialogs = ['glossaryPanel','keyboardHelp','progressDashboard','dailyReviewModal'].map(id => d.getElementById(id));
  const returns = new Map();
  const openDialogs = [];
  const background = new Map();
  let openingTrigger = null;
  const sidebar = d.querySelector('.sidebar');
  const mobile = window.matchMedia('(max-width: 768px)');
  const menuButton = d.querySelector('.mobile-menu-btn');
  const tools = d.getElementById('toolsPanel');
  const glossaryTrigger = d.querySelector('.glossary-btn');
  let toolsReturn = null;

  function wrap(name, after) {
    const original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function (...args) {
      openingTrigger = d.activeElement;
      const result = original.apply(this, args);
      after(...args);
      openingTrigger = null;
      return result;
    };
  }
  function restoreBackground() {
    for (const [element, inert] of background) element.toggleAttribute('inert', inert);
    background.clear();
  }
  function isolate(dialog) {
    restoreBackground();
    for (let node = dialog; node && node !== d.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling === node || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) continue;
        background.set(sibling, sibling.hasAttribute('inert'));
        sibling.setAttribute('inert','');
      }
    }
  }
  function syncDialogs() {
    for (const panel of dialogs) {
      const open = panel.classList.contains('open');
      panel.hidden = !open;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      if (!panel.hasAttribute('aria-label')) {
        const heading = panel.querySelector('h2,h3');
        if (heading) panel.setAttribute('aria-label', heading.textContent.trim());
      }
      panel.tabIndex = -1;
      const index = openDialogs.indexOf(panel);
      if (open && index < 0) {
        returns.set(panel, openingTrigger || d.activeElement);
        openDialogs.push(panel);
        isolate(panel);
        (panel.querySelector('input') || panel.querySelector('button,[tabindex="0"]') || panel).focus();
      } else if (!open && index >= 0) {
        openDialogs.splice(index, 1);
        restoreBackground();
        if (openDialogs.length) isolate(openDialogs.at(-1));
        const target = returns.get(panel);
        if (target && target.isConnected && !target.closest('[hidden],[inert]')) target.focus();
        returns.delete(panel);
      }
    }
    glossaryTrigger.setAttribute('aria-expanded', String(!dialogs[0].hidden));
  }
  const closeDialog = panel => {
    const name = {glossaryPanel:'toggleGlossary',keyboardHelp:'toggleKeyboardHelp',progressDashboard:'closeDashboard',dailyReviewModal:'closeDailyReview'}[panel.id];
    window[name]();
  };
  for (const name of ['toggleGlossary','toggleKeyboardHelp','openDashboard','closeDashboard','openDailyReview','closeDailyReview']) wrap(name, syncDialogs);
  for (const panel of dialogs) new MutationObserver(syncDialogs).observe(panel,{attributes:true,attributeFilter:['class']});

  function syncSidebar() {
    const open = sidebar.classList.contains('open');
    sidebar.toggleAttribute('inert', mobile.matches && !open);
    sidebar.style.visibility = mobile.matches && !open ? 'hidden' : '';
    if (menuButton) menuButton.setAttribute('aria-expanded', String(open));
  }
  wrap('toggleSidebar', () => {
    syncSidebar();
    if (mobile.matches && sidebar.classList.contains('open')) sidebar.querySelector(focusable)?.focus();
    else menuButton?.focus();
  });
  mobile.addEventListener('change', syncSidebar);
  function syncTools() {
    tools.hidden = !tools.classList.contains('visible');
    d.querySelectorAll('[onclick="toggleToolsPanel()"]').forEach(button => {
      button.setAttribute('aria-controls', tools.id);
      button.setAttribute('aria-expanded', String(!tools.hidden));
    });
  }
  function afterTools() {
    syncTools();
    if (!tools.hidden) {toolsReturn = openingTrigger; tools.querySelector(focusable)?.focus();}
    else {tools.classList.remove('open');if (toolsReturn?.isConnected) toolsReturn.focus();}
  }
  wrap('toggleToolsPanel', afterTools);
  wrap('openToolsWithStory', () => {
    tools.classList.add('visible');
    d.querySelector('.content-body').classList.add('tools-open');
    afterTools();
  });
  new MutationObserver(syncTools).observe(tools,{attributes:true,attributeFilter:['class']});
  function disclosures() {
    d.querySelectorAll('.tool-section-header').forEach((header,i) => {
      const body = header.nextElementSibling;
      if (!body.id) body.id = `flagship-tool-section-${i}`;
      header.setAttribute('aria-controls', body.id);
      header.setAttribute('aria-expanded', String(body.style.display !== 'none'));
    });
  }
  wrap('toggleSection', disclosures);
  function tiers() {
    d.querySelectorAll('.tier-btn').forEach(button => {
      button.tabIndex = button.getAttribute('aria-checked') === 'true' ? 0 : -1;
    });
  }
  wrap('setTier', tiers);
  function controls(root = d) {
    root.querySelectorAll('[onclick]:not(button):not(a):not(input):not(select)').forEach(element => {
      if (element.id === 'sidebarOverlay') return;
      element.setAttribute('role', 'button');
      element.tabIndex = 0;
    });
    root.querySelectorAll('.quiz-feedback,[id$="-feedback"],#reviewFeedback,.scenario-consequence,.misconception-result').forEach(element => {
      element.setAttribute('role','status');
      element.setAttribute('aria-live','polite');
      element.setAttribute('aria-atomic','true');
    });
    d.querySelectorAll('.module-item').forEach(item => {
      if (item.classList.contains('active')) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    });
  }
  wrap('checkQuizAnswer', id => {
    d.querySelectorAll(`#${id} .quiz-option`).forEach(option => option.setAttribute('aria-disabled','true'));
  });
  for (const name of ['initModuleList','goToModule','updateProgressDots']) wrap(name, () => {controls();syncSidebar();});
  for (const name of ['renderScenario','renderMisconceptionChallenge','renderPracticeProblem','renderReviewQuestion']) wrap(name, () => controls());
  for (const id of ['moduleList','progress']) {
    const element = d.getElementById(id);
    if (element) new MutationObserver(() => controls(element)).observe(element,{childList:true});
  }
  // Keyboard help also needs a discoverable button, named with its visible heading.
  const helpButton = d.createElement('button');
  helpButton.type = 'button';helpButton.className = 'btn keyboard-help-trigger';
  helpButton.textContent = '?';
  helpButton.setAttribute('aria-label',dialogs[1].querySelector('h3').textContent.trim());
  helpButton.setAttribute('aria-controls','keyboardHelp');
  helpButton.addEventListener('click',() => window.toggleKeyboardHelp());
  d.querySelector('[onclick="toggleToolsPanel()"]').after(helpButton);

  d.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target;
    const dialog = openDialogs.at(-1);
    if (dialog) {
      if (e.key === 'Escape') {e.preventDefault();closeDialog(dialog);return;}
      if (e.key === 'Tab') {
        const items = [...dialog.querySelectorAll(focusable)].filter(visible);
        const first = items[0] || dialog, last = items.at(-1) || dialog;
        if (!items.length || (e.shiftKey && (target === first || target === dialog)) || (!e.shiftKey && (target === last || target === dialog))) {
          e.preventDefault();(e.shiftKey ? last : first).focus();
        }
      }
      return;
    }
    if (e.key === 'Escape') {
      if (mobile.matches && sidebar.classList.contains('open')) {e.preventDefault();window.toggleSidebar();}
      else if (!tools.hidden && tools.contains(target)) {e.preventDefault();window.toggleToolsPanel();}
      return;
    }
    const radio = target.closest('.tier-btn[role="radio"]');
    if (radio && ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(e.key)) {
      e.preventDefault();
      const buttons = [...radio.parentElement.querySelectorAll('[role="radio"]')];
      let index = buttons.indexOf(radio);
      if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = buttons.length-1;
      else index = (index + (['ArrowRight','ArrowDown'].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index].click();buttons[index].focus();return;
    }
    const custom = target.closest('[role="button"]:not(button):not(a)');
    if (custom && ['Enter',' '].includes(e.key)) {
      e.preventDefault();if (custom.getAttribute('aria-disabled') !== 'true') custom.click();return;
    }
    if (target.closest('input,textarea,select,button,a,[role="button"],[role="radio"],[contenteditable]:not([contenteditable="false"])')) return;
    // Single-character shortcuts apply only while the course content has focus.
    // This leaves speech input and browser shortcuts outside the component alone.
    if (!main.contains(target)) return;
    const actions = {ArrowRight:nextSlide,' ':nextSlide,ArrowLeft:prevSlide,Backspace:prevSlide,t:toggleToolsPanel,T:toggleToolsPanel,g:toggleGlossary,G:toggleGlossary,'?':toggleKeyboardHelp};
    if (actions[e.key] && !(e.key === ' ' && e.shiftKey)) {e.preventDefault();actions[e.key]();}
    else {
      // French uses a different module sequence; navigate by source order, not ID arithmetic.
      const index = modules.findIndex(module => module.id === currentModule);
      if (['ArrowDown','n','N'].includes(e.key) && index >= 0 && index < modules.length-1) {e.preventDefault();goToModule(modules[index+1].id);}
      else if (['ArrowUp','p','P'].includes(e.key) && index > 0) {e.preventDefault();goToModule(modules[index-1].id);}
    }
  });
  controls();disclosures();tiers();syncDialogs();syncTools();syncSidebar();
  d.addEventListener('DOMContentLoaded',() => {controls();tiers();syncSidebar();});
}());
