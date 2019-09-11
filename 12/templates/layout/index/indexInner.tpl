{include file=$layout->getRootTemplate("layout/index/homepageCarouselVertical.tpl")}

<div class="index-content-wrapper">
    {include file=$layout->getRootTemplate("layout/index/bannersBody.tpl") bannersCount=4}

    <div class="shp-tabs-wrapper homepage-tabs-wrapper">
        {include file=$layout->getRootTemplate("layout/index/tabs/homepageTabs.tpl")}
        {include file=$layout->getRootTemplate("layout/index/tabs/homepageTabsContent.tpl")}
    </div>

    <div class="homepage-texts-wrapper">
        {include file=$layout->getRootTemplate("layout/index/welcome.tpl")}
        {include file=$layout->getRootTemplate("elements/topProducts.tpl")}
    </div>

    {include file=$layout->getRootTemplate("layout/index/bannersFooter.tpl")}
</div>
