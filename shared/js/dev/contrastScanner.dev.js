// @ts-check
import axe from 'axe-core';

/**
 * @typedef {{
 *   selector: string,
 *   contrastRatio?: string,
 * }} ContrastNode
 */

function setupContrastHighlighting() {
  if (document.getElementById('contrast-scanner-styles')) return;

  const style = document.createElement('style');
  style.id = 'contrast-scanner-styles';
  style.textContent = [
    '[data-contrast-violation="true"] {',
    '  outline: 2px solid #ff0000 !important;',
    '  outline-offset: 2px !important; ',
    '}',
    '',
    '[data-contrast-violation="true"]::before {',
    '  content: attr(data-contrast-violation-label);',
    '  position: absolute;',
    '  top: -16px;',
    '  left: 0;',
    '  background: #ff0000;',
    '  color: #ffffff;',
    '  font: 10px sans-serif;',
    '  padding: 2px 4px;',
    '  z-index: 1000;',
    '  white-space: nowrap;',
    '}',
  ].join('\n');
  document.head.appendChild(style);
}

function clearLowContrastMarks() {
  document.querySelectorAll('[data-contrast-violation="true"]').forEach(el => {
    if (!el || !(el instanceof HTMLElement) || !el.dataset) return;
    delete el.dataset.contrastViolation;
    delete el.dataset.contrastViolationLabel;
  });
}

/**
 * @param {import('axe-core').AxeResults | null | undefined} results
 * @returns {ContrastNode[]}
 */
function extractColorContrastNodes(results) {
  if (!results || !results.violations) return [];

  const violation = results.violations.find(v => v && v.id === 'color-contrast') || null;
  if (!violation || !violation.nodes) return [];

  const bySelector = Object.create(null);
  violation.nodes.forEach(node => {
    const selector = node && node.target && node.target[0] ? String(node.target[0]) : '';
    if (!selector) return;

    const ratioRaw = node && node.any && node.any[0] && node.any[0].data ? node.any[0].data.contrastRatio : undefined;
    const ratio = ratioRaw === undefined ? undefined : String(ratioRaw);
    bySelector[selector] = { selector: selector, contrastRatio: ratio };
  });

  return Object.values(bySelector);
}

/**
 * @param {ContrastNode[]} nodes
 * @returns {void}
 */
function applyMarks(nodes) {
  setupContrastHighlighting();

  nodes.forEach(node => {
    const selector = node && node.selector ? node.selector : '';
    if (!selector) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;

      el.dataset.contrastViolation = 'true';
      el.dataset.contrastViolationLabel = node.contrastRatio ? node.contrastRatio : 'contrast';

      const computed = window.getComputedStyle(el);
      if (computed.position === 'static') {
        el.style.position = 'relative';
      }
    });
  });
}

let contrastScanning = false;

/** @returns {Promise<void>} */
async function runContrastScan() {
  if (contrastScanning) return;
  contrastScanning = true;

  try {
    /** @type {import('axe-core').RunOptions} */
    const runOptions = {
      runOnly: {
        type: 'rule',
        values: ['color-contrast'],
      },
    };
    const results = await axe.run(document, runOptions);
    const nodes = extractColorContrastNodes(results);
    clearLowContrastMarks();
    applyMarks(nodes);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[contrast-scanner] scan failed', e);
  } finally {
    contrastScanning = false;
  }
}

document.addEventListener('ShoptetDOMContentLoaded', runContrastScan);
document.addEventListener('DOMContentLoaded', runContrastScan);
