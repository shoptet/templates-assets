(function(shoptet) {

    document.addEventListener('DOMContentLoaded', function() {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('update_management_preview')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        var menus = document.querySelectorAll('.admin-bar #bar-menu > li');
        for (var i = 0; i < menus.length; i++) {
            menus[i].addEventListener('mouseenter', function(e) {
                clearTimeout(shoptet.runtime.adminBar);
                for (i = 0; i < menus.length; i++) {
                    menus[i].classList.remove('hover');
                }
                e.target.classList.add('hover');
            });

            menus[i].addEventListener('mouseleave', function(e) {
                clearTimeout(shoptet.runtime.adminBar);
                var menus = $('#bar-menu > li')
                shoptet.runtime.adminBar = setTimeout(
                    function() {
                        for (i = 0; i < menus.length; i++) {
                            menus[i].classList.remove('hover');
                        }
                    }, shoptet.config.adminBarTimeout
                )
            });

        }
    });

    shoptet.adminBar = shoptet.adminBar || {};

})(shoptet);
