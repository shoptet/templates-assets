/*
<div class="shp-accordion{$activeTab}">
    <a href="#tabName" class="shp-accordion-link">{t}Tab Name{/t}</a>
    <div class="shp-accordion-content"> tab content </div>
</div>
*/

if (shoptet.abilities.feature.tabs_accordion) {
    $(document).ready(function(){
        $(".shp-accordion.active .shp-accordion-content").show();

        $(".shp-accordion-link").click(function(e) {
            var href = e.target.getAttribute('href');
            $(this).parent().toggleClass("active");
            $(this).next(".shp-accordion-content").slideToggle();

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
