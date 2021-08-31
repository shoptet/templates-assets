(function(shoptet) {

    /**
     * Toggle menu
     *
     * This function does not accept any arguments.
     */
    function toggleMenu() {
        if ($('.overlay').length === 0) {
            $('<div class="overlay" />').appendTo('body');
        } else {
            $('.overlay:not(.spinner)').detach();
        }
    }

    /**
     * Split menu when menu items don't fit the header
     *
     *
     * This function does not accept any arguments.
     */
    function splitMenu() {
        var i;
        var $menuHelper = $('.menu-helper');
        var $items = $('.navigation-in .menu-level-1 > li:visible');
        var menuHelperOffset = $menuHelper.length ? $menuHelper.offset() : 0;
        var navigElems = [];
        $('#navigation').removeClass('fitted');
        $items.each(function() {
            var $el = $(this);
            var elemPos = $el.outerWidth() + $el.offset().left;
            $el.removeClass('splitted');
            navigElems.unshift({$el: $el, elemPos: elemPos});
        });
        for(i = 0; i < navigElems.length; i++) {
            if(navigElems[i].elemPos > menuHelperOffset.left) {
                navigElems[i].$el.addClass('splitted');
            } else {
                break;
            }
        }
        if (i === 0) {
            $('#navigation').addClass('fitted');
        }
        shoptet.menu.splitHelperMenu($('.navigation-in .menu-level-1 > li').length - i);
    }

    /**
     * Split menu helper items to avoid duplicities
     *
     * @param {Number} i
     * i = number of visible items in main menu
     */
    function splitHelperMenu(i) {
        var numberOfAppendedCategories = $('.menu-helper .appended-category').length;
        $li = $('.menu-helper > ul > li');
        $li.each(function (index) {
            $this = $(this);
            if (i > index + numberOfAppendedCategories) {
                $this.addClass('splitted');
            } else {
                $this.removeClass('splitted');
            }
        });
        if (
            $li.length - numberOfAppendedCategories === $('.menu-helper > ul > li.splitted').length
        ) {
            $('.menu-helper').addClass('empty');
        } else {
            $('.menu-helper').removeClass('empty');
        }
    }

    /**
     * Show submenu
     *
     * @param {Object} $el
     * $el = HTML element containing submenu to display
     */
    function showSubmenu($el) {
        $el.addClass('exp');
        $('body').addClass('submenu-visible');
        $('.has-third-level ul').removeClass('has-more-items').find('.more-items-trigger').detach();
        if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
            var $thirdLevelMenu = $el.find('.has-third-level ul');
            if ($thirdLevelMenu.length) {
                $('.has-third-level ul').removeClass('has-more-items');
                $thirdLevelMenu.each(function () {
                    var $lastLi = $(this).find('li:last-child');
                    var lastLiOffset = getRelativeOffset($lastLi);
                    var lastLiBottomLine = lastLiOffset.top + $lastLi.height();
                    if (lastLiBottomLine > $(this).height()) {
                        $(this).addClass('has-more-items').append('<span class="more-items-trigger" />');
                    }
                });
            }
            if (shoptet.abilities.feature.images_in_menu) {
                $el.find('img').trigger('unveil');
            }
        }
    }

    /**
     * Hide submenu
     *
     * This function does not accept any arguments.
     */
    function hideSubmenu() {
        $('.menu-level-1 .ext').removeClass('exp');
        $('body').removeClass('submenu-visible');
    }

    /**
     * Update menu by new split when fonts are active
     *
     * This function does not accept any arguments.
     */
    function updateMenu() {
        clearTimeout(shoptet.runtime.updateMenu);
        if ($('html').hasClass('external-fonts-loaded')) {
            shoptet.menu.splitMenu();
        } else {
            shoptet.runtime.updateMenu = setTimeout(shoptet.menu.updateMenu, 100);
        }
    }

    /**
     * Show menu helper box
     *
     * This function does not accept any arguments.
     */
    function showMenuHelper() {
        $('body').addClass('user-action-visible menu-helper-visible');
    }

    /**
     * Hide menu helper box
     *
     * This function does not accept any arguments.
     */
    function hideMenuHelper() {
        $('body').removeClass('user-action-visible menu-helper-visible submenu-visible');
        $('.menu-helper .ext').removeClass('exp');
    }


    /**
     * Hide navigation
     *
     * This function does not accept any arguments.
     */
    function hideNavigation() {
        $('body').removeClass('user-action-visible submenu-visible navigation-window-visible');
        $('#navigation .exp').removeClass('exp');
    }

    $(function() {

        var $html = $('html');

        $html.on('click', '.overlay:not(.spinner)', function () {
            shoptet.menu.toggleMenu();
            shoptet.menu.hideNavigation();
            if ($(this).hasClass('visible')) {
                hideMsg();
            }
        });

        // Menu helper
        $('.navigation-in .menu-level-1').clone().appendTo('.menu-helper');

        shoptet.runtime.menuHelper = false;
        $html.on('mouseenter', '.menu-helper', function() {
            clearTimeout(shoptet.runtime.menuHelper);
            shoptet.runtime.menuHelper = setTimeout(function() {
                if (!$('body').hasClass('menu-helper-visible')) {
                    shoptet.menu.showMenuHelper();
                }
            }, shoptet.config.animationDuration);
        });

        $html.on('mouseleave', '.menu-helper', function() {
            clearTimeout(shoptet.runtime.menuHelper);
            shoptet.runtime.menuHelper = setTimeout(function() {
                shoptet.menu.hideMenuHelper();
            }, shoptet.config.animationDuration);
        });

        $html.on('click', '.menu-helper', function() {
            clearTimeout(shoptet.runtime.menuHelper);
            if ($('body').hasClass('menu-helper-visible')) {
                shoptet.menu.hideMenuHelper();
            } else {
                shoptet.menu.showMenuHelper();
            }
        });

        if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
            shoptet.menu.updateMenu();
        }

        // Toggle submenu
        $html.on('touchstart', '#navigation, .navigation-buttons a:not(".js-languagesMenu__list__link")', function (e) {
            e.stopPropagation();
        });

        $('.js-languagesMenu__list__link').unbind();
        $html.on('click touchstart', '.js-languagesMenu__list__link', function() {
            window.location = this.href;
            return false;
        });

        $html.on('mouseenter', '.menu-level-1 .ext > a > span', function (e) {
            e.stopPropagation();
        });

        $html.on('click', '.menu-level-1 .ext > a > span, .navigationActions .ext > a', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $this = $(this);
            var parentSubmenuVisible = $this.parents('li').hasClass('exp');
            setTimeout(function() {
                if (parentSubmenuVisible) {
                    $this.parents('li').removeClass('exp');
                } else {
                    shoptet.menu.showSubmenu($this.parents('li'));
                }
            }, 1);
            clearTimeout(shoptet.runtime.submenu);
        });

        shoptet.runtime.submenu = false;

        /* Remove version conditional when versioning is removed from the system and leave detectResolution only */
        $html.on('mouseover', '.menu-level-1 .ext', function () {
            if (shoptet.config.mobileHeaderVersion !== '1'
                || detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
                var $this = $(this);
                clearTimeout(shoptet.runtime.submenu);
                shoptet.runtime.submenu = setTimeout(function() {
                    if (!$this.hasClass('exp')) {
                        shoptet.menu.showSubmenu($this);
                    }
                }, shoptet.config.submenuTimeout);
            }
        });

        $html.on('mouseleave', '.menu-level-1 .ext', function () {
            if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
                clearTimeout(shoptet.runtime.submenu);
                shoptet.menu.hideSubmenu();
            }
        });

        $html.on('click', '.menu-level-1 .ext a', function () {
            if ($(this).parent().hasClass('ext')) {
                clearTimeout(shoptet.runtime.submenu);
                shoptet.menu.hideSubmenu();
            }
        });

        $html.on('touchstart click', '.navigation-close', function () {
            shoptet.menu.hideNavigation();
        });

        // More items link in 3rd level menu
        $html.on('click', '.more-items-trigger', function () {
            location.replace($(this).closest('ul').prev('a').attr('href'));
        });

    });

    shoptet.menu = shoptet.menu || {};
    shoptet.scripts.libs.menu.forEach(function(fnName) {
        var fn = eval(fnName);
        shoptet.scripts.registerFunction(fn, 'menu');
    });

})(shoptet);
