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
        var i = 0;
        var $menuHelper = $('.menu-helper');
        var menuHelperOffset = $menuHelper.length ? $menuHelper.offset() : 0;
        $('#navigation').removeClass('fitted');
        $('.navigation-in > ul > li').each(function() {
            var $el = $(this);
            var width = $el.outerWidth();
            var offset = $el.offset();
            if ((width + offset.left) > menuHelperOffset.left) {
                $el.addClass('splitted');
            } else {
                $el.removeClass('splitted');
                i++;
            }
        });
        if (i === $('.navigation-in > ul > li').length) {
            $('#navigation').addClass('fitted');
        }
        shoptet.menu.splitHelperMenu(i);
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
        $('#navigation .ext, .menu-helper .ext').removeClass('exp');
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
     * Toggle menu helper box visibility
     *
     * This function does not accept any arguments.
     */
    function toggleMenuHelper() {
        $('body').toggleClass('user-action-visible menu-helper-visible');
    }

    /**
     * Hide navigation
     *
     * This function does not accept any arguments.
     */
    function hideNavigation() {
        $('body').removeClass('user-action-visible navigation-window-visible');
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
        $('.navigation-in > ul').clone().appendTo('.menu-helper');

        shoptet.runtime.menuHelper = false;
        $html.on('mouseenter', '.menu-helper', function() {
            shoptet.runtime.menuHelper = setTimeout(function() {
                shoptet.menu.toggleMenuHelper();
            }, shoptet.config.animationDuration / 2);
        });

        $html.on('mouseleave', '.menu-helper', function() {
            clearTimeout(shoptet.runtime.menuHelper);
        });

        $html.on('click', '.menu-helper', function() {
            clearTimeout(shoptet.runtime.menuHelper);
            shoptet.menu.toggleMenuHelper();
        });

        if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
            shoptet.menu.splitMenu();
            shoptet.menu.updateMenu();
        }

        // Toggle submenu
        $html.on('touchstart', '#navigation, .navigation-buttons a', function (e) {
            e.stopPropagation();
        });

        $html.on('click', '#navigation .ext > a > span, .menu-helper .ext > a > span', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $this = $(this);
            var submenuVisible = $('body').hasClass('submenu-visible');
            var parentSubmenuVisible = $this.parents('li').hasClass('exp');
            setTimeout(function () {
                if (
                    !detectResolution(shoptet.abilities.config.navigation_breakpoint)
                    && submenuVisible
                    && parentSubmenuVisible
                ) {
                    shoptet.menu.hideSubmenu();
                } else {
                    shoptet.menu.hideSubmenu();
                    shoptet.menu.showSubmenu($this.parents('li'));
                }
            }, 1);
        });

        $html.on('mouseenter', '#navigation .ext > a > span, .menu-helper .ext > a > span', function (e) {
            if (!detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
                e.stopPropagation();
            }
        });

        $html.on('mouseenter', '#navigation .ext, .menu-helper .ext', function () {
            var $this = $(this);
            setTimeout(function () {
                var $itemHovered = $this.parent().find(':hover');
                if (!$itemHovered.length > 0 || $itemHovered.index() !== $this.index()) {
                    return false;
                } else {
                    shoptet.menu.showSubmenu($this);
                }
            }, shoptet.config.animationDuration / 2);
        });

        $html.on('mouseleave', '#navigation .ext, .menu-helper .ext', function () {
            if (detectResolution(shoptet.abilities.config.navigation_breakpoint)) {
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
