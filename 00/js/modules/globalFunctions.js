// TODO: move these declarations to filters and unify with 2G
window.categoryMinValue = parseInt($('#categoryMinValue').text());
window.categoryMaxValue = parseInt($('#categoryMaxValue').text());
window.currencyExchangeRate = shoptet.helpers.toFloat($('#currencyExchangeRate').text());

// Colorbox defaults
// $.colorbox.settings.opacity must be identical as alpha channel of @overlay-bg in theme-variables.less
$.colorbox.settings.opacity = shoptet.modal.config.opacity;
$.colorbox.settings.maxWidth = shoptet.modal.config.maxWidth;
$.colorbox.settings.initialWidth = shoptet.modal.config.widthMd;
$.colorbox.settings.initialHeight = shoptet.modal.config.initialHeight;
$.colorbox.settings.previous = shoptet.messages['previous'];
$.colorbox.settings.next = shoptet.messages['next'];
$.colorbox.settings.close = shoptet.messages['close'];

/**
 * Function for displaying information messages
 *
 * @param {String} content
 * content = text of message
 * @param {String} type
 * type = part of CSS class, which defines the type of message - success, info, warning, error
 * @param {String} id
 * id = id of element affected by queued action which can be cancelled
 * @param {Boolean} cancel
 * cancel = if set to true, function renders link to cancel queued action
 * @param {Boolean} overlay
 * overlay = if set to true, message is rendered as modal over the overlayed content
 */
window.showMessage = (content, type, id, cancel, overlay, parent) => {
  parent = parent || '.messages';
  if (typeof id === 'undefined') {
    id = '';
  }
  if (typeof cancel === 'undefined') {
    cancel = false;
  }
  if (typeof overlay === 'undefined') {
    overlay = false;
  }
  hideMsg(true);
  clearTimeout(shoptet.config.dismiss);

  if ($('.msg').length) {
    hideMsg(true);
  }

  if (cancel !== false) {
    cancel = ' <a href="#" class="cancel-action" data-id="' + id + '">' + shoptet.messages['cancel'] + '</a>';
  } else {
    cancel = '';
  }

  var message =
    '<div class="msg msg-' + type + '" role="alert"><div class="container"><span data-testid="notifierMessage">';
  message += content + cancel + '</span></div></div>';

  $(message).prependTo(parent);
  if (overlay === true) {
    $('<div class="overlay visible" />').appendTo('body');
    $('body').addClass('msg-visible');
  }

  dismissMessages();
};

/**
 * Function for hiding information messages
 *
 * @param {Boolean} action
 */
window.hideMsg = action => {
  $('body').removeClass('msg-visible');
  if (typeof action != 'undefined') {
    $('.msg, .overlay.visible').remove();
  } else {
    $('.msg, .overlay.visible').addClass('hidden');
    setTimeout(function () {
      $('.msg, .overlay.visible').remove();
    }, shoptet.config.animationDuration);
  }
};

/**
 * Dismiss messages from notifier
 *
 * This function does not accept any arguments.
 */
window.dismissMessages = () => {
  shoptet.runtime.dismiss = setTimeout(function () {
    hideMsg();
  }, shoptet.config.dismissTimeout);
};

/**
 * Function for cancelling queued actions
 *
 * @param {String} id
 * id = id of element affected by cancelled action,
 * if called without id, function only hide message
 */
window.cancelAction = id => {
  if (typeof id == 'undefined') {
    hideMsg();
  } else {
    $('#' + id)
      .removeClass('hidden')
      .removeAttr('id');
    clearTimeout(removeItem);
    hideMsg();
  }
};

/**
 * Displays spinner during the AJAX call
 *
 * This function does not accept any arguments.
 */
window.showSpinner = () => {
  $('body').addClass('spinner-visible').append('<div class="overlay spinner"><div class="loader" /></div>');
};

/**
 * Hides spinner after the AJAX call is complete
 *
 * This function does not accept any arguments.
 */
window.hideSpinner = () => {
  $('.overlay.spinner').addClass('invisible');
  setTimeout(function () {
    $('body').removeClass('spinner-visible');
    $('.overlay.spinner').detach();
  }, shoptet.config.animationDuration);
};

/**
 * Displays tooltips
 *
 * This function does not accept any arguments.
 */
window.initTooltips = () => {
  $('.tooltip').hide();
  $('.show-tooltip').tooltip({
    html: true,
    placement: 'auto',
    container: 'body',
  });
};

/**
 * Detect if page was scrolled
 *
 * @param {'up'|'down'} direction - direction of scrolling
 * @returns {void}
 */
window.detectScrolled = direction => {
  if (!shoptet.abilities.feature.fixed_header && shoptet.config.mobileHeaderVersion !== '1') {
    return;
  }

  if (!['up', 'down'].includes(direction)) {
    throw new Error(`Parameter validation failed. ${direction} !== 'up'|'down'`);
  }

  const navigationVisible = shoptet.layout.detectResolution(shoptet.abilities.config.navigation_breakpoint);
  const classToRemove = direction === 'up' ? 'scrolled-down' : 'scrolled-up';
  let top = !shoptet.abilities.feature.fixed_header && !navigationVisible ? 50 : 0;

  if (shoptet.abilities.feature.fixed_header && navigationVisible) {
    const adminBar = document.querySelector('.admin-bar');
    const adminBarHeight = adminBar ? adminBar.offsetHeight : 0;
    const topNavigationBar = document.querySelector('.top-navigation-bar');
    const topNavigationBarHeight = topNavigationBar ? topNavigationBar.offsetHeight : 0;

    top = topNavigationBarHeight + adminBarHeight;
  }

  if (window.scrollY > top) {
    document.documentElement.classList.add('scrolled', `scrolled-${direction}`);
    document.documentElement.classList.remove(classToRemove);
    if (
      shoptet.abilities.feature.fixed_header &&
      navigationVisible &&
      !document.body.classList.contains('submenu-visible') &&
      !document.body.classList.contains('menu-helper-visible')
    ) {
      shoptet.menu.hideNavigation();
    }
  } else {
    document.documentElement.classList.remove('scrolled', 'scrolled-up', 'scrolled-down');
    if (shoptet.abilities.feature.fixed_header && navigationVisible) {
      shoptet.menu.hideSubmenu();
    }
  }
};

/**
 * Toggle text of HTML element
 *
 * @param {Object} $el
 * $el = HTML element whose text has to be changed
 * @param {String} text
 * text = current text of an element
 * @param {String} showText
 * showText = text that has to be to displayed
 * @param {String} hideText
 * hideText = text that has to be to hidden
 */
window.toggleText = ($el, text, showText, hideText) => {
  if (text == hideText) {
    $el.attr('data-text', hideText);
    $el.html(showText);
  } else {
    $el.attr('data-text', showText);
    $el.html(hideText);
  }
};

/**
 * Toggle contact informations in ordering process
 *
 * @param {Object} $el
 * $el = HTML element which has to be changed
 */
window.toggleContacts = $el => {
  var text = $el.html();
  var hideText = shoptet.messages['hideContacts'];
  var showText = $el.attr('data-original-text');
  $el.siblings('.box').toggleClass('visible');
  $el.toggleClass('expanded');
  toggleText($el, text, showText, hideText);
};

window.delay = (() => {
  var timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

/**
 * Scroll page to element
 *
 * @param {Object} $el HTML element to which the page should scroll
 */
window.scrollToEl = $el => {
  var $message = $('.messages .msg');
  var $adminBar = $('.admin-bar');
  var $cartHeader = $('.cart-header');
  var $header =
    shoptet.abilities.about.id === '11' &&
    !shoptet.layout.detectResolution(shoptet.config.breakpoints.sm) &&
    $cartHeader.length
      ? $cartHeader
      : $('#header');
  var offset = $el.offset();
  var messageHeight = $message.length ? $message.outerHeight() : 0;
  var adminBarHeight =
    $adminBar.length && shoptet.layout.detectResolution(shoptet.config.breakpoints.sm) ? $adminBar.height() : 0;
  var margin =
    $header.css('position') === 'fixed' || shoptet.abilities.feature.fixed_header ? $header.outerHeight() : 0;
  $('html, body')
    .stop(true, true)
    .animate(
      {
        scrollTop: offset.top - messageHeight - margin - adminBarHeight - 10,
      },
      shoptet.config.animationDuration
    );
};

/**
 * Set carousel height to be equal like highest image to prevent element jump after fade
 *
 * @param {Object} $carousel
 * $carousel = carousel element
 */
window.setCarouselHeight = $carousel => {
  $carousel.removeAttr('style');
  var maxHeight = 0;
  $carousel.find('img').each(function () {
    var h = $(this).height();
    if (h > maxHeight) {
      maxHeight = h;
    }
  });
  $carousel.css('min-height', maxHeight);
};

/**
 * Init colorbox elements
 *
 * This function does not accept any arguments.
 */
window.initColorbox = () => {
  $('.variant-image a').colorbox({
    maxWidth: shoptet.modal.config.maxWidth,
    maxHeight: shoptet.modal.config.maxHeight,
  });

  var $lightboxes = {};
  $('a[data-gallery]').each(function () {
    $lightboxes[$(this).data('gallery')] = 1;
  });

  if (!$.isEmptyObject($lightboxes)) {
    for (var key in $lightboxes) {
      $('*[data-gallery="' + key + '"]').colorbox({
        rel: key,
        maxWidth: shoptet.modal.config.maxWidth,
        maxHeight: shoptet.modal.config.maxHeight,
        width: shoptet.modal.config.widthLg,
        className: shoptet.modal.config.classLg + ' productDetail',
      });
    }
  }
};

/**
 * Add space for "footer" on mobile resolution
 *
 * This function does not accept any arguments.
 */
window.addPaddingToOverallWrapper = () => {
  if (!shoptet.abilities.feature.positioned_footer) {
    return;
  }
  if (!shoptet.layout.detectResolution(shoptet.config.breakpoints.sm)) {
    var topNavigationBarHeight = $('.top-navigation-bar').outerHeight();
    $('.overall-wrapper').css('padding-bottom', topNavigationBarHeight);
  } else {
    $('.overall-wrapper').css('padding-bottom', 0);
  }
};

/**
 * Detect video background in header
 *
 * @param {Object} $video
 * $video = handled video element
 */
window.detectVideoBackground = $video => {
  return $video.length > 0;
};

/**
 * Detect video background height
 *
 * @param {Object} $videoWrapper
 * $videoWrapper = header background video wrapper
 */
window.detectVideoBackgroundHeight = $videoWrapper => {
  return $videoWrapper.height();
};

/**
 * Pause video (if it is not)
 *
 * @param {Object} $video
 * $video = handled video element
 */
window.pauseVideo = $video => {
  if (!$video[0].paused) {
    $video[0].pause();
  }
};

/**
 * Resume video (if it is not)
 *
 * @param {Object} $video
 * $video = handled video element
 */
window.resumeVideo = $video => {
  if ($video[0].paused) {
    $video[0].play();
  }
};

/**
 * Pause/resume header video background
 *
 * @param {Object} $video
 * $video = handled video element
 * @param {Object} $videoWrapper
 * $videoWrapper = header background video wrapper
 */
window.handleWithVideo = ($video, $videoWrapper) => {
  var offset = $videoWrapper.offset();
  var scrollTop = $('body').scrollTop();
  if (offset.top + detectVideoBackgroundHeight($videoWrapper) > scrollTop) {
    // video is still in viewport
    resumeVideo($video);
  } else {
    // video is not in viewport
    pauseVideo($video);
  }
};

/*
 * Move element after selector
 */
window.moveElementAfterSelector = ($whatSelector, $whereSelector) => {
  $whatSelector.insertAfter($whereSelector);
};

window.updateQueryStringParameter = (key, value) => {
  var url = window.location.href;
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  var separator = url.indexOf('?') !== -1 ? '&' : '?';

  if (url.match(re)) {
    window.location.href = url.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    window.location.href = url + separator + key + '=' + value;
  }
};

/* Elements available for activating by location hash */
window.availableElementsIds = ['#ratingWrapper'];
window.hashUnveiledElements = [];
window.hashHiddenElements = [];
hashUnveiledElements['#ratingWrapper'] = ['#rate-form'];
hashHiddenElements['#ratingWrapper'] = ['.rate-form-trigger'];

/**
 * Activate tabs by location hash
 *
 * @param {String} elementId
 * tabId = id of activated element
 */
window.unveilElementByHash = elementId => {
  if ($(elementId).parents('.tab-pane').length) {
    var $el = $('[data-toggle="tab"][href="#' + $(elementId).attr('data-parent-tab') + '"]');
    $el.tab('show');
  }
  if ($(hashUnveiledElements[elementId]).length) {
    for (i = 0; i < $(hashUnveiledElements[elementId]).length; i++) {
      $(hashUnveiledElements[elementId][i]).removeClass('js-hidden');
    }
    for (i = 0; i < $(hashHiddenElements[elementId]).length; i++) {
      $(hashHiddenElements[elementId][i]).addClass('js-hidden');
    }
  }
  $(window).load(function () {
    setTimeout(function () {
      scrollToEl($(elementId));
    }, shoptet.config.animationDuration + 1);
  });
};

/**
 * Convert location.search string to JS object
 *
 * This function does not accept any arguments.
 */
window.locationSearchToObject = () => {
  var locationSearch = window.location.search.substring(1).split('&');
  var object = {};

  locationSearch.forEach(function (pair) {
    if (pair !== '') {
      var splittedPair = pair.split('=');
      object[decodeURIComponent(splittedPair[0])] = decodeURIComponent(splittedPair[1]);
    }
  });

  return object;
};

/**
 * Get offset of an element relative to its parent
 *
 * @param {Object} $el
 * $el = element to which we want to get its position
 * @param {Object} $parent
 * $parent = optional parent element
 */
window.getRelativeOffset = ($el, $parent) => {
  if (typeof $parent === 'undefined') {
    $parent = $el.parent();
  }
  var elOffset = $el.offset();
  var parentOffset = $parent.offset();
  var relativeOffset = {};
  relativeOffset.top = elOffset.top - parentOffset.top;
  relativeOffset.left = elOffset.left - parentOffset.left;
  return relativeOffset;
};

window.fixTooltipAfterChange = element => {
  $(element).tooltip('fixTitle').tooltip('setContent');
  if ($(element).hasClass('hovered')) {
    $(element).tooltip('show');
  }
};

window.initDatepickers = () => {
  $('.datepicker.birthdate').each(function () {
    var $elem = $(this);
    $elem.datepicker({
      changeMonth: true,
      changeYear: true,
      yearRange: 'c-110;c:+0',
    });
    if ($elem.data('value')) {
      $elem.datepicker('setDate', new Date($elem.data('value')));
    }
    if ($elem.data('format')) {
      $elem.datepicker('option', 'dateFormat', $elem.data('format'));
    }
  });
};

window.resizeEndCallback = () => {
  setTimeout(function () {
    detectFilters();
  }, 1000);
  shoptet.products.setThumbnailsDirection();
  shoptet.products.checkThumbnails(shoptet.config.thumbnailsDirection, 'set', true);
  if (shoptet.layout.detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
    shoptet.menu.splitMenu();
    if ($('.overlay').length > 0) {
      shoptet.menu.toggleMenu();
    }
  }
  shoptet.products.splitWidgetParameters();

  if ($('.carousel').length) {
    setCarouselHeight($('.carousel-inner'));
  }
  shoptet.modal.shoptetResize();
  addPaddingToOverallWrapper();

  if (typeof shoptet.checkout !== 'undefined' && shoptet.checkout.$checkoutSidebar.length) {
    if (!shoptet.layout.detectResolution(shoptet.config.breakpoints.sm)) {
      shoptet.checkout.$checkoutSidebar.removeAttr('style');
    } else {
      shoptet.checkout.handleWithSidebar();
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if ($('.regions-wrapper').length) {
    shoptet.global.toggleRegionsWrapper();
  }

  $('html').on('change', '#billCountryId, #deliveryCountryId', function () {
    shoptet.global.updateSelectedRegions($(this));
    shoptet.global.toggleRegionsWrapper();
    shoptet.validatorZipCode.updateZipValidPattern($(this));
    shoptet.validatorCompanyId.updateCompanyIdValidPattern();
  });

  var hash = window.location.hash;
  if (hash.length) {
    for (i = 0; i < availableElementsIds.length; i++) {
      availableElementsIds[i];
      if (availableElementsIds[i] === hash) {
        if ($(hash).length) {
          unveilElementByHash(hash);
        }
        break;
      }
    }
  }

  if (!shoptet.layout.detectResolution(shoptet.config.breakpoints.sm)) {
    addPaddingToOverallWrapper();
  }

  detectScrolled('up');

  var lastScrollTop = 0;
  var $headerVideoWrapper = $('#videoWrapper');
  var headerVideoBackgroundExists = detectVideoBackground($headerVideoWrapper);
  if (headerVideoBackgroundExists) {
    var $headerVideo = $('#videoWrapper video');
    setTimeout(function () {
      handleWithVideo($headerVideo, $headerVideoWrapper);
    }, 1000);
  }

  $(window).scroll(
    shoptet.common.throttle(function () {
      if (headerVideoBackgroundExists) {
        handleWithVideo($headerVideo, $headerVideoWrapper);
      }

      var st = $(this).scrollTop();
      if (st > lastScrollTop) {
        // downscroll code
        detectScrolled('down');
      } else {
        // upscroll code
        detectScrolled('up');
      }
      lastScrollTop = st;
    }, 100)
  );

  shoptet.images.unveil();
  $('body').addClass('unveiled');
  if (detectResolution(shoptet.config.breakpoints.sm) && $('.carousel').length) {
    setCarouselHeight($('.carousel-inner'));
    $('body').addClass('carousel-set');
  }

  // Cookies agreement
  $('.CookiesOK').on('click', function (e) {
    e.preventDefault();
    shoptet.cookie.create('CookiesOK', 'agreed', { days: $('.CookiesOK').data('cookie-notice-ttl') });
    $('.cookies').fadeOut(shoptet.config.animationDuration);
    setTimeout(function () {
      $('.cookies').remove();
    }, shoptet.config.animationDuration);
    if ($('.site-msg.information').length && shoptet.abilities.about.id !== '14') {
      $('.site-msg.information').css('bottom', $('.site-msg.information').offset().left);
    }
  });

  // Site agreement
  $('html').on('click', '#site-agree-button', function (e) {
    e.preventDefault();
    shoptet.cookie.create(shoptet.config.agreementCookieName, 'agreed', { days: shoptet.config.agreementCookieExpire });
    shoptet.modal.close();
  });

  // Information banner
  $('.js-close-information-msg').on('click', function () {
    shoptet.cookie.create('informationBanner', '1', { days: 1 });
    $('.site-msg.information').fadeOut(shoptet.config.animationDuration);
    setTimeout(function () {
      $('.site-msg.information').remove();
    }, shoptet.config.animationDuration);
  });

  var sa = $('.site-agreement');
  if (sa.length) {
    if (sa.hasClass('show-only')) {
      var showOnly = true;
    } else {
      var showOnly = false;
    }
    var content = sa.html();
    shoptet.modal.open({
      opacity: '.95',
      closeButton: showOnly,
      overlayClose: showOnly,
      escKey: showOnly,
      html: shoptet.content.colorboxHeader + content + shoptet.content.colorboxFooter,
      className: shoptet.modal.config.classMd,
      width: shoptet.modal.config.widthMd,
      onClosed: function () {
        $('.site-agreement').remove();
        $('#cboxOverlay, #colorbox').removeClass('siteAgreement');
      },
      onComplete: function () {
        $('#cboxOverlay, #colorbox').addClass('siteAgreement');
        shoptet.modal.shoptetResize();
        $('#colorbox img').on('load', function () {
          shoptet.modal.shoptetResize();
        });
      },
    });
  }

  $('html').on('click', '.colorbox-close', function (e) {
    e.preventDefault();
    shoptet.modal.close();
  });

  // Init form validator
  shoptet.validator.initValidator($('form'));

  // Prevent click on disabled links
  $('html').on('click', 'a.disabled', function (e) {
    e.preventDefault();
  });

  // Dismiss messages
  $('html').on('click', '.msg', function () {
    hideMsg();
  });
  $('html').on('click', '.cancel-action', function (e) {
    e.stopPropagation();
  });

  $('html').on('keyup', 'input, textarea', function (e) {
    e.stopPropagation();
  });

  $('#carousel').on('slide.bs.carousel', function () {
    $('#carousel img').each(function () {
      var $this = $(this);
      if ($this.attr('src')) {
        return;
      }
      $this.attr('src', $this.attr('data-src'));
    });
  });

  // Go to detail of a highlighted product, Tango template only
  $('html').on('click', '.js-product-clickable', function (e) {
    e.stopPropagation();
    if ($(e.target).hasClass('js-product-clickable')) {
      window.location.href = $('a.name', this).attr('href');
    }
  });

  // Show/hide more in top products
  $('html').on('click', '.products-top .button-wrapper .toggle-top-products', function (e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.parents().siblings('.inactive').length) {
      $this.parents().siblings('.inactive').addClass('revealed').removeClass('inactive');
    } else {
      $this.parents().siblings('.revealed').addClass('inactive').removeClass('revealed');
    }
    var text = $this.text();
    var hideText = text;
    var showText = $this.attr('data-text');
    toggleText($this, text, showText, hideText);
  });

  $('html').on('click', '.cancel-action', function (e) {
    e.preventDefault();
    id = $(this).attr('data-id');
    if (id === '') {
      cancelAction();
    } else {
      cancelAction(id);
    }
  });

  // Unveil hidden elements
  $('html').on('change, click', '[data-unveil]', function (e) {
    var $this = $(this);
    if ($this.context.localName === 'a') {
      e.preventDefault();
    }
    if ($this.attr('data-unveil') === 'category-filter-hover') {
      $this.parent('.filter-section').hide();
    }
    $('#' + $this.attr('data-unveil')).toggleClass('visible');
    if ($this.attr('data-unveil') === 'filters') {
      if ($('#filters').hasClass('visible')) {
        $('body').addClass('filters-visible');
      } else {
        $('body').removeClass('filters-visible');
      }
    }
    if ($this.parents('.unveil-wrapper').length) {
      $this.parents('.unveil-wrapper').toggleClass('unveiled');
    }
    if ($this.attr('data-text')) {
      toggleText($this, $this.text(), $this.text(), $this.attr('data-text'));
    }
    $('html').trigger('contentResized');
  });

  $('html').on('click', '.js-window-location', function (e) {
    e.preventDefault();
    window.location.href = $(this).attr('data-url');
  });

  // Tooltips
  initTooltips();

  // Colorbox
  initColorbox();

  // Tabs
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var href = e.target.getAttribute('href');
    var external = e.target.getAttribute('data-external');
    var forceScroll = e.target.getAttribute('data-force-scroll');
    var isTab = true;

    // Check for accordion
    var accordionLink = $('.shp-accordion-link[href="' + href + '"]');
    var isAccordion = !!accordionLink.length;
    if (isAccordion) {
      isTab = false;
    }

    // Auto open comment form if no comments exists
    var $discussionForm = $(href).find('#discussion-form');
    if ($discussionForm.length) {
      var $discussionContent = $(href).find('.vote-wrap');
      if (!$discussionContent.length && !$discussionForm.hasClass('visible')) {
        $(href).find('.add-comment').trigger('click');
      }
    }

    // Auto open vote form if no votes exists
    var $rateForm = $(href).find('#rate-form');
    if ($rateForm.length) {
      var $voteContent = $(href).find('.vote-wrap');
      if (!$voteContent.length && !$rateForm.hasClass('visible')) {
        $(href).find('.add-comment').trigger('click');
      }
    }

    if (href === '#productVideos') {
      shoptet.products.unveilProductVideoTab(href);
    }

    if (external) {
      if (isTab) {
        $('.shp-tabs > li').removeClass('active');
        $('.shp-tabs > li > a[href="' + href + '"]')
          .parents('li')
          .addClass('active');
      } else if (isAccordion) {
        accordionLink.closest('.shp-accordion').addClass('active');
        accordionLink.next('.shp-accordion-content').show();
      }
    }

    if (isTab && $(this).parents('.responsive-nav').length > 0) {
      var parentUl = $(this).parents('ul:first');
      $(this).parents('.responsive-nav').find('ul').not(parentUl).find('li').removeClass('active');
    }

    if (forceScroll || !shoptet.layout.detectResolution(shoptet.config.breakpoints.sm)) {
      var scrollEl;
      if (isTab) {
        scrollEl = $(href).closest('.shp-tabs-wrapper');
      } else if (isAccordion) {
        scrollEl = accordionLink;
      }
      scrollToEl(scrollEl);
    }
    shoptet.products.splitWidgetParameters();
  });

  // Unveil videos in active tab
  if ($('.tab-pane.active [data-iframe-src]').length) {
    shoptet.products.unveilProductVideoTab();
  }

  // Toggle categories menu
  var selectorMenuExternal = '#categories .expandable:not(.external) > a > span';
  var selectorMenuTopic = ',#categories .expandable:not(.external) > .topic > a > span';
  var selectorsMenu = selectorMenuExternal + selectorMenuTopic;
  $('html').on('click', selectorsMenu, function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).closest('.expandable').toggleClass('expanded');
  });

  $('html').on('click', '.link-icon.chat, .link-icon.watchdog', function (e) {
    e.preventDefault();
    shoptet.modal.open({
      href: $(this).attr('href'),
      width: shoptet.modal.config.widthSm,
      className: shoptet.modal.config.classSm,
      onComplete: function () {
        shoptet.validator.initValidator($('form'));
        shoptet.watchdog.initWatchdog();
      },
    });
  });

  $('html').on('click', 'a.colorbox, a.p-main-image.cbox', function (e) {
    e.preventDefault();
    shoptet.modal.open({
      href: $(this).attr('href'),
      maxWidth: shoptet.modal.config.maxWidth,
      maxHeight: shoptet.modal.config.maxHeight,
      width: shoptet.modal.config.widthLg,
      className: shoptet.modal.config.classLg,
    });
  });

  // Print page
  $('.link-icon.print').on('click', function (e) {
    e.preventDefault();
    window.print();
  });

  $('html').on('click', '.toggle-contacts', function () {
    toggleContacts($(this));
    $('html').trigger('contentResized');
  });

  $('html').on('click', '.toggle-contacts > a', function (e) {
    e.preventDefault();
  });

  // Open share window by clickin' on social icons
  $('html').on('click', '.share a', function (e) {
    e.preventDefault();
    window.open($(this).attr('href'), '', 'width=600, height=600');
  });

  // Affiliate center
  $('.html-code textarea').click(function () {
    $(this).focus().select();
  });
  $('html').on('click', '.url-generation-box .btn', function () {
    var $container = $(this).closest('.affiliate-banner');
    var $newHtmlCodeContainer = $container.find('.url-generation-box .html-code').clone(true, true);
    var val = new String($newHtmlCodeContainer.find('textarea').val());

    $newHtmlCodeContainer.removeClass('no-display').addClass('generated').find('textarea').val(val);
    $container.find('.generated').remove();
    $container.append($newHtmlCodeContainer);
  });

  if ($('#onlinePaymentButton').length) {
    // Redirect from recapitulation page to provider's online payment after 5 seconds
    if (!$('#onlinePaymentButton').parents('.suspend-redirect').length) {
      var paymentTimeout = setTimeout(function () {
        shoptet.events.paymentButtonClicked = true;
        window.location.href = $('#onlinePaymentButton').attr('href');
      }, 5000);
      shoptet.runtime.resolvePaymentGwRedirectScheduled(true);
    } else {
      shoptet.runtime.resolvePaymentGwRedirectScheduled(false);
    }

    // Confirm before page unload on recapitulation page with online payment button
    $('#onlinePaymentButton').click(function () {
      if (shoptet.events.paymentButtonClicked) {
        return false;
      }

      shoptet.events.paymentButtonClicked = true;
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
      }
    });
    window.onbeforeunload = function () {
      if (typeof shoptet.events.paymentButtonClicked === 'undefined') {
        return '';
      }
    };
  } else {
    shoptet.runtime.resolvePaymentGwRedirectScheduled(false);
  }

  if ($('.query-string-param').length) {
    $('.query-string-param a').click(function (e) {
      e.preventDefault();

      var params = $(this).attr('href').split('=');
      updateQueryStringParameter(params[0], params[1]);
    });
  }

  var search = window.location.search;
  if (search.length) {
    var searchValues = locationSearchToObject();
    if (searchValues.email) {
      $('input[name="email"]').val(searchValues.email);
    }
    if (searchValues.buyerName) {
      $('input[name="fullName"]').val(searchValues.buyerName);
    }
    if (searchValues.preselectStars) {
      var numberOfStars = parseInt(searchValues.preselectStars);

      $('.star-wrap .star').removeClass('star-on current').addClass('star-off');
      $('.rate-list').removeClass('current');
      $('.rate-list .star').removeClass('star-on current').addClass('star-off');
      for (var i = 1; i <= numberOfStars; i++) {
        var ratingElementStar = $('.star-wrap [data-score="' + i + '"]');
        ratingElementStar.removeClass('star-off').addClass('star-on');
        if (i === numberOfStars) {
          ratingElementStar.addClass('current');

          var rateList = $('.rate-list [data-score="' + i + '"]');
          var rateListStar = $('.rate-list[data-score="' + i + '"] .star');
          rateList.addClass('current');
          rateListStar.removeClass('star-off').addClass('star-on');
        }
      }
      $('input[name="score"]').val(numberOfStars);
    }
  }

  $('html').on('click', '.js-scroll-top', function (e) {
    e.preventDefault();
    var $target;
    var $trigger = $(this);
    if (typeof $trigger.attr('data-target') !== 'undefined') {
      $target = $($trigger.attr('data-target'));
    } else {
      if ($('#products').length) {
        $target = $('#products');
      } else if ($('#newsWrapper').length) {
        $target = $('#newsWrapper');
      } else if ($('#ratingWrapper').length) {
        $target = $('#ratingWrapper');
      } else if ($('.products').length) {
        $target = $('.products');
      }
    }

    if ($target.length === 0) {
      return false;
    }

    scrollToEl($target);
  });

  $('html').on('click', '.toggle-coupon-input-button', function (e) {
    $(this).next('.discount-coupon').slideToggle();
    $(this).toggleClass('discount-coupon-visible');
  });

  $(window).load(function () {
    $('.cart-toggle-unselected-options').addClass('js-hidden');
  });

  $('html').on('click', '.cart-toggle-unselected-options', function (e) {
    $(this).addClass('js-hidden');
    var dataTableId = $(this).data('table');
    $('#' + dataTableId + ' .radio-wrapper').removeClass('selected-option unselected-option');
  });

  initDatepickers();

  if ($('.site-msg.information').length && $('.site-msg.cookies').length && shoptet.abilities.about.id !== '14') {
    var msgOffset = $('.cookie-ag-wrap').outerHeight() + $('.site-msg.information').offset().left;
    $('.site-msg.information').css('bottom', msgOffset);
  }

  /* thumbnail function override */
  $('.show360image').on('click', function () {
    $('.p-thumbnails-inner a.p-thumbnail').removeClass('highlighted');
    $(this).addClass('highlighted');
    $(this).parents('.p-image-wrapper').find('.p-image').hide();
    $(this).parents('.p-image-wrapper').find('.image360').show();
  });

  $('html').on('click', '.js-cookies-settings', function (e) {
    e.preventDefault();
    shoptet.consent.openCookiesSettingModal();
  });

  $('html').on('click', '.js-cookiesConsentSubmit', function (e) {
    e.preventDefault();
    shoptet.consent.cookiesConsentSubmit(this.value);
  });

  // Fix for fixed-width tables and with overflow
  const addScrollWrapper = table => {
    const scrollWrapper = document.createElement('div');
    scrollWrapper.classList.add('scroll-wrapper');
    table.parentElement.insertBefore(scrollWrapper, table);
    scrollWrapper.appendChild(table);
  };

  const removeScrollWrapper = table => {
    const scrollWrapper = table.parentElement;
    scrollWrapper.parentElement.insertBefore(table, scrollWrapper);
    scrollWrapper.remove();
  };

  const handleTableOverflow = () => {
    const tables = document.querySelectorAll(
      '.p-short-description table, .basic-description table, .descr-text table, .description table, .category-perex table, .category__secondDescription table, .type-manufacturer-detail .content table, .welcome table, .type-page article table, .news-item-detail table, .type-posts-listing .content table'
    );

    tables.forEach(table => {
      const hasScrollWrapper = table.parentElement.classList.contains('scroll-wrapper');
      const isOverflowing = table.offsetWidth > table.parentElement.offsetWidth;

      if (hasScrollWrapper && !isOverflowing) {
        removeScrollWrapper(table);
      } else if (!hasScrollWrapper && isOverflowing) {
        addScrollWrapper(table);
      }
    });
  };
  handleTableOverflow();
  document.addEventListener('ShoptetDOMPageContentLoaded', () => handleTableOverflow());
  document.addEventListener('resizeEnd', () => handleTableOverflow());
});

// Necessary for split/simple variants - unify with 2nd gen
window.resolveImageFormat = () => {
  return true;
};

(function (shoptet) {
  /**
   * Update regions by clickin' on "Another shipping" in ordering process
   *
   * @param {Object} $el
   * $el = Country select element which has changed
   */
  function updateSelectedRegions($el) {
    if ($el.attr('id') === 'billCountryId') {
      inputPrefix = 'bill';
      $('#billCountryIdInput').attr('disabled', true);
    } else if ($el.attr('id') === 'deliveryCountryId') {
      var inputPrefix = 'delivery';
      $('#deliveryCountryIdInput').attr('disabled', true);
    } else {
      return false;
    }

    var id = $el.find('option:selected').val();
    $('.region-select')
      .attr({
        disabled: true,
        id: '',
        name: '',
      })
      .addClass('hide');
    $('.region-select[data-country="' + id + '"]')
      .attr({
        disabled: false,
        id: inputPrefix + 'RegionId',
        name: inputPrefix + 'RegionId',
      })
      .removeClass('hide');
  }

  /**
   * Toggle regions wrapper
   *
   * This function does not accept any arguments.
   */
  function toggleRegionsWrapper() {
    var $regionsWrapper = $('.regions-wrapper');
    var allRegions = $regionsWrapper.find('select');
    var invisibleRegions = $regionsWrapper.find('select.hide');
    if (allRegions.length > invisibleRegions.length) {
      $regionsWrapper.show();
    } else {
      $regionsWrapper.hide();
    }
  }

  /**
   * Restore default regions by clickin' on "Another shipping" in ordering process
   *
   * @param {Object} $el
   * $el = Default region select
   * @param {String} val
   * val = Default region value
   */
  function restoreDefaultRegionSelect($el, val) {
    $('#billRegionIdInput').val(val);
    $('.region-select').addClass('hide');
    $el.removeClass('hide');
    shoptet.global.toggleRegionsWrapper();
  }

  /**
   * Toggle another shipping address in 2nd step of order
   *
   * This function does not accept any arguments.
   */
  function toggleAnotherShipping(scroll) {
    if (typeof scroll === 'undefined') {
      scroll = true;
    }
    var $el = $('#shipping-address');
    var $billCountryId = $('#billCountryId');
    var $regionSelect = $('.region-select');

    if ($el.hasClass('visible')) {
      $el.removeClass('visible');
      toggleRequiredAttributes($el, 'remove', false);

      var defaultCountryVal = $billCountryId.find('option[data-default-option]').val();
      var defaultRegionVal = $regionSelect.find('option[data-default-option]').val();
      var $defaultBillRegionId = $('.region-select[data-country=' + defaultCountryVal + ']');
      $billCountryId.val(defaultCountryVal);
      $defaultBillRegionId.val(defaultRegionVal);
      shoptet.global.restoreDefaultRegionSelect($defaultBillRegionId, defaultRegionVal);
      shoptet.validatorZipCode.updateZipValidPattern($billCountryId);
      shoptet.validatorCompanyId.updateCompanyIdValidPattern();
    } else {
      $el.addClass('visible');
      toggleRequiredAttributes($el, 'add', false);
      if (scroll) {
        setTimeout(() => {
          scrollToEl($el);
        }, shoptet.config.animationDuration);
      }
    }

    var $billRegionId = $('#billRegionId');
    var $billRegionIdInput = $('#billRegionIdInput');
    var $billCountryIdInput = $('#billCountryIdInput');

    $billCountryId.attr('disabled', !$billCountryId.is(':disabled'));
    $regionSelect.attr('disabled', $billRegionIdInput.is(':disabled'));

    $billCountryIdInput.attr({
      disabled: !$billCountryIdInput.is(':disabled'),
      value: $billCountryId.find('option:selected').val(),
    });
    $billRegionIdInput.attr({
      disabled: !$billRegionIdInput.is(':disabled'),
      value: $billRegionId.find('option:selected').val(),
    });
    $('#deliveryRegionId').attr({
      value: $billRegionId.find('option:selected').val(),
    });

    if (shoptet.abilities.feature.smart_labels) {
      setTimeout(function () {
        $('.smart-label-wrapper').SmartLabels();
      }, 0);
    }
  }

  shoptet.global = shoptet.global || {};
  shoptet.global.showPopupWindow = (target, show) => {
    shoptet.dev.deprecated('2025-12-31', 'shoptet.global.showPopupWindow()', 'shoptet.popups.showPopupWindow()');
    return shoptet.popups.showPopupWindow(target, show);
  };
  shoptet.global.hideContentWindows = target => {
    shoptet.dev.deprecated('2025-12-31', 'shoptet.global.hideContentWindows()', 'shoptet.popups.hideContentWindows()');
    return shoptet.popups.hideContentWindows(target);
  };

  shoptet.scripts.libs.global.forEach(fnName => {
    const fn = eval(fnName);
    shoptet.scripts.registerFunction(fn, 'global');
  });
})(shoptet);
