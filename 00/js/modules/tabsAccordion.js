/*
<div class="shp-accordion{$activeTab}">
    <a href="#tabName" class="shp-accordion-link">{t}Tab Name{/t}</a>
    <div class="shp-accordion-content"> tab content </div>
</div>
*/

if (shoptet.abilities.feature.tabs_accordion) {
    $(document).ready(function(){
        $(".shp-accordion").addClass('active');
        $(".shp-accordion.active .shp-accordion-content").show();

        $(".shp-accordion-link").click(function() {
            $(this).parent().toggleClass("active");
            $(this).next(".shp-accordion-content").slideToggle();
            return false;
        });
    });
}
