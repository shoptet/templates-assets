function init(el) {

    var imageContainer = el;

    //rotationSpeed - number - sets time interval between clicks for autoplay
    //pixelsPerFrame - number - length in pixels which user has to drag mouse to switch frames
    var config = {
        rotationSpeed: 100,
        pixelsPerFrame: 10,
        fullscreenDelay: 300,
        url: '/action/ProductDetail/Get360Images/'
    };
    var classes = {
        container: 'image360',
        holder: 'image360-holder',
        preview: 'image360-preview',
        loadedEl: 'image360-loaded',
        fullscreenOn: 'image360-fullscreen-on',
        fullscreenTarget: 'image360-fullscreen-target',
        iconFullscreenTurnedOn: 'icon-contract',
        iconFullscreenTurnedOff: 'icon-expand',
        navigation: {
            play: 'image360-play',
            prev: 'image360-prev',
            next: 'image360-next',
            fullscreen: 'image360-fullscreen'
        }
    };

    var runtime = {
        currentFrame: 0,
        framesCount: 0,
        fullscreenImagesLoaded: false,
        fullscreenOn: false,
        image360images: {
            normal: [],
            fullscreen: []
        },
        intervals: {
            prevImage: false,
            nextImage: false,
            play: false
        },
        lastPosition: 0,
        normalImagesLoaded: false,
        scriptRotationInProgress: false,
        userRotationInProgress: false
    };

    var imageHolder = document.createElement('div');
    imageHolder.classList.add(classes.holder);
    imageContainer.appendChild(imageHolder);

    assignEventListeners(imageContainer, imageHolder);

    function assignEventListeners(imageContainer, imageHolder) {
        imageHolder.addEventListener('dragstart', function(event) {
            event.preventDefault();
            if (runtime.scriptRotationInProgress) {
                play(
                    imageContainer.querySelector('.' + classes.navigation.play)
                );
            }
        });

        /* blackberry & a few other device + browser configurations cant handle click events (atm) */
        if (shoptet.helpers.isTouchDevice()) {
            imageContainer.addEventListener(
                'touchstart',
                function handler() {
                    buildImage(imageContainer, 'normal');
                    imageContainer.removeEventListener('touchstart', handler);
                }
            );
            imageHolder.addEventListener(
                'touchstart',
                holderMousedown
            );
            imageHolder.addEventListener(
                'touchmove',
                function(event) {
                    holderMousemove(event)
                }
            );
            imageHolder.addEventListener(
                'touchend',
                holderMouseup
            );
            document.addEventListener(
                'touchend',
                holderMouseup
            );
        } else {
            imageContainer.addEventListener(
                'mouseenter',
                function handler() {
                    buildImage(imageContainer, 'normal');
                    imageContainer.removeEventListener('mouseenter', handler);
                }
            );
            imageHolder.addEventListener(
                'mousedown',
                holderMousedown
            );
            imageHolder.addEventListener(
                'mousemove',
                function(event) {
                    holderMousemove(event)
                }
            );
            imageHolder.addEventListener(
                'mouseup',
                holderMouseup
            );
            document.addEventListener(
                'mouseup',
                holderMouseup
            );
        }
        // escape and back button press while on fullscreen
        window.addEventListener('keydown', function(e) {
            if (
                runtime.fullscreenOn
                &&
                (e.keyCode === shoptet.common.keyCodes.escape || e.keyCode === shoptet.common.keyCodes.backspace)
            ) {
                e.preventDefault();
                navigationFullscreenClick(e, true);
            }
        });
    }

    function buildNavigation(imageContainer) {
        var playButton = document.createElement('span');
        playButton.classList.add(classes.navigation.play);
        playButton.classList.add('shoptet-icon');
        playButton.classList.add('icon-play');

        var prevButton = document.createElement('span');
        prevButton.classList.add(classes.navigation.prev);
        prevButton.classList.add('shoptet-icon');
        prevButton.classList.add('icon-previous');

        var nextButton = document.createElement('span');
        nextButton.classList.add(classes.navigation.next);
        nextButton.classList.add('shoptet-icon');
        nextButton.classList.add('icon-next');

        var fullscreenButton = document.createElement('span');
        fullscreenButton.classList.add(classes.navigation.fullscreen);
        fullscreenButton.classList.add('shoptet-icon');
        fullscreenButton.classList.add(classes.iconFullscreenTurnedOff);

        var imageNav = document.createElement('div');
        imageNav.classList.add('image360-navigation');

        imageNav.appendChild(playButton);
        imageNav.appendChild(prevButton);
        imageNav.appendChild(nextButton);
        imageNav.appendChild(fullscreenButton);

        imageContainer.appendChild(imageNav);

        if (shoptet.helpers.isTouchDevice()) {
            playButton.addEventListener(
                'touchstart',
                function(event) {
                    event.stopPropagation();
                    play(event.target)
                }
            );
            prevButton.addEventListener(
                'touchstart',
                function(event) {
                    event.stopPropagation();
                    navigationPrevMousedown(event);
                }
            );
            prevButton.addEventListener(
                'touchend',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.prevImage
                    );
                }
            );
            nextButton.addEventListener(
                'touchstart',
                function(event) {
                    event.stopPropagation();
                    navigationNextMousedown(event);
                }
            );
            nextButton.addEventListener(
                'touchend',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.nextImage
                    );
                }
            );
            fullscreenButton.addEventListener(
                'touchstart',
                function(event) {
                    event.stopPropagation();
                    setTimeout(function() {
                        navigationFullscreenClick(event);
                    }, config.fullscreenDelay);
                }
            );
        } else {
            playButton.addEventListener(
                'click',
                function(event) {
                    event.stopPropagation();
                    play(event.target)
                }
            );
            prevButton.addEventListener(
                'mousedown',
                function(event) {
                    event.stopPropagation();
                    navigationPrevMousedown(event);
                }
            );
            prevButton.addEventListener(
                'mouseup',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.prevImage
                    );
                }
            );
            prevButton.addEventListener(
                'mouseleave',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.prevImage
                    );
                }
            );
            nextButton.addEventListener(
                'mousedown',
                function(event) {
                    event.stopPropagation();
                    navigationNextMousedown(event);
                }
            );
            nextButton.addEventListener(
                'mouseup',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.nextImage
                    );
                }
            );
            nextButton.addEventListener(
                'mouseleave',
                function(event) {
                    event.stopPropagation();
                    clearInterval(
                        runtime.intervals.nextImage
                    );
                }
            );
            fullscreenButton.addEventListener(
                'click',
                function(event) {
                    event.stopPropagation();
                    navigationFullscreenClick(event);
                }
            );
        }
    }

    function buildImage(imageContainer, size) {
        imageContainer.classList.add(shoptet.ajax.pendingClass);
        var productId = imageContainer.dataset.productid;
        if (productId === '') {
            imageContainer.classList.remove(shoptet.ajax.pendingClass);
            showMessage(shoptet.messages['ajaxError'], 'error');
            return;
        }

        var successCallback = function callback(response) {
            preloadImages(imageContainer, response.getPayload(), size);
        };

        var failedCallback = function() {
            imageContainer.classList.remove(shoptet.ajax.pendingClass);
        };

        shoptet.ajax.makeAjaxRequest(
            config.url,
            shoptet.ajax.requestTypes.post,
            {
                productId: productId,
                imageSize: imageContainer.dataset[size]
            },
            {
                success: successCallback,
                failed: failedCallback
            }
        );
    }

    function preloadImages(imageContainer, imageURLs, size) {
        runtime.framesCount = imageURLs.length - 1;
        for (var i = 0; i < imageURLs.length; i++) {
            var image = new Image();
            image.src = imageURLs[i];
            if (image.complete || image.readyState === 4) {
                loadSuccess(imageContainer, imageURLs[i], i, size);
            } else {
                image.addEventListener(
                    'load',
                    (function(i) {
                        loadSuccess(imageContainer, imageURLs[i], i, size)
                    })(i)
                );
                image.addEventListener(
                    'error',
                    (function(i) {
                        loadSuccess(imageContainer, imageURLs[i], i, size)
                    })(i)
                );
            }
        }
    }

    function getPositionX(event) {
        var positionX;
        if (typeof(event.clientX) !== 'undefined') {
            positionX = event.clientX;
        } else {
            var touch = event.changedTouches[0];
            positionX = touch.pageX;
        }
        return positionX;
    }

    function loadSuccess(imageContainer, source, index, size) {
        runtime.image360images[size][index] = source;
        if (runtime.image360images[size].length === runtime.framesCount) {
            if (!runtime.normalImagesLoaded) {
                runtime.normalImagesLoaded = true;
                var imageHolder = imageContainer.querySelector('.' + classes.holder);
                var imagePreview = imageContainer.querySelector('.' + classes.preview);
                imageHolder.appendChild(imagePreview);
                buildNavigation(imageContainer);
            }
            imageContainer.classList.remove(shoptet.ajax.pendingClass);
            imageContainer.classList.add(classes.loadedEl);
        }
    }

    function nextImage(imageContainer) {
        if (runtime.currentFrame > 0) {
            runtime.currentFrame = runtime.currentFrame - 1;
        } else {
            runtime.currentFrame = runtime.framesCount;
        }
        var size = runtime.fullscreenOn ? 'fullscreen' : 'normal';
        switchSrc(imageContainer, runtime.currentFrame, size);
    }

    function prevImage(imageContainer) {
        if (runtime.currentFrame < runtime.framesCount) {
            runtime.currentFrame = runtime.currentFrame + 1;
        } else {
            runtime.currentFrame = 0;
        }
        var size = runtime.fullscreenOn ? 'fullscreen' : 'normal';
        switchSrc(imageContainer, runtime.currentFrame, size);
    }

    function switchSrc(imageContainer, frame, size) {
        var newSrc = runtime.image360images[size][frame];
        if (typeof newSrc === 'undefined') {
            // Fallback size is used when new image is not loaded yet,
            // typically after first load of fullscreen
            var fallbackSize = (size === 'fullscreen') ? 'normal' : 'fullscreen';
            newSrc = runtime.image360images[fallbackSize][frame];
        }
        var imagePreview = imageContainer.querySelector('.' + classes.preview);
        imagePreview.setAttribute('src', newSrc);
    }

    function holderMousedown(event) {
        event.stopPropagation();
        var touchLength = 1;
        if (typeof(event.clientX) === 'undefined') {
            touchLength = event.touches.length;
        }
        if (touchLength === 1) {
            runtime.userRotationInProgress = true;
            runtime.lastPosition = getPositionX(event);
        }
    }

    function holderMousemove(event) {
        event.stopPropagation();
        var imageContainer = event.target.closest('.' + classes.container);
        if (!runtime.userRotationInProgress) {
            return;
        }
        var deltaX = (runtime.lastPosition - getPositionX(event));
        if (Math.abs(deltaX) > config.pixelsPerFrame) {
            if (deltaX > 0) {
                prevImage(imageContainer);
            } else if (deltaX < 0) {
                nextImage(imageContainer);
            } //deltaX = 0 vertical slide
            runtime.lastPosition = getPositionX(event);
        }
    }

    function holderMouseup() {
        runtime.userRotationInProgress = false;
    }

    /* navigation button handlers */
    function play(playButton) {
        var imageContainer = playButton.parentElement.parentElement;
        playButton.classList.toggle('icon-play');
        playButton.classList.toggle('icon-pause');
        if (runtime.scriptRotationInProgress) {
            runtime.scriptRotationInProgress = false;
            window.clearInterval(runtime.intervals.play);
        } else {
            runtime.scriptRotationInProgress = true;
            window.clearInterval(runtime.intervals.play);
            runtime.intervals.play = setInterval(function() {
                nextImage(imageContainer);
            }, config.rotationSpeed);
        }
    }

    function navigationPrevMousedown(event) {
        var imageContainer = event.target.parentElement.parentElement;
        if (runtime.scriptRotationInProgress) {
            play(imageContainer.querySelector('.' + classes.navigation.play));
            return;
        }
        prevImage(imageContainer);
        clearInterval(runtime.intervals.prevImage);
        runtime.intervals.prevImage = setInterval(function() {
            prevImage(imageContainer);
        }, config.rotationSpeed);
    }

    function navigationNextMousedown(event) {
        var imageContainer = event.target.parentElement.parentElement;
        if (runtime.scriptRotationInProgress) {
            play(imageContainer.querySelector('.' + classes.navigation.play));
            return;
        }
        nextImage(imageContainer);
        clearInterval(runtime.intervals.nextImage);
        runtime.intervals.nextImage = setInterval(function() {
            nextImage(imageContainer);
        }, config.rotationSpeed);
    }

    function navigationFullscreenClick(event, keyboard) {
        var fullscreenButton;
        if (typeof keyboard !== 'undefined') {
            // pressed esc or back button
            var fullscreenTarget = document.getElementsByClassName(classes.fullscreenTarget)[0];
            fullscreenButton = fullscreenTarget.querySelector('.' + classes.navigation.fullscreen);
        } else {
            // clicked on fullscreen button
            fullscreenButton = event.target;
        }
        var imageContainer = fullscreenButton.closest('.image360');
        var body = document.getElementsByTagName('body')[0];
        if (fullscreenButton.classList.contains(classes.iconFullscreenTurnedOff)) {
            if (!runtime.fullscreenImagesLoaded) {
                runtime.fullscreenImagesLoaded = true;
                buildImage(imageContainer, 'fullscreen');
            }

            runtime.fullscreenOn = true;
            body.classList.add(classes.fullscreenOn);
            imageContainer.classList.add(classes.fullscreenTarget);
            fullscreenButton.classList.add(classes.iconFullscreenTurnedOn);
            fullscreenButton.classList.remove(classes.iconFullscreenTurnedOff);
            switchSrc(
                imageContainer,
                runtime.currentFrame,
                'fullscreen'
            );
        } else {
            runtime.fullscreenOn = false;
            body.classList.remove(classes.fullscreenOn);
            imageContainer.classList.remove(classes.fullscreenTarget);
            fullscreenButton.classList.remove(classes.iconFullscreenTurnedOn);
            fullscreenButton.classList.add(classes.iconFullscreenTurnedOff);
            switchSrc(
                imageContainer,
                runtime.currentFrame,
                'normal'
            );
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var elements = document.getElementsByClassName('image360');
    for (var key in elements) {
        if (elements.hasOwnProperty(key)) {
            init(elements[key]);
        }
    }
});
