// @ts-check

import { ensure, ensureEvery, maybe } from '../../../shared/js/typeAssertions';

const isHTMLElement = value => value instanceof HTMLElement;

/**
 * Slider options
 * @typedef {Object} SliderOptions
 * @property {boolean} [autoplay] True to automatically slide the slider (default is false).
 * @property {number} [autoplaySpeed] Time between slides in milliseconds (default is 2000).
 * @property {number} [boxShadowOffset] Set the size if the slider has a shadow (default is 0).
 * @property {number} [duration] Duration of the slide animation in milliseconds (default is 200).
 * @property {boolean} [draggable] True to enable dragging the slider (default is true).
 * @property {string} [easing] Easing function to use for the slide animation (default is 'ease-out').
 * @property {string} [frameClassName] Class name for the slider wrapper element (default is 'slider-frame').
 * @property {boolean} [loop] True to infinitely loop the slider (default is false).
 * @property {boolean} [multipleDrag] True to slide multiple slides at once (default is true).
 * @property {boolean} [navigation] True to show navigation buttons (default is false).
 * @property {boolean} [pagination] True to show pagination buttons (default is false).
 * @property {string} [parentClassName] Class name for the parent element (default is 'slider-wrapper').
 * @property {number | Record<number, number>} [perPage] Number of slides to show per page. Can be an object with breakpoints as keys and number of slides as values for responsive design (default is 1).
 * @property {string | HTMLElement} [selector] CSS selector or HTMLElement to use as the slider container (default is '.slider'). If a string is provided, the first matching element will be used.
 * @property {number} [startIndex] Index of the slide to start on (default is 0).
 * @property {number} [threshold] Minimum distance to drag before sliding to the next slide (default is 20).
 * @property {() => void} [onInit] Callback function to call after the slider is initialized.
 * @property {() => void} [onChange] Callback function to call after the slider changes slide.
 */

class Slider {
  /** @param {SliderOptions} options */
  constructor(options) {
    this.autoplayInterval = undefined;
    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: false,
      preventClick: false,
    };
    this.elementWidth = 0;
    this.pagination = document.createElement('div');
    this.perPage = 1;
    this.pointerDown = false;
    this.sliderFrame = document.createElement('div');
    this.config = this.mergeOptions(options);

    this.resolveSlidesNumber();

    this.prevPerPage = this.perPage;

    const el =
      typeof this.config.selector === 'string' ? document.querySelector(this.config.selector) : this.config.selector;
    this.element = ensure(el, isHTMLElement);
    this.parentElement = ensure(this.element.parentNode, isHTMLElement);

    this.parentElement.classList.add(this.config.parentClassName);
    if (this.config.navigation) {
      this.parentElement.classList.add('has-navigation');
    }

    this.setParentElementWidth();

    this.innerElements = Array.from(this.element.children);
    this.currentSlide = this.config.loop
      ? this.config.startIndex % this.innerElements.length
      : Math.max(0, Math.min(this.config.startIndex, this.innerElements.length - this.perPage));

    this.resizeHandler = this.resizeHandler.bind(this);
    this.touchstartHandler = this.touchstartHandler.bind(this);
    this.touchendHandler = this.touchendHandler.bind(this);
    this.touchmoveHandler = this.touchmoveHandler.bind(this);
    this.mousedownHandler = this.mousedownHandler.bind(this);
    this.mouseupHandler = this.mouseupHandler.bind(this);
    this.mouseleaveHandler = this.mouseleaveHandler.bind(this);
    this.mousemoveHandler = this.mousemoveHandler.bind(this);
    this.clickHandler = this.clickHandler.bind(this);

    this.init();
  }

  /**
   * This function resolves the number of slides to show per page.
   */
  resolveSlidesNumber() {
    if (typeof this.config.perPage === 'number') {
      this.perPage = this.config.perPage;
    } else if (typeof this.config.perPage === 'object') {
      for (const viewport in this.config.perPage) {
        if (shoptet.layout.detectResolution(Number(viewport))) {
          this.perPage = this.config.perPage[viewport];
        }
      }
    }
  }

  /**
   * This function attaches all events to the main element.
   */
  attachEvents() {
    window.addEventListener('resizeEnd', this.resizeHandler);

    if (this.config.draggable) {
      this.pointerDown = false;
      this.drag = {
        startX: 0,
        endX: 0,
        startY: 0,
        letItGo: false,
        preventClick: false,
      };

      this.element.addEventListener('touchstart', this.touchstartHandler);
      this.element.addEventListener('touchend', this.touchendHandler);
      this.element.addEventListener('touchmove', this.touchmoveHandler);
      this.element.addEventListener('mousedown', this.mousedownHandler);
      this.element.addEventListener('mouseup', this.mouseupHandler);
      this.element.addEventListener('mouseleave', this.mouseleaveHandler);
      this.element.addEventListener('mousemove', this.mousemoveHandler);
      this.element.addEventListener('click', this.clickHandler);
    }
  }

  /**
   * This function detaches all events from the main element.
   */
  detachEvents() {
    window.removeEventListener('resizeEnd', this.resizeHandler);
    this.element.removeEventListener('touchstart', this.touchstartHandler);
    this.element.removeEventListener('touchend', this.touchendHandler);
    this.element.removeEventListener('touchmove', this.touchmoveHandler);
    this.element.removeEventListener('mousedown', this.mousedownHandler);
    this.element.removeEventListener('mouseup', this.mouseupHandler);
    this.element.removeEventListener('mouseleave', this.mouseleaveHandler);
    this.element.removeEventListener('mousemove', this.mousemoveHandler);
    this.element.removeEventListener('click', this.clickHandler);
  }

  /**
   * This function initializes the slider.
   */
  init() {
    this.element.style.overflow = 'hidden';
    this.parentElement.style.overflow = 'hidden';

    this.attachEvents();
    this.buildSliderFrame();
    this.autoplayInit();
    this.config.onInit?.();
  }

  /**
   * This function disables the transition on the slider frame.
   */
  disableTransition() {
    this.sliderFrame.style.transition = `all 0ms ${this.config.easing}`;
  }

  /**
   * This function enables the transition on the slider frame.
   */
  enableTransition() {
    this.sliderFrame.style.transition = `all ${this.config.duration}ms ${this.config.easing}`;
  }

  /**
   * This function creates a new slider frame item from the given element and returns it.
   * @param {Node} element
   * @returns {HTMLElement}
   */
  buildSliderFrameItem(element) {
    const elementContainer = ensure(element, isHTMLElement);
    elementContainer.style.width = `${this.elementWidth / this.perPage}px`;
    return elementContainer;
  }

  /**
   * This function slides the slider to the current slide.
   * @param {boolean} [enableTransition]
   */
  slideToCurrent(enableTransition) {
    const currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
    const offset = -1 * currentSlide * (this.elementWidth / this.perPage);

    if (enableTransition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.enableTransition();
          this.sliderFrame.style.transform = `translate3d(${offset}px, 0, 0)`;
        });
      });
    } else {
      this.sliderFrame.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    if (this.config.pagination) {
      let newPossition;
      if (this.currentSlide < 0) {
        newPossition = this.innerElements.length + this.currentSlide;
      } else {
        newPossition = this.currentSlide;
      }
      this.pagination.querySelector('.active')?.classList.remove('active');
      this.pagination.children[newPossition].classList.add('active');
    }
  }

  /**
   * This function slides the slider to the given index.
   * @param {number} index
   * @param {()=>void} [callback]
   * @returns
   */
  goTo(index, callback) {
    if (this.innerElements.length <= this.perPage) {
      return;
    }

    const beforeChange = this.currentSlide;
    this.currentSlide = this.config.loop
      ? index % this.innerElements.length
      : Math.min(Math.max(index, 0), this.innerElements.length - this.perPage);

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent();

      if (typeof this.config.onChange === 'function') {
        this.config.onChange();
      }
      if (typeof callback === 'function') {
        callback.call(this);
      }
    }
  }

  /**
   * This function slides the slider to the previous slide.
   * @param {number} [howManySlides]
   * @param {()=>void} [callback]
   * @returns
   */
  prev(howManySlides = 1, callback) {
    if (this.innerElements.length <= this.perPage) {
      return;
    }

    const beforeChange = this.currentSlide;
    if (this.config.loop) {
      const isNewIndexClone = this.currentSlide - howManySlides < 0;

      if (isNewIndexClone) {
        this.disableTransition();

        const mirrorSlideIndex = this.currentSlide + this.innerElements.length;
        const mirrorSlideIndexOffset = this.perPage;
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
        const offset = -1 * moveTo * (this.elementWidth / this.perPage);
        const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

        this.sliderFrame.style.transform = `translate3d(${offset + dragDistance}px, 0, 0)`;
        this.currentSlide = mirrorSlideIndex - howManySlides;
      } else {
        this.currentSlide = this.currentSlide - howManySlides;
      }
    } else {
      this.currentSlide = Math.max(this.currentSlide - howManySlides, 0);
    }

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent(this.config.loop);

      if (typeof this.config.onChange === 'function') {
        this.config.onChange();
      }
      if (typeof callback === 'function') {
        callback.call(this);
      }
    }
  }

  /**
   * This function slides the slider to the next slide.
   * @param {number} [howManySlides]
   * @param {()=>void} [callback]
   * @returns
   */
  next(howManySlides = 1, callback) {
    if (this.innerElements.length <= this.perPage) {
      return;
    }

    const beforeChange = this.currentSlide;
    if (this.config.loop) {
      const isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - this.perPage;

      if (isNewIndexClone) {
        this.disableTransition();

        const mirrorSlideIndex = this.currentSlide - this.innerElements.length;
        const mirrorSlideIndexOffset = this.perPage;
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
        const offset = -1 * moveTo * (this.elementWidth / this.perPage);
        const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

        this.sliderFrame.style.transform = `translate3d(${offset + dragDistance}px, 0, 0)`;
        this.currentSlide = mirrorSlideIndex + howManySlides;
      } else {
        this.currentSlide = this.currentSlide + howManySlides;
      }
    } else {
      this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.perPage);
    }

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent(this.config.loop);

      if (typeof this.config.onChange === 'function') {
        this.config.onChange();
      }
      if (typeof callback === 'function') {
        callback.call(this);
      }
    }
  }

  /**
   * This function builds the slider frame.
   */
  buildSliderFrame() {
    this.sliderFrame = document.createElement('div');
    this.sliderFrame.className = this.config.frameClassName;

    if (this.innerElements.length > this.perPage) {
      const widthItem = this.elementWidth / this.perPage;
      const itemsToBuild = this.config.loop ? this.innerElements.length + 2 * this.perPage : this.innerElements.length;

      this.sliderFrame.style.width = `${widthItem * itemsToBuild}px`;
      this.enableTransition();

      if (this.config.draggable) {
        this.element.style.cursor = 'grab';
      }

      const docFragment = document.createDocumentFragment();
      if (this.config.loop) {
        for (let i = this.innerElements.length - this.perPage; i < this.innerElements.length; i++) {
          const element = this.buildSliderFrameItem(this.innerElements[i].cloneNode(true));
          docFragment.appendChild(element);
        }
      }
      for (let i = 0; i < this.innerElements.length; i++) {
        const element = this.buildSliderFrameItem(this.innerElements[i]);
        docFragment.appendChild(element);
      }
      if (this.config.loop) {
        for (let i = 0; i < this.perPage; i++) {
          const element = this.buildSliderFrameItem(this.innerElements[i].cloneNode(true));
          docFragment.appendChild(element);
        }
      }

      this.sliderFrame.appendChild(docFragment);
    } else {
      const docFragment = document.createDocumentFragment();
      for (let i = 0; i < this.innerElements.length; i++) {
        const element = this.buildSliderFrameItem(this.innerElements[i]);
        docFragment.appendChild(element);
      }

      this.sliderFrame.appendChild(docFragment);
    }

    this.element.innerHTML = '';
    this.element.appendChild(this.sliderFrame);
    this.element.classList.remove(this.config.frameClassName);
    this.parentElement
      .querySelectorAll('.product-slider-pagination, .product-slider-navigation')
      .forEach(el => el.remove());

    if (this.innerElements.length > this.perPage) {
      if (this.config.pagination) {
        this.pagination = document.createElement('div');
        this.pagination.className = 'product-slider-pagination';
        this.parentElement.getElementsByClassName(this.pagination.className)[0]?.remove();

        for (let i = 0; i < this.innerElements.length; i++) {
          const paginationBtn = document.createElement('button');
          paginationBtn.className = `pagination-button pagination-button-${i}`;
          paginationBtn.textContent = String(i);
          paginationBtn.addEventListener('click', () => this.goTo(i));
          this.pagination.appendChild(paginationBtn);
        }
        this.parentElement.appendChild(this.pagination);
      }

      if (this.config.navigation) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'product-slider-navigation navigation-prev';
        prevBtn.textContent = 'prev';
        prevBtn.addEventListener('click', () => {
          return this.prev();
        });
        this.parentElement.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'product-slider-navigation navigation-next';
        nextBtn.textContent = 'next';
        nextBtn.addEventListener('click', () => {
          return this.next();
        });
        this.parentElement.appendChild(nextBtn);
      }

      this.slideToCurrent();
    }
  }

  /**
   * This function sets the width of the parent element.
   */
  setParentElementWidth() {
    const parentStyles = getComputedStyle(this.parentElement);
    const parentElementComputedWidth =
      parseInt(parentStyles.getPropertyValue('width')) -
      parseInt(parentStyles.getPropertyValue('padding-left')) -
      parseInt(parentStyles.getPropertyValue('padding-right'));

    this.elementWidth = parentElementComputedWidth - (parentElementComputedWidth % this.perPage);
    this.element.style.width = `${this.elementWidth + this.config.boxShadowOffset}px`;
  }

  /**
   * This function stops the autoplay.
   */
  autoplayStop() {
    clearInterval(Number(this.autoplayInterval));
  }

  /**
   * This function starts the autoplay.
   */
  autoplayStart() {
    this.autoplayStop();
    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.config.autoplaySpeed);
  }

  /**
   * This function initializes the autoplay and attaches the necessary events.
   */
  autoplayInit() {
    if (!this.config.autoplay) {
      return;
    }

    this.parentElement.addEventListener('focusin', () => {
      this.autoplayStop();
    });
    this.parentElement.addEventListener('focusout', () => {
      this.autoplayStart();
    });
    this.parentElement.addEventListener('mouseover', () => {
      this.autoplayStop();
    });
    this.parentElement.addEventListener('mouseout', () => {
      this.autoplayStart();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.autoplayStop();
      } else {
        this.autoplayStart();
      }
    });
    this.autoplayStart();
  }

  /**
   * This function updates the slider after dragging.
   */
  updateAfterDrag() {
    if (this.innerElements.length > this.perPage) {
      const movement = this.drag.endX - this.drag.startX;
      const movementDistance = Math.abs(movement);
      const howManySliderToSlide = this.config.multipleDrag
        ? Math.ceil(movementDistance / (this.elementWidth / this.perPage))
        : 1;

      const slideToNegativeClone = movement > 0 && this.currentSlide - howManySliderToSlide < 0;
      const slideToPositiveClone =
        movement < 0 && this.currentSlide + howManySliderToSlide > this.innerElements.length - this.perPage;

      if (movement > 0 && movementDistance > this.config.threshold && this.innerElements.length > this.perPage) {
        this.prev(howManySliderToSlide);
      } else if (movement < 0 && movementDistance > this.config.threshold && this.innerElements.length > this.perPage) {
        this.next(howManySliderToSlide);
      }
      this.slideToCurrent(slideToNegativeClone || slideToPositiveClone);
    }
  }

  /**
   * This function clears the drag object to its initial state.
   */
  clearDrag() {
    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: false,
      preventClick: false,
    };
  }

  /**
   * This function removes the item from the slider at the given index.
   * @param {number} index - Item index to remove.
   * @param {()=>void} [callback] - Optional callback to call after remove.
   */
  remove(index, callback) {
    if (index < 0 || index >= this.innerElements.length) {
      throw new Error("Item to remove doesn't exist");
    }

    const lowerIndex = index < this.currentSlide;
    const lastItem = this.currentSlide + this.perPage - 1 === index;

    if (lowerIndex || lastItem) {
      this.currentSlide--;
    }

    this.innerElements.splice(index, 1);

    this.buildSliderFrame();

    if (typeof callback === 'function') {
      callback.call(this);
    }
  }

  /**
   * This function inserts the item to the slider at the given index.
   * @param {HTMLElement} item - Item to insert.
   * @param {number} index - Index of new new item insertion.
   * @param {()=>void} [callback] - Optional callback to call after insert.
   */
  insert(item, index, callback) {
    if (index < 0 || index > this.innerElements.length + 1) {
      throw new Error('Unable to inset it at this index');
    }
    if (this.innerElements.includes(item)) {
      throw new Error('The same item in a carousel? Really? Nope');
    }

    const shouldItShift = index <= this.currentSlide && this.currentSlide > 0 && this.innerElements.length;
    this.currentSlide = shouldItShift ? this.currentSlide + 1 : this.currentSlide;

    this.innerElements.splice(index, 0, item);

    this.buildSliderFrame();

    if (typeof callback === 'function') {
      callback.call(this);
    }
  }

  /**
   * This function prepends the item to the slider.
   * @param {HTMLElement} item - Item to prepend.
   * @param {()=>void} [callback] - Optional callback to call after prepend.
   */
  prepend(item, callback) {
    this.insert(item, 0);
    if (typeof callback === 'function') {
      callback.call(this);
    }
  }

  /**
   * This function appends the item to the slider.
   * @param {HTMLElement} item - Item to append.
   * @param {()=>void} [callback] - Optional callback to call after append.
   */
  append(item, callback) {
    this.insert(item, this.innerElements.length + 1);
    if (typeof callback === 'function') {
      callback.call(this);
    }
  }

  /**
   * This function destroys the slider and optionally restores the initial markup.
   * @param {boolean} [restoreMarkup] - Determinants about restoring an initial markup.
   * @param {()=>void} [callback] - Optional callback function.
   */
  destroy(restoreMarkup = false, callback) {
    this.detachEvents();
    this.element.style.cursor = 'auto';

    if (restoreMarkup) {
      const slides = document.createDocumentFragment();
      this.innerElements.forEach(element => {
        slides.appendChild(element);
      });
      this.element.innerHTML = '';
      this.element.appendChild(slides);
      this.element.removeAttribute('style');
    }

    if (typeof callback === 'function') {
      callback.call(this);
    }
  }

  /**
   * This function merges the default settings with the given options.
   * @param {SliderOptions} options
   */
  mergeOptions(options) {
    return {
      autoplay: false,
      autoplaySpeed: 2000,
      boxShadowOffset: 0,
      draggable: true,
      duration: 200,
      easing: 'ease-out',
      frameClassName: 'slider-frame',
      loop: false,
      multipleDrag: true,
      navigation: false,
      pagination: false,
      parentClassName: 'slider-wrapper',
      perPage: 1,
      selector: '.slider',
      startIndex: 0,
      threshold: 20,
      onInit: undefined,
      onChange: undefined,
      ...options,
    };
  }

  /**
   * This function handles the resize event.
   */
  resizeHandler() {
    this.resolveSlidesNumber();

    if (this.prevPerPage === this.perPage) {
      return;
    }

    this.prevPerPage = this.perPage;

    if (this.currentSlide + this.perPage > this.innerElements.length) {
      this.currentSlide = this.innerElements.length <= this.perPage ? 0 : this.innerElements.length - this.perPage;
    }

    this.setParentElementWidth();
    this.buildSliderFrame();
  }

  /**
   * This function handles the touchstart event.
   * @param {TouchEvent} event
   */
  touchstartHandler(event) {
    const targetEl = maybe(event.target, isHTMLElement);
    if (targetEl && ['TEXTAREA', 'OPTION', 'INPUT', 'SELECT'].includes(targetEl.nodeName)) {
      return;
    }

    event.stopPropagation();
    this.pointerDown = true;
    this.drag.startX = event.touches[0].pageX;
    this.drag.startY = event.touches[0].pageY;
  }

  /**
   * This function handles the touchend event.
   * @param {TouchEvent} event
   */
  touchendHandler(event) {
    event.stopPropagation();
    this.pointerDown = false;
    this.enableTransition();
    if (this.drag.endX) {
      this.updateAfterDrag();
    }
    this.clearDrag();
  }

  /**
   * This function handles the touchmove event.
   * @param {TouchEvent} event
   */
  touchmoveHandler(event) {
    if (this.innerElements.length <= this.perPage) {
      return;
    }
    event.stopPropagation();
    if (!this.drag.letItGo) {
      this.drag.letItGo =
        Math.abs(this.drag.startY - event.touches[0].pageY) < Math.abs(this.drag.startX - event.touches[0].pageX);
    }

    if (!this.pointerDown || !this.drag.letItGo) {
      return;
    }
    event.preventDefault();
    this.drag.endX = event.touches[0].pageX;
    this.sliderFrame.style.transition = `all 0ms ${this.config.easing}`;

    const currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
    const currentOffset = currentSlide * (this.elementWidth / this.perPage);
    const dragOffset = this.drag.endX - this.drag.startX;
    const offset = currentOffset - dragOffset;
    this.sliderFrame.style.transform = `translate3d(${-1 * offset}px, 0, 0)`;
  }

  /**
   * This function handles the mousedown event.
   * @param {MouseEvent} event
   */
  mousedownHandler(event) {
    const targetEl = maybe(event.target, isHTMLElement);
    if (targetEl && ['TEXTAREA', 'OPTION', 'INPUT', 'SELECT'].includes(targetEl.nodeName)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.pointerDown = true;
    this.drag.startX = event.pageX;
  }

  /**
   * This function handles the mouseup event.
   * @param {MouseEvent} event
   */
  mouseupHandler(event) {
    event.stopPropagation();
    this.pointerDown = false;
    this.element.style.cursor = 'grab';
    this.enableTransition();
    if (this.drag.endX) {
      this.updateAfterDrag();
    }
    this.clearDrag();
  }

  /**
   * This function handles the mousemove event.
   * @param {MouseEvent} event
   */
  mousemoveHandler(event) {
    if (this.innerElements.length <= this.perPage) {
      return;
    }
    event.preventDefault();
    if (!this.pointerDown) {
      return;
    }

    this.drag.preventClick = true;
    this.drag.endX = event.pageX;
    this.element.style.cursor = 'grabbing';
    this.sliderFrame.style.transition = `all 0ms ${this.config.easing}`;

    const currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
    const currentOffset = currentSlide * (this.elementWidth / this.perPage);
    const dragOffset = this.drag.endX - this.drag.startX;
    const offset = currentOffset - dragOffset;
    this.sliderFrame.style.transform = `translate3d(${-1 * offset}px, 0, 0)`;
  }

  /**
   * This function handles the mouseleave event.
   * @param {MouseEvent} event
   */
  mouseleaveHandler(event) {
    if (!this.pointerDown) {
      return;
    }

    this.pointerDown = false;
    this.element.style.cursor = 'grab';
    this.drag.endX = event.pageX;
    this.drag.preventClick = false;
    this.enableTransition();
    this.updateAfterDrag();
    this.clearDrag();
  }

  /**
   * This function handles the click event.
   * @param {MouseEvent} event
   */
  clickHandler(event) {
    if (this.drag.preventClick) {
      event.preventDefault();
    }
    this.drag.preventClick = false;
  }
}

(function (shoptet) {
  /** @type {Array<Slider>} */
  const activeSliders = [];

  /**
   * This function initializes the new slider with the given options.
   * @param {SliderOptions} options
   */
  function runSlider(options) {
    activeSliders.push(new Slider(options));
  }

  /**
   * This function initializes the product slider on the given selector.
   * @param {string} selector CSS selector to run product slider on
   */
  function runProductSlider(selector) {
    if (!shoptet.abilities.feature.product_slider) {
      return;
    }
    const elements = ensureEvery(Array.from(document.querySelectorAll(selector)), isHTMLElement);
    elements.forEach(element => {
      const itemsPerPage = Number(element.dataset.columns ?? 1);
      const itemsPerPageMobile = Number(element.dataset.columnsMobile ?? 1);

      runSlider({
        autoplay: shoptet.abilities.config.product_slider.autoplay,
        autoplaySpeed: shoptet.abilities.config.product_slider.autoplay_speed,
        boxShadowOffset: shoptet.abilities.config.product_slider.shadow_size,
        duration: 200,
        easing: 'ease-out',
        frameClassName: 'products-block',
        loop: shoptet.abilities.config.product_slider.loop,
        navigation: shoptet.abilities.config.product_slider.navigation,
        pagination: shoptet.abilities.config.product_slider.pagination,
        parentClassName: 'product-slider-holder',
        perPage: {
          319: itemsPerPageMobile,
          767: itemsPerPage - 2 > 0 ? itemsPerPage - 2 : 1,
          991: itemsPerPage - 1 > 0 ? itemsPerPage - 1 : 1,
          1199: itemsPerPage,
        },
        selector: element,
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    runProductSlider('.product-slider');
  });

  document.addEventListener('ShoptetModalResizeDone', () => {
    activeSliders.forEach(slider => {
      if (slider.element.closest('#colorbox')) {
        slider.resizeHandler();
      }
    });
  });

  shoptet.productSlider = {
    runProductSlider: element => {
      shoptet.dev.deprecated(
        '2025-12-31',
        'shoptet.productSlider.runProductSlider()',
        'shoptet.slider.runProductSlider()'
      );
      runProductSlider(element);
    },
  };

  shoptet.abilities.config = {
    ...shoptet.abilities.config,
    get slider_shadow_size() {
      shoptet.dev.deprecated(
        '2025-12-31',
        'shoptet.abilities.config.slider_shadow_size',
        'shoptet.abilities.config.product_slider.shadow_size'
      );
      return shoptet.abilities.config.product_slider.shadow_size;
    },
  };

  shoptet.slider = shoptet.slider || {};
  shoptet.slider.activeSliders = activeSliders;
  shoptet.scripts.libs.slider.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'slider');
  });
})(shoptet);
