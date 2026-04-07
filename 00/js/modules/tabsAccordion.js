/*
<div class="shp-accordion{$activeTab}">
    <a href="#tabName" class="shp-accordion-link">{tc}Tab Name{/tc}</a>
    <div class="shp-accordion-content"> tab content </div>
</div>
*/

if (shoptet.abilities.feature.tabs_accordion) {
    $(document).ready(function(){
        $(".shp-accordion.active .shp-accordion-content").show();

        $(".shp-accordion-link").click(function(e) {
            var href = e.target.getAttribute('href');
            var $accordion = $(this).parent();
            $accordion.toggleClass("active");
            $(this).next(".shp-accordion-content").slideToggle();

            var isActive = $accordion.hasClass("active");
            $(this).attr('aria-expanded', isActive ? 'true' : 'false');

            if (href === '#productVideos') {
                shoptet.products.unveilProductVideoTab(href);
            }

            return false;
        });

        // Unveil videos in active tab
        if ($('.shp-accordion.active [data-iframe-src]').length) {
            shoptet.products.unveilProductVideoTab();
        }
    });
}
