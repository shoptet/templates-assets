/**
* Whisperer handling
*
* @param {Object} $searchInput
* $searchInput = input to which will be listener attached
* @param {Object} $searchContainer
* $searchContainer = HTML container for response
*/
function fulltextSearch($searchInput, $searchContainer) {
    var $form = $searchInput.parents('form');
    var xhr;

    $searchInput.keyup(function() {
        if ($searchInput.val().indexOf(' ') == -1) {
            $('.search-whisperer-empty').hide()
        }
        delay(function() {
            if ($searchInput.val().length > 2) {
                if (!xhr || xhr.readyState === 4) {
                    xhr = $.ajax({
                        url: '/action/ProductSearch/ajaxSearch/',
                        type: 'GET',
                        data: $form.serialize()
                    })
                    .done(function (result) {
                        var response = $.parseJSON(result);
                        $searchContainer.html(response);
                        $searchContainer.addClass('active')
                        $searchContainer.slideDown(shoptet.config.animationDuration);
                        if ($searchInput.val().indexOf(' ') != -1) {
                            $('.search-whisperer-empty').show()
                        }
                    })
                    .fail(function () {
                        $searchContainer.slideDown(shoptet.config.animationDuration);
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
    });
    $(document).click(function () {
        clearSearchWhisperer();
    });
    function clearSearchWhisperer() {
        $searchContainer.removeClass('active')
        $searchContainer.empty();
        return false;
    }
}

/**
 * Check minimal length of search query
 *
 * @param {Object} $el
 * $el = HTML element which value has to be checked
 */
function checkMinimalLength($el) {
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
function detectRecommended() {
    return $('.recommended-products .row').length;
}

/**
 * Hide elements for manipulation with multiple recommended products
 *
 * This function does not accept any arguments.
 */
function hideRecommended() {
    $('.recommended-products .browse, .recommended-products .indicator').detach();
}

/**
 * Update indiator for recommended products
 *
 * @param {Boolean|String} className
 * className = false or class name we want to add to indicator
 */
function updateIndicator(className) {
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
function switchRecommended(target) {
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
            $('.recommended-products img').unveil();
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
    // Whisperer
    var $searchInput = $('.search input.query-input');
    if ($searchInput.length) {
        $searchInput.after('<div class="search-whisperer"></div>');
        fulltextSearch($searchInput, $('.search-whisperer'));
    }

    // Submit form by clickin' on "Show all results" link in whisperer
    $('html').on('click', '.whisperer-trigger', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).parents('.search-form').submit();
    });

    // Open search window by clickin' into sidebar search widget input
    $('html').on('focus', '.search-form input[type="search"]', function() {
        if (
            shoptet.abilities.feature.focused_search_window
            && !$('body').hasClass('search-window-visible')
        ) {
            shoptet.global.showPopupWindow('search', true);
        }
    });

    // Load more search results
    $('html').on('click', '#loadNextSearchResults', function(e) {
        e.preventDefault();
        $(this).after('<div class="loader static accented" />');
        $(this).remove();
        var offset = $(e.target).data('offset');
        var string = $(e.target).data('string');
        $.ajax({
            url: '/action/productSearch/ajaxNextContent?string=' + string + '&offset=' + offset,
            async: true,
            timeout: 150800,
            dataType: 'html',
            success: (function (data, textStatus, xOptions) {
                $('.search-next-wrap').remove();
                $('#products-found').append(data).fadeIn('slow');
                $('#products-found img').unveil();
                initTooltips();
                shoptet.scripts.signalDomLoad('ShoptetDOMPageContentLoaded');
            })
        });
    });

    // Display groups in search results
    $('html').on('click', '.display-results-group', function(e) {
        e.preventDefault();
        $list = $(this).siblings('.search-results-group-list');
        $list.find('.no-display').removeClass('no-display');
        $(this).hide();
    });

    $('html').on('submit', '.search-form', function() {
        if(!checkMinimalLength($(this).find('input[type="search"]'))) {
            return false;
        }
    });

    // Switch between top recommended products in search
    if (detectRecommended() < 1) {
        hideRecommended();
    }
    $('html').on('click', '.recommended-products .browse', function(e) {
        e.preventDefault();
        if ($(this).hasClass('prev')) {
            switchRecommended('prev');
        } else {
            switchRecommended('next');
        }
    });
});
