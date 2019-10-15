if (shoptet.abilities.feature.top_navigation_menu) {
    function topMenuFits() {
        var $topMenuWrapper = $('.top-navigation-menu');
        if(!detectResolution(shoptet.config.breakpoints.sm) && !$topMenuWrapper.is(':visible')) {
            return false;
        }
        var fits = true;
        $('.top-navigation-bar-menu li').removeClass('cropped');
        $('.top-navigation-bar-menu-helper').empty();
        $('.top-navigation-bar-menu li').each(function() {
            var liPosition = $(this).position();
            var liWidth = $(this).outerWidth();
            if ((liPosition.left + liWidth) > $topMenuWrapper.width()) {
                $(this).addClass('cropped');
                $(this).nextAll().addClass('cropped');
                $(this).parents('ul').find('.cropped').clone().appendTo('.top-navigation-bar-menu-helper');
                fits = false;
                return false;
            }
        });

        return fits;
    }

    function showTopMenuTrigger() {
        $('body').addClass('top-menu-trigger-visible');
    }

    function hideTopMenuTrigger() {
        $('body').removeClass('top-menu-trigger-visible');
    }

    $(document).on('menuUnveiled resizeEnd', function() {
        if (topMenuFits()) {
            hideTopMenuTrigger();
        } else {
            showTopMenuTrigger();
        }
    });

    $(document).on('click', function() {
        $('body').removeClass('top-navigation-menu-visible');
    });

    $(document).ready(function() {

        $('html').on('click', '.top-navigation-menu-trigger', function(e) {
            e.stopPropagation();
            $('body').toggleClass('top-navigation-menu-visible');
        });

        if (topMenuFits()) {
            hideTopMenuTrigger();
        } else {
            showTopMenuTrigger();
        }

    });
}
