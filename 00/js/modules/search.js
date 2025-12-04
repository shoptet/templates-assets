/**
* Whisperer handling
*
* @param {Object} $searchInput
* $searchInput = input to which will be listener attached
* @param {Object} $searchContainer
* $searchContainer = HTML container for response
*/
window.fulltextSearch = ($searchInput, $searchContainer) => {
    var $form = $searchInput.parents('form');
    var xhr;

    $searchInput.on('keyup focus', function(e) {
        if (shoptet.abilities.feature.extended_search_whisperer) {
            if ($searchInput.val().length <= 2) {
                clearSearchWhisperer();
                return;
            }
            showSearchLoader();
        } else if (e.type === 'focus') {
            return;
        }

        if ($searchInput.val().indexOf(' ') == -1) {
            $('.search-whisperer-empty').hide();
        }

        delay(function() {
            if ($searchInput.val().length > 2) {
                if (!xhr || xhr.readyState === 4) {
                    xhr = $.ajax({
                        url: '/action/ProductSearch/ajaxSearch/',
                        type: 'GET',
                        headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                        data: $form.serialize()
                    })
                    .done(function (result) {
                        var response = $.parseJSON(result);
                        $searchContainer.html(response);
                        if ($searchInput.is(':focus')) {
                            $searchContainer.addClass('active');
                            $('body').addClass('search-focused');
                        }
                        shoptet.images.unveil();
                        shoptet.scripts.signalDomLoad('ShoptetDOMSearchResultsLoaded');
                    })
                    .fail(function () {
                        // TODO: add error message
                    });
                }
            } else if ($searchInput.val().length <= 2) {
                clearSearchWhisperer();
            }
        }, 500);
    });

    $searchContainer.click(function(e) {
        if (!$(e.target).hasClass('whisperer-trigger')) {
            e.stopPropagation();
        }
        if ($(e.target).hasClass('js-searchWhisperer__button')) {
            $form.submit();
        }
        if ($(e.target).hasClass('increase') || $(e.target).hasClass('decrease')) {
            e.stopPropagation();
            e.preventDefault();
            shoptet.products.changeQuantity($(e.target));
        }
    });

    $searchContainer.click(function(e) {
        let $target = $(e.target);

        if (!$target.hasClass('whisperer-trigger')) {
            e.stopPropagation();
        }

        if ($target.hasClass('js-searchWhisperer__button')) {
            e.preventDefault();
            $form.submit();
        }
    });

    document.addEventListener('click', function(e) {
        let button = e.target.closest(".searchWhisperer .increase, .searchWhisperer .decrease");
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            shoptet.products.changeQuantity($(button));
            return;
        }

        let input = e.target.closest(".searchWhisperer .amount");
        if (input) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    $(document).click(function (e) {
        var $target = $(e.target);

        if (!$target.is('.js-search-input, .js-try-search-button, .stay-open') && !$target.parents('.stay-open').length) {
            clearSearchWhisperer($target);

            if ($target.hasClass('search-window-visible')) {
                shoptet.popups.hideContentWindows();
            }
        }
    });

    function clearSearchWhisperer($elementClicked) {
        $searchContainer.removeClass('active');
        $searchContainer.empty();
        if ($elementClicked && !$elementClicked.hasClass('search-input-icon')) {
            clearSearchFocus();
        }
        return false;
    }

    function showSearchLoader() {
        $searchContainer.addClass('active');
        $('body').addClass('search-focused');
        if (!$('.searchWhisperer__loaderWrapper').length) {
            $searchContainer.html('<div class="searchWhisperer__loaderWrapper"><div class="loader"></div></div>');
        }
    }
}

/**
 * Clear search focus state with intentional delay (we need to check for the class in various handlers)
 *
 * This function does not accept any arguments.
 */
window.clearSearchFocus = () => {
    setTimeout(function() {
        $('body').removeClass('search-focused');
    }, shoptet.config.animationDuration / 2);
}

/**
 * Check minimal length of search query
 *
 * @param {Object} $el
 * $el = HTML element which value has to be checked
 */
window.checkMinimalLength = ($el) => {
    var passed = true;
    var length = $el.val().length;
    if ((length < 3 && length > 0) || length == 0) {
        showMessage(shoptet.messages['charsNeeded'], 'warning', '', false, false);
        passed = false;
    }
    return passed;
}

/**
 * Detect if recommended products are present in search window
 * and return number of them
 *
 * This function does not accept any arguments.
 */
window.detectRecommended = () => {
    return $('.recommended-products .row').length;
}

/**
 * Hide elements for manipulation with multiple recommended products
 *
 * This function does not accept any arguments.
 */
window.hideRecommended = () => {
    $('.recommended-products .browse, .recommended-products .indicator').detach();
}

/**
 * Update indiator for recommended products
 *
 * @param {Boolean|String} className
 * className = false or class name we want to add to indicator
 */
window.updateIndicator = (className) => {
    var $indicator = $('.recommended-products .indicator');
    var indicatorClasses = 'indicator-1 indicator-2';
    if (className === false) {
        $indicator.removeClass(indicatorClasses);
    } else {
        $indicator.removeClass(indicatorClasses).addClass(className);
    }
}

/**
 * Switch recommended products
 *
 * @param {String} target
 * target = accepts 'prev' or 'next', determines which recommended
 * products will be displayed
 */
window.switchRecommended = (target) => {
    if (detectRecommended() > 1) {
        var $el = $('.recommended-products .row.active');
        var $arrows = $('.recommended-products .browse');
        if (target === 'prev') {
            var $targetEl = $el.prev('.row');
            var $targetElSibling = $targetEl.prev('.row');
            var $arrow = $('.recommended-products .prev');
            var indicatorClassName = 'indicator-prev';
        } else {
            var $targetEl = $el.next('.row');
            var $targetElSibling = $targetEl.next('.row');
            var $arrow = $('.recommended-products .next');
            var indicatorClassName = 'indicator-next';
        }
        if ($targetEl.length > 0) {
            $arrows.removeClass('inactive');
            $el.removeClass('active');
            $targetEl.addClass('active');
            shoptet.images.unveil();
            if ($targetElSibling.length < 1) {
                $arrow.addClass('inactive');
                if (indicatorClassName === 'indicator-prev') {
                    updateIndicator(false);
                } else {
                    updateIndicator('indicator-2');
                }
            } else {
                updateIndicator('indicator-1');
            }
        } else {
            //
        }
    } else {
        //
    }
}

$(function () {
    var $html = $('html');
    var $body = $('body');

    // Whisperer
    var $searchInput = $('.search input.query-input');
    if ($searchInput.length) {
        $searchInput.parents('form').each(function () {
            var $this = $(this);
            var whispererClass = shoptet.abilities.feature.extended_search_whisperer
                ? 'searchWhisperer'
                : 'search-whisperer';
            if (shoptet.abilities.feature.extended_search_whisperer) {
                $this.after('<div class="' + whispererClass + '"></div>');
            } else {
                $this.find($searchInput).after('<div class="' + whispererClass + '"></div>');
            }
            fulltextSearch($this.find($searchInput), $this.parent().find('.' + whispererClass));
        });
    }

    // Submit form by clickin' on "Show all results" link in whisperer
    $html.on('click', '.whisperer-trigger', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).parents('.search-form').submit();
    });

    $html.on('blur', '.search-form input[type="search"]', function() {
        if (!$('.searchWhisperer.active').length) {
            clearSearchFocus();
        }
    });

    $html.on('click', '.search-input-icon', function() {
        if ($body.hasClass('search-window-visible')) {
            shoptet.popups.hideContentWindows();
            clearSearchFocus();
        } else if ($body.hasClass('search-focused')) {
            clearSearchFocus();
        } else {
            $(this).closest('form').find('.js-search-input').focus();
        }
    });

    $html.on('click', '.js-try-search-button', function() {
        if (shoptet.layout.detectResolution(shoptet.abilities.config.navigation_breakpoint) && $('.js-search-input').is(':visible')) {
            $('.js-search-input').focus();
        } else {
            shoptet.popups.showPopupWindow('search', true);
        }
    });

    // Load more search results
    if (shoptet.config.ums_a11y_pagination) {
        const loadingAnnouncer = shoptet.screenReader.createLoadingAnnouncer();
        $html.on('click', '.js-loadMore__button--productsSearch', function(e) {
            const $listingWrapper = $('#products-found .products');
            showSpinner();
            loadingAnnouncer.begin($listingWrapper[0]);

            const $el = $(this);
            var offset = $el.data('offset');
            var string = $el.data('string');
            $.ajax({
                url: '/action/productSearch/ajaxNextContent?string=' + encodeURIComponent(string) + '&offset=' + offset,
                headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                async: true,
                timeout: 150800,
                dataType: 'html',
                success: (function (payload) {
                    const requestedDocument = shoptet.common.createDocumentFromString(payload);
                    const $newListing = $(requestedDocument).find('.products > .product');
                    const $newListingControls = $(requestedDocument).find('.listingControls');

                    if ($newListing?.length > 0) {
                        $listingWrapper.append($newListing);
                        shoptet.animations.fadeIn($newListing);
                        $('.listingControls').replaceWith($newListingControls);

                        shoptet.products.splitWidgetParameters();
                        initTooltips();
                        shoptet.images.unveil();
                        loadingAnnouncer.end();
                        hideSpinner();
                        shoptet.focusManagement.focusFirst($newListing[0], true);
                    }
                    shoptet.scripts.signalDomLoad('ShoptetDOMPageContentLoaded');
                })
            });
        });
    } else {
        $html.on('click', '#loadNextSearchResults', function(e) {
            e.preventDefault();
            $(this).after('<div class="loader static accented" />');
            $(this).remove();
            var offset = $(e.target).data('offset');
            var string = $(e.target).data('string');
            $.ajax({
                url: '/action/productSearch/ajaxNextContent?string=' + string + '&offset=' + offset,
                headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
                async: true,
                timeout: 150800,
                dataType: 'html',
                success: (function (data, textStatus, xOptions) {
                    $('.search-next-wrap').remove();
                    $('#products-found').append(data).fadeIn('slow');
                    shoptet.images.unveil();
                    shoptet.products.splitWidgetParameters();
                    initTooltips();
                    shoptet.scripts.signalDomLoad('ShoptetDOMPageContentLoaded');
                })
            });
        });
    }


    // Display groups in search results
    $html.on('click', '.display-results-group', function(e) {
        e.preventDefault();
        $list = $(this).siblings('.search-results-group-list');
        $list.find('.no-display').removeClass('no-display');
        $(this).hide();
    });

    $html.on('submit', '.search-form', function() {
        if(!checkMinimalLength($(this).find('input[type="search"]'))) {
            return false;
        }
    });

    // Switch between top recommended products in search
    if (detectRecommended() < 1) {
        hideRecommended();
    }
    $html.on('click', '.recommended-products .browse', function(e) {
        e.preventDefault();
        if ($(this).hasClass('prev')) {
            switchRecommended('prev');
        } else {
            switchRecommended('next');
        }
    });
});
