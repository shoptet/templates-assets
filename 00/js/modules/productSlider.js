(function (shoptet) {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    /**
     * Class representing a ProductSlider.
     */
    var ProductSlider = function () {

        function ProductSlider(options) {
            var _this = this;

            _classCallCheck(this, ProductSlider);

            // Merge defaults with user's settings
            this.config = ProductSlider.mergeSettings(options);

            // Resolve selector's type
            this.selector = typeof this.config.selector === 'string'
                ? document.querySelector(this.config.selector)
                : this.config.selector;

            // Early throw if selector doesn't exists
            if (this.selector === null) {
                throw new Error('Something wrong with your selector');
            }

            // update perPage number dependable of user value
            this.resolveSlidesNumber();

            // Create holder with space for navigation
            this.selector.parentNode.classList.add(this.config.parentClassName);
            if (this.config.navigation) {
                this.selector.parentNode.classList.add('has-navigation');
            }
            this.setSelectorWidth();

            this.innerElements = [].slice.call(this.selector.children);
            this.currentSlide = this.config.loop
                ? this.config.startIndex % this.innerElements.length
                : Math.max(0, Math.min(this.config.startIndex, this.innerElements.length - this.perPage));
            this.transformProperty = ProductSlider.webkitOrNot();

            // Bind all event handlers for referencability
            ['resizeHandler',
                'touchstartHandler',
                'touchendHandler',
                'touchmoveHandler',
                'mousedownHandler',
                'mouseupHandler',
                'mouseleaveHandler',
                'mousemoveHandler',
                'clickHandler'].forEach(function (method) {
                    _this[method] = _this[method].bind(_this);
                });

            // Build markup and apply required styling to elements
            this.init();
        }

        /**
         * Overrides default settings with custom ones.
         * @param {Object} options - Optional settings object.
         * @returns {Object} - Custom ProductSlider settings.
         */

        _createClass(ProductSlider, [{
            key: 'attachEvents',

            /**
             * Attaches listeners to required events.
             */
            value: function attachEvents() {
                // Resize element on window resize
                window.addEventListener('resize', this.resizeHandler);

                // If element is draggable / swipable, add event handlers
                if (this.config.draggable) {
                    // Keep track pointer hold and dragging distance
                    this.pointerDown = false;
                    this.drag = {
                        startX: 0,
                        endX: 0,
                        startY: 0,
                        letItGo: null,
                        preventClick: false
                    };

                    // Touch events
                    this.selector.addEventListener('touchstart', this.touchstartHandler);
                    this.selector.addEventListener('touchend', this.touchendHandler);
                    this.selector.addEventListener('touchmove', this.touchmoveHandler);

                    // Mouse events
                    this.selector.addEventListener('mousedown', this.mousedownHandler);
                    this.selector.addEventListener('mouseup', this.mouseupHandler);
                    this.selector.addEventListener('mouseleave', this.mouseleaveHandler);
                    this.selector.addEventListener('mousemove', this.mousemoveHandler);

                    // Click
                    this.selector.addEventListener('click', this.clickHandler);
                }
            }
        }, {
            /**
            * Detaches listeners from required events.
            */
            key: 'detachEvents',
            value: function detachEvents() {
                window.removeEventListener('resize', this.resizeHandler);
                this.selector.removeEventListener('touchstart', this.touchstartHandler);
                this.selector.removeEventListener('touchend', this.touchendHandler);
                this.selector.removeEventListener('touchmove', this.touchmoveHandler);
                this.selector.removeEventListener('mousedown', this.mousedownHandler);
                this.selector.removeEventListener('mouseup', this.mouseupHandler);
                this.selector.removeEventListener('mouseleave', this.mouseleaveHandler);
                this.selector.removeEventListener('mousemove', this.mousemoveHandler);
                this.selector.removeEventListener('click', this.clickHandler);
            }
        }, {
            /**
            * Builds the markup and attaches listeners to required events.
            */
            key: 'init',
            value: function init() {
                this.attachEvents();

                // hide everything out of selector's boundaries
                this.selector.style.overflow = 'hidden';

                // rtl or ltr
                this.selector.style.direction = this.config.rtl ? 'rtl' : 'ltr';

                // build a frame and slide to a currentSlide
                this.buildSliderFrame();

                this.config.onInit.call(this);
            }
        }, {
            /**
            * Gets selector parent node and set width acc to its properties
            * Counting in spaces left by padding for navigation buttons
            */
            key: 'setSelectorWidth',
            value: function setSelectorWidth() {
                // substract navigation space from holder elem width
                var selectorStyles = getComputedStyle(this.selector.parentNode);
                var selectorComputedWidth =
                    parseInt(selectorStyles.getPropertyValue('width'))
                    - parseInt(selectorStyles.getPropertyValue('padding-left'))
                    - parseInt(selectorStyles.getPropertyValue('padding-right'));

                // update selector width acc to holder width
                this.selectorWidth = selectorComputedWidth - selectorComputedWidth % this.perPage;
                this.selector.style.width = (this.selectorWidth + this.config.boxShadowOffset) + 'px';
            }
        }, {
            /**
            * Build a sliderFrame and slide to a current item.
            */
            key: 'buildSliderFrame',
            value: function buildSliderFrame() {
                var _this2 = this;

                this.sliderFrame = document.createElement('div');
                this.sliderFrame.className = this.config.frameClassName;

                if (this.innerElements.length > this.perPage) {

                    var widthItem = this.selectorWidth / this.perPage;
                    var itemsToBuild = this.config.loop
                        ? this.innerElements.length + 2 * this.perPage
                        : this.innerElements.length;

                    this.sliderFrame.style.width = widthItem * itemsToBuild + 'px';
                    this.enableTransition();

                    if (this.config.draggable) {
                        this.selector.style.cursor = '-webkit-grab';
                    }

                    // Create a document fragment to put slides into it
                    var docFragment = document.createDocumentFragment();

                    // Loop through the slides, add styling and add them to document fragment
                    if (this.config.loop) {
                        for (var i = this.innerElements.length - this.perPage; i < this.innerElements.length; i++) {
                            var element = this.buildSliderFrameItem(this.innerElements[i].cloneNode(true));
                            docFragment.appendChild(element);
                        }
                    }
                    for (var _i = 0; _i < this.innerElements.length; _i++) {
                        var _element = this.buildSliderFrameItem(this.innerElements[_i]);
                        docFragment.appendChild(_element);
                    }
                    if (this.config.loop) {
                        for (var _i2 = 0; _i2 < this.perPage; _i2++) {
                            var _element2 = this.buildSliderFrameItem(this.innerElements[_i2].cloneNode(true));
                            docFragment.appendChild(_element2);
                        }
                    }

                    // Add fragment to the frame
                    this.sliderFrame.appendChild(docFragment);
                } else {
                    var _docFragment = document.createDocumentFragment();

                    for (var _i3 = 0; _i3 < this.innerElements.length; _i3++) {
                        var _element3 = this.buildSliderFrameItem(this.innerElements[_i3]);
                        _docFragment.appendChild(_element3);
                    }

                    this.sliderFrame.appendChild(_docFragment);
                }

                // Clear selector (just in case something is there) and insert a frame
                this.selector.innerHTML = '';
                this.selector.appendChild(this.sliderFrame);
                this.selector.classList.remove(this.config.frameClassName);

                if (this.innerElements.length > this.perPage) {
                    if (this.config.pagination) {
                        this.pagination = document.createElement('div');
                        this.pagination.className = 'product-slider-pagination'; 
                        
                        var currentPagination = this.selector.parentNode
                            .getElementsByClassName(this.pagination.className);
                        if (currentPagination[0]) {
                            currentPagination[0].remove();
                        }

                        var _loop = function _loop(_i4) {
                            var paginationBtn = document.createElement('button');
                            paginationBtn.className = 'pagination-button pagination-button-' + _i4;
                            paginationBtn.textContent = _i4;
                            paginationBtn.addEventListener('click', function () {
                                return _this2.goTo(_i4);
                            });
                            _this2.pagination.appendChild(paginationBtn);
                        };

                        for (var _i4 = 0; _i4 < this.innerElements.length; _i4++) {
                            _loop(_i4);
                        }
                        this.selector.parentNode.appendChild(this.pagination);
                    }

                    if (this.config.navigation) {
                        var prevBtn = document.createElement('button');
                        prevBtn.className = 'product-slider-navigation navigation-prev';
                        prevBtn.textContent = 'prev';

                        var currentPrevBtn = this.selector.parentNode
                            .getElementsByClassName(prevBtn.className); 
                        if (currentPrevBtn[0]) {
                            currentPrevBtn[0].remove();
                        }

                        prevBtn.addEventListener('click', function () {
                            return _this2.prev();
                        });
                        this.selector.parentNode.appendChild(prevBtn);

                        var nextBtn = document.createElement('button');
                        nextBtn.className = 'product-slider-navigation navigation-next';
                        nextBtn.textContent = 'next';

                        var currentNextBtn = this.selector.parentNode
                            .getElementsByClassName(nextBtn.className); 
                        if (currentNextBtn[0]) {
                            currentNextBtn[0].remove();
                        }

                        nextBtn.addEventListener('click', function () {
                            return _this2.next();
                        });
                        this.selector.parentNode.appendChild(nextBtn);
                    }

                    // Go to currently active slide after initial build
                    this.slideToCurrent();
                }
            }
        }, {
            key: 'buildSliderFrameItem',
            value: function buildSliderFrameItem(elm) {
                var elementContainer = elm;
                elementContainer.style.cssFloat = this.config.rtl ? 'right' : 'left';
                elementContainer.style.float = this.config.rtl ? 'right' : 'left';
                elementContainer.style.width = this.selectorWidth / this.perPage + 'px';
                return elementContainer;
            }
        }, {
            /**
            * Determinates slides number accordingly to clients viewport.
            */
            key: 'resolveSlidesNumber',
            value: function resolveSlidesNumber() {
                if (typeof this.config.perPage === 'number') {
                    this.perPage = this.config.perPage;
                } else if (_typeof(this.config.perPage) === 'object') {
                    this.perPage = 1;
                    for (var viewport in this.config.perPage) {
                        if (window.innerWidth >= viewport) {
                            this.perPage = this.config.perPage[viewport];
                        }
                    }
                }
            }
        }, {
            /**
            * Go to previous slide.
            * @param {number} [howManySlides=1] - How many items to slide backward.
            * @param {function} callback - Optional callback function.
            */
            key: 'prev',
            value: function prev() {
                var howManySlides = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
                var callback = arguments[1];

                // early return when there is nothing to slide
                if (this.innerElements.length <= this.perPage) {
                    return;
                }

                var beforeChange = this.currentSlide;

                if (this.config.loop) {
                    var isNewIndexClone = this.currentSlide - howManySlides < 0;
                    if (isNewIndexClone) {
                        this.disableTransition();

                        var mirrorSlideIndex = this.currentSlide + this.innerElements.length;
                        var mirrorSlideIndexOffset = this.perPage;
                        var moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                        var offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.perPage);
                        var dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

                        this.sliderFrame.style[this.transformProperty] =
                            'translate3d(' + (offset + dragDistance) + 'px, 0, 0)';
                        this.currentSlide = mirrorSlideIndex - howManySlides;
                    } else {
                        this.currentSlide = this.currentSlide - howManySlides;
                    }
                } else {
                    this.currentSlide = Math.max(this.currentSlide - howManySlides, 0);
                }

                if (beforeChange !== this.currentSlide) {
                    this.slideToCurrent(this.config.loop);
                    this.config.onChange.call(this);
                    if (callback) {
                        callback.call(this);
                    }
                }
            }
        }, {
            /**
            * Go to next slide.
            * @param {number} [howManySlides=1] - How many items to slide forward.
            * @param {function} callback - Optional callback function.
            */
            key: 'next',
            value: function next() {
                var howManySlides = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
                var callback = arguments[1];

                // early return when there is nothing to slide
                if (this.innerElements.length <= this.perPage) {
                    return;
                }

                var beforeChange = this.currentSlide;

                if (this.config.loop) {
                    var isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - this.perPage;
                    if (isNewIndexClone) {
                        this.disableTransition();

                        var mirrorSlideIndex = this.currentSlide - this.innerElements.length;
                        var mirrorSlideIndexOffset = this.perPage;
                        var moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
                        var offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.perPage);
                        var dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

                        this.sliderFrame.style[this.transformProperty] =
                            'translate3d(' + (offset + dragDistance) + 'px, 0, 0)';
                        this.currentSlide = mirrorSlideIndex + howManySlides;
                    } else {
                        this.currentSlide = this.currentSlide + howManySlides;
                    }
                } else {
                    this.currentSlide = Math.min(
                            this.currentSlide + howManySlides,
                            this.innerElements.length - this.perPage
                        );
                }
                if (beforeChange !== this.currentSlide) {
                    this.slideToCurrent(this.config.loop);
                    this.config.onChange.call(this);
                    if (callback) {
                        callback.call(this);
                    }
                }
            }
        }, {
            /**
            * Disable transition on sliderFrame.
            */
            key: 'disableTransition',
            value: function disableTransition() {
                this.sliderFrame.style.webkitTransition = 'all 0ms ' + this.config.easing;
                this.sliderFrame.style.transition = 'all 0ms ' + this.config.easing;
            }
        }, {
            /**
            * Enable transition on sliderFrame.
            */
            key: 'enableTransition',
            value: function enableTransition() {
                this.sliderFrame.style.webkitTransition = 'all ' + this.config.duration + 'ms ' + this.config.easing;
                this.sliderFrame.style.transition = 'all ' + this.config.duration + 'ms ' + this.config.easing;
            }
        }, {
            /**
            * Go to slide with particular index
            * @param {number} index - Item index to slide to.
            * @param {function} callback - Optional callback function.
            */
            key: 'goTo',
            value: function goTo(index, callback) {
                if (this.innerElements.length <= this.perPage) {
                    return;
                }
                var beforeChange = this.currentSlide;
                this.currentSlide = this.config.loop
                    ? index % this.innerElements.length
                    : Math.min(Math.max(index, 0), this.innerElements.length - this.perPage);
                if (beforeChange !== this.currentSlide) {
                    this.slideToCurrent();
                    this.config.onChange.call(this);
                    if (callback) {
                        callback.call(this);
                    }
                }
            }
        }, {
            /**
            * Moves sliders frame to position of currently active slide
            */
            key: 'slideToCurrent',
            value: function slideToCurrent(enableTransition) {
                var _this3 = this;

                var currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
                var offset = (this.config.rtl ? 1 : -1) * currentSlide * (this.selectorWidth / this.perPage);

                if (enableTransition) {
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            _this3.enableTransition();
                            _this3.sliderFrame.style[_this3.transformProperty] = 'translate3d(' + offset + 'px, 0, 0)';
                        });
                    });
                } else {
                    this.sliderFrame.style[this.transformProperty] = 'translate3d(' + offset + 'px, 0, 0)';
                }

                if (this.config.pagination) {
                    var paginationButtons = this.pagination.children;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = paginationButtons[Symbol.iterator](),
                            _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                            _iteratorNormalCompletion = true) {
                            var item = _step.value;

                            item.classList.remove('active');
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    var newPossition;
                    if (this.currentSlide < 0) {
                        newPossition = this.innerElements.length + this.currentSlide;
                    } else {
                        newPossition = this.currentSlide;
                    }
                    this.pagination.children[newPossition].classList.add('active');
                }
            }
        }, {
            /**
            * Recalculate drag /swipe event and reposition the frame of a slider
            */
            key: 'updateAfterDrag',
            value: function updateAfterDrag() {
                if (this.innerElements.length > this.perPage) {
                    var movement = (this.config.rtl ? -1 : 1) * (this.drag.endX - this.drag.startX);
                    var movementDistance = Math.abs(movement);
                    var howManySliderToSlide = this.config.multipleDrag
                        ? Math.ceil(movementDistance / (this.selectorWidth / this.perPage))
                        : 1;

                    var slideToNegativeClone =
                        movement > 0 && this.currentSlide - howManySliderToSlide < 0;
                    var slideToPositiveClone =
                        movement
                        < 0 && this.currentSlide + howManySliderToSlide
                        > this.innerElements.length - this.perPage;

                    if (movement > 0
                        && movementDistance > this.config.threshold
                        && this.innerElements.length > this.perPage
                        ) {
                        this.prev(howManySliderToSlide);
                    } else if (movement < 0
                        && movementDistance > this.config.threshold
                        && this.innerElements.length > this.perPage
                        ) {
                        this.next(howManySliderToSlide);
                    }
                    this.slideToCurrent(slideToNegativeClone || slideToPositiveClone);
                }
            }
        }, {
            /**
            * When window resizes, resize slider components as well
            */
            key: 'resizeHandler',
            value: function resizeHandler() {
                // update perPage number dependable of user value
                this.resolveSlidesNumber();

                // relcalculate currentSlide
                // prevent hiding items when browser width increases
                if (this.currentSlide + this.perPage > this.innerElements.length) {
                    this.currentSlide = this.innerElements.length <= this.perPage
                        ? 0
                        : this.innerElements.length - this.perPage;
                }

                this.setSelectorWidth();

                this.buildSliderFrame();
            }
        }, {
            /**
            * Clear drag after touchend and mouseup event
            */
            key: 'clearDrag',
            value: function clearDrag() {
                this.drag = {
                    startX: 0,
                    endX: 0,
                    startY: 0,
                    letItGo: null,
                    preventClick: this.drag.preventClick
                };
            }
        }, {
            /**
            * touchstart event handler
            */
            key: 'touchstartHandler',
            value: function touchstartHandler(e) {
                // Prevent dragging / swiping on inputs, selects and textareas
                var ignoreElements = ['TEXTAREA', 'OPTION', 'INPUT', 'SELECT'].indexOf(e.target.nodeName) !== -1;
                if (ignoreElements) {
                    return;
                }

                e.stopPropagation();
                this.pointerDown = true;
                this.drag.startX = e.touches[0].pageX;
                this.drag.startY = e.touches[0].pageY;
            }
        }, {
            /**
            * touchend event handler
            */
            key: 'touchendHandler',
            value: function touchendHandler(e) {
                e.stopPropagation();
                this.pointerDown = false;
                this.enableTransition();
                if (this.drag.endX) {
                    this.updateAfterDrag();
                }
                this.clearDrag();
            }
        }, {
            /**
            * touchmove event handler
            */
            key: 'touchmoveHandler',
            value: function touchmoveHandler(e) {
                if (this.innerElements.length > this.perPage) {
                    e.stopPropagation();
                    if (this.drag.letItGo === null) {
                        this.drag.letItGo =
                            Math.abs(this.drag.startY - e.touches[0].pageY)
                            < Math.abs(this.drag.startX - e.touches[0].pageX);
                    }

                    if (this.pointerDown && this.drag.letItGo) {
                        e.preventDefault();
                        this.drag.endX = e.touches[0].pageX;
                        this.sliderFrame.style.webkitTransition = 'all 0ms ' + this.config.easing;
                        this.sliderFrame.style.transition = 'all 0ms ' + this.config.easing;

                        var currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
                        var currentOffset = currentSlide * (this.selectorWidth / this.perPage);
                        var dragOffset = this.drag.endX - this.drag.startX;
                        var offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
                        this.sliderFrame.style[this.transformProperty] =
                            'translate3d(' + (this.config.rtl ? 1 : -1) * offset + 'px, 0, 0)';
                    }
                }
            }
        }, {
            /**
            * mousedown event handler
            */
            key: 'mousedownHandler',
            value: function mousedownHandler(e) {
                // Prevent dragging / swiping on inputs, selects and textareas
                var ignoreElements = ['TEXTAREA', 'OPTION', 'INPUT', 'SELECT'].indexOf(e.target.nodeName) !== -1;
                if (ignoreElements) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                this.pointerDown = true;
                this.drag.startX = e.pageX;
            }
        }, {
            /**
            * mouseup event handler
            */
            key: 'mouseupHandler',
            value: function mouseupHandler(e) {
                e.stopPropagation();
                this.pointerDown = false;
                this.selector.style.cursor = '-webkit-grab';
                this.enableTransition();
                if (this.drag.endX) {
                    this.updateAfterDrag();
                }
                this.clearDrag();
            }
        }, {
            /**
            * mousemove event handler
            */
            key: 'mousemoveHandler',
            value: function mousemoveHandler(e) {
                if (this.innerElements.length > this.perPage) {
                    e.preventDefault();
                    if (this.pointerDown) {
                        this.drag.preventClick = true;
                        this.drag.endX = e.pageX;
                        this.selector.style.cursor = '-webkit-grabbing';
                        this.sliderFrame.style.webkitTransition = 'all 0ms ' + this.config.easing;
                        this.sliderFrame.style.transition = 'all 0ms ' + this.config.easing;

                        var currentSlide = this.config.loop ? this.currentSlide + this.perPage : this.currentSlide;
                        var currentOffset = currentSlide * (this.selectorWidth / this.perPage);
                        var dragOffset = this.drag.endX - this.drag.startX;
                        var offset = this.config.rtl ? currentOffset + dragOffset : currentOffset - dragOffset;
                        this.sliderFrame.style[this.transformProperty] =
                            'translate3d(' + (this.config.rtl ? 1 : -1) * offset + 'px, 0, 0)';
                    }
                }
            }
        }, {
            /**
            * mouseleave event handler
            */
            key: 'mouseleaveHandler',
            value: function mouseleaveHandler(e) {
                if (this.pointerDown) {
                    this.pointerDown = false;
                    this.selector.style.cursor = '-webkit-grab';
                    this.drag.endX = e.pageX;
                    this.drag.preventClick = false;
                    this.enableTransition();
                    this.updateAfterDrag();
                    this.clearDrag();
                }
            }
        }, {
            /**
            * click event handler
            */
            key: 'clickHandler',
            value: function clickHandler(e) {
                // if the dragged element is a link
                // prevent browsers from folowing the link
                if (this.drag.preventClick) {
                    e.preventDefault();
                }
                this.drag.preventClick = false;
            }
        }, {
            /**
            * Remove item from carousel.
            * @param {number} index - Item index to remove.
            * @param {function} callback - Optional callback to call after remove.
            */
            key: 'remove',
            value: function remove(index, callback) {
                if (index < 0 || index >= this.innerElements.length) {
                    throw new Error('Item to remove doesn\'t exist');
                }

                // Shift sliderFrame back by one item when:
                // 1. Item with lower index than currenSlide is removed.
                // 2. Last item is removed.
                var lowerIndex = index < this.currentSlide;
                var lastItem = this.currentSlide + this.perPage - 1 === index;

                if (lowerIndex || lastItem) {
                    this.currentSlide--;
                }

                this.innerElements.splice(index, 1);

                // build a frame and slide to a currentSlide
                this.buildSliderFrame();

                if (callback) {
                    callback.call(this);
                }
            }
        }, {
            /**
            * Insert item to carousel at particular index.
            * @param {HTMLElement} item - Item to insert.
            * @param {number} index - Index of new new item insertion.
            * @param {function} callback - Optional callback to call after insert.
            */
            key: 'insert',
            value: function insert(item, index, callback) {
                if (index < 0 || index > this.innerElements.length + 1) {
                    throw new Error('Unable to inset it at this index');
                }
                if (this.innerElements.indexOf(item) !== -1) {
                    throw new Error('The same item in a carousel? Really? Nope');
                }

                // Avoid shifting content
                var shouldItShift = index <= this.currentSlide > 0 && this.innerElements.length;
                this.currentSlide = shouldItShift ? this.currentSlide + 1 : this.currentSlide;

                this.innerElements.splice(index, 0, item);

                // build a frame and slide to a currentSlide
                this.buildSliderFrame();

                if (callback) {
                    callback.call(this);
                }
            }
        }, {
            /**
            * Prepernd item to carousel.
            * @param {HTMLElement} item - Item to prepend.
            * @param {function} callback - Optional callback to call after prepend.
            */
            key: 'prepend',
            value: function prepend(item, callback) {
                this.insert(item, 0);
                if (callback) {
                    callback.call(this);
                }
            }
        }, {
            /**
            * Append item to carousel.
            * @param {HTMLElement} item - Item to append.
            * @param {function} callback - Optional callback to call after append.
            */
            key: 'append',
            value: function append(item, callback) {
                this.insert(item, this.innerElements.length + 1);
                if (callback) {
                    callback.call(this);
                }
            }
        }, {
            /**
            * Removes listeners and optionally restores to initial markup
            * @param {boolean} restoreMarkup - Determinants about restoring an initial markup.
            * @param {function} callback - Optional callback function.
            */
            key: 'destroy',
            value: function destroy() {
                var restoreMarkup = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
                var callback = arguments[1];

                this.detachEvents();

                this.selector.style.cursor = 'auto';

                if (restoreMarkup) {
                    var slides = document.createDocumentFragment();
                    for (var i = 0; i < this.innerElements.length; i++) {
                        slides.appendChild(this.innerElements[i]);
                    }
                    this.selector.innerHTML = '';
                    this.selector.appendChild(slides);
                    this.selector.removeAttribute('style');
                }

                if (callback) {
                    callback.call(this);
                }
            }
        }], [{
            key: 'mergeSettings',
            value: function mergeSettings(options) {
                var settings = {
                    selector: '.product-slider',
                    duration: 200,
                    easing: 'ease-out',
                    frameClassName: 'products-block',
                    parentClassName: 'product-slider-holder',
                    perPage: 1,
                    startIndex: 0,
                    draggable: true,
                    multipleDrag: true,
                    threshold: 20,
                    boxShadowOffset: 0,
                    loop: false,
                    pagination: false,
                    navigation: false,
                    rtl: false,
                    onInit: function onInit() { },
                    onChange: function onChange() { }
                };

                var userSttings = options;
                for (var attrname in userSttings) {
                    settings[attrname] = userSttings[attrname];
                }

                return settings;
            }
        }, {
            /**
            * Determine if browser supports unprefixed transform property.
            * Google Chrome since version 26 supports prefix-less transform
            * @returns {string} - Transform property supported by client.
            */
            key: 'webkitOrNot',
            value: function webkitOrNot() {
                var style = document.documentElement.style;
                if (typeof style.transform === 'string') {
                    return 'transform';
                }
                return 'WebkitTransform';
            }
        }]);

        return ProductSlider;
    }();

    /**
     * Used for initiating product slider
     *
     * @param {String} target
     * target = CSS selector of targeted element
     */
    function runProductSlider(target) {
        var supportsES6 = function() {
            try {
            new Function("(a = 0) => a");
            return true;
            }
            catch (err) {
            return false;
            }
        }();

        if (shoptet.abilities.feature.product_slider && supportsES6) {
            var productSliderElements = document.querySelectorAll(target);
            var productSliders = [];

            for (var i = 0; i < productSliderElements.length; i++) {
                var itemsPerPage = parseInt(productSliderElements[i].dataset.columns);
                var itemsPerPageMobile = parseInt(productSliderElements[i].dataset.columnsMobile);
                productSliders[i] = new ProductSlider({
                    selector: productSliderElements[i],
                    perPage: {
                        // shoptet.config.breakpoints
                        '320': itemsPerPageMobile,
                        '768': ((itemsPerPage - 2) > 0)?(itemsPerPage - 2):1,
                        '992': ((itemsPerPage - 1) > 0)?(itemsPerPage - 1):1,
                        '1200': itemsPerPage
                    },
                    loop: true,
                    pagination: true,
                    navigation: true,
                    boxShadowOffset: shoptet.abilities.config.slider_shadow_size,
                });
            }

            document.addEventListener("ShoptetModalResizeDone", function(e) {
                for (var i = 0; i < productSliderElements.length; i++) {
                    productSliders[i].resizeHandler();
                }
            });
        }
    }

    runProductSlider('.product-slider');

    shoptet.productSlider = shoptet.productSlider || {};
    shoptet.scripts.libs.productSlider.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'productSlider');
    });

})(shoptet);
