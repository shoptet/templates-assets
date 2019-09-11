{block name="afterHeader"}{/block}
{block name="breadcrumbNavTop"}{/block}

<div id="content-wrapper" class="content-wrapper{if $layout->displayLeftColumn() || $layout->isRightColumn()} container{/if}">

    {block name="breadcrumbNav"}
        {if $page->indexName != "index" && !isset($orderingProcess)}
            {assign var="breadcrumbNavigation" value=$layout->getBreadcrumbNavigation() scope="global"}
            {include file=$layout->getTemplate("layout/navigation/breadcrumbNavigation.tpl")}
        {/if}
    {/block}

    <div class="content-wrapper-in">
        {block name="leftPanel"}
            {if ($layout->displayLeftColumn() && empty($orderingProcess)) || (!empty($orderingProcess) && $abilities->has("elements.back_in_ordering_process"))}
                <aside class="sidebar sidebar-left{if $page->isCustomerPage() || $page->isAffiliatePage()} sidebar-visible{/if}">
                  {if !isset($orderingProcess)}
                      {include file=$layout->getTemplate("layout/sidebar/leftColumn.tpl")}
                  {else}
                      {include file=$layout->getTemplate("layout/cart/sub/continueShopping.tpl")}
                  {/if}
                </aside>
            {/if}
        {/block}

        {block name="mainPanel"}
            <main id="content" class="content{if !$layout->isLeftColumn() && !$layout->isRightColumn()} wide{else} narrow{/if}">
                {if isset($orderingProcess)}
                    {include file=$layout->getTemplate("elements/steps.tpl")}
                {/if}
                {if $page->indexName == "index"}
                    {include file=$layout->getTemplate("content/index.tpl")}
                {else}
                    {include file=$layout->getTemplate($page->template.content)}
                {/if}
            </main>
        {/block}

        {block name="rightPanel"}
            {if $layout->isRightColumn() && $page->displayType != "productDetail" && empty($orderingProcess)}
                <aside class="sidebar sidebar-right">
                    {include file=$layout->getTemplate("layout/sidebar/rightColumn.tpl")}
                </aside>
            {/if}
        {/block}

    </div>

    {block name="contentWindows"}
        {if !isset($orderingProcess)}
            <div class="content-window cart-window">
                <div class="content-window-in cart-window-in">
                    {block name="cartWindow"}
                        {include file=$layout->getTemplate("elements/windowCart.tpl")}
                    {/block}
                </div>
            </div>

            <div class="content-window search-window" itemscope itemtype="https://schema.org/WebSite">
                {include file=$layout->getTemplate("microdata/website.tpl")}
                <div class="content-window-in search-window-in">
                    {block name="searchWindow"}
                        {include file=$layout->getTemplate("elements/windowSearch.tpl")}
                    {/block}
                </div>
            </div>
        {/if}
    {/block}

</div>
