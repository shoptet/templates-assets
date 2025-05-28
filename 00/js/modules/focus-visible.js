// @ts-check

/**
 * Safari-specific patch:
 *
 * In Safari, navigating between radio inputs using arrow keys does not trigger the `:focus-visible` pseudo-class.
 *
 * This script detects when a radio input receives focus as a result of arrow key navigation,
 * and adds a `.focus-visible` class manually to simulate `:focus-visible`.
 */

import { maybe } from '../../../shared/js/typeAssertions.js';

const isInputElement = value => value instanceof HTMLInputElement;

let hadKeyboardEvent = false;

function onKeyDown(e) {
  const input = maybe(e.target, isInputElement);
  if (input && input.type === 'radio') {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      hadKeyboardEvent = true;
    }
  }
}

function onMouseDown(e) {
  const input = maybe(e.target, isInputElement);
  if (input && input.type === 'radio') {
    hadKeyboardEvent = false;
  }
}

function onFocusIn(e) {
  const input = maybe(e.target, isInputElement);
  if (input && input.type === 'radio' && hadKeyboardEvent) {
    input.classList.add('focus-visible');
  }
}

function onFocusOut(e) {
  const input = maybe(e.target, isInputElement);
  if (input && input.type === 'radio') {
    input.classList.remove('focus-visible');
  }
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('focusin', onFocusIn);
document.addEventListener('focusout', onFocusOut);
