{include file=$layout->getRootTemplate("layout/product/sub/productDetail/productTop.tpl")}

{* p-detail-inner class is necessary for correct function of parameter dependent elements *}
<div class="p-detail-inner{if $product->has360Images()} image360-parent{/if}">

    <div class="p-data-wrapper">
        <div class="p-detail-inner-header">
            {include file=$layout->getTemplate('elements/ratings.tpl')}
            <h1>
                {$product->plainProductName|escape}
                {if !empty($product->appendix)}<span class="product-appendix">{$product->appendix|escape}</span>{/if}
            </h1>


        </div>

        {if isset($product->shortDescription) &&!empty($product->shortDescription)}
            <div class="p-short-description">
                {$product->shortDescription|safeHtml}
            </div>
        {/if}


        <form action="/action/Cart/addCartItem/" method="post" id="product-detail-form" class="pr-action" data-codeid="{$product->stock->id|escape}">
            {include file=$layout->getRootTemplate("microdata/product.tpl")}

            <div class="p-variants-block">
            {if !$displayTableVariants}
                <table class="detail-parameters">
                    <tbody>
                    {if $displaySimpleVariants}
                        <tr class="variant-list variant-not-chosen-anchor">
                            <th>
                                {t}Variant{/t}
                            </th>
                            <td>
                                <div id="simple-variants" class="clearfix">
                                    {if $advancedFilter}
                                        {include file=$layout->getSharedTemplate("layout/product/sub/productDetail/simpleVariantInputs.tpl")}
                                    {else}
                                        {include file=$layout->getSharedTemplate("layout/product/sub/productDetail/simpleVariantSelect.tpl")}
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {elseif $displaySplitVariants}
                        {* split variants view *}
                        {foreach from=$variants key="priorityGroup" item="parameter"}
                            <tr class="variant-list variant-not-chosen-anchor">
                                <th>
                                    {$parameter.name|escape}
                                </th>
                                <td>
                                    {if $parameter.advancedFilter}
                                        {include file=$layout->getSharedTemplate("layout/product/sub/productDetail/splitVariantInputs.tpl")}
                                    {else}
                                        {include file=$layout->getSharedTemplate("layout/product/sub/productDetail/splitVariantSelect.tpl")}
                                    {/if}
                                </td>
                            </tr>
                        {/foreach}
                    {/if}
                    {include file=$layout->getRootTemplate("layout/product/sub/productDetail/rows/sizeId.tpl")}
                    {if $smarty.const.SHOW_DELIVERY_DATE_PRODUCT_DETAIL != 0 && $stock->availability.deliveryDateTime != NULL}
                        <tr>
                            <th>
                                <span class="delivery-time-label">{t}Delivery to{/t}:</span>
                            </th>
                            <td>
                                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/deliveryDate.tpl")}
                            </td>
                        </tr>
                    {/if}
                    {include file=$layout->getRootTemplate("layout/product/sub/productDetail/rows/soldOut.tpl")}
                    </tbody>
                </table>
            {else}
                {if !empty($variants)}
                    <p>
                        <a href="#variants" id="choose-variant" class="btn btn-primary" data-toggle="tab" data-external="1" data-force-scroll="1">{t}Choose variant{/t}</a>
                    </p>
                {/if}
                {if $product->isSizeIdAvailable()}
                    <table class="detail-parameters">
                        <tbody>
                            {include file=$layout->getRootTemplate("layout/product/sub/productDetail/rows/sizeId.tpl")}
                        </tbody>
                    </table>
                {/if}
            {/if}
        </div>



        <div class="p-basic-info-block">
            <div class="block">
            {*ava*}
            {if ((!empty($stock->availability) && !$product->hasVariants()) || $displaySplitVariants || $displaySimpleVariants) && $smarty.const.DISPLAY_AVAILABILITY_IN_DETAIL != 0}
                        {include file=$layout->getRootTemplate("layout/product/sub/productDetail/availability.tpl")}
            {/if}
            </div>
            <div class="block">
                {*productCode*}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/productCode.tpl")}
            </div>
            <div class="block">
                {*manufacturer*}
                {if $smarty.const.DISPLAY_MANUFACTURER_IN_DETAIL == 1 && !empty($product->manufacturer)}
                    <span class="p-manufacturer-label">{t}Brand{/t}: </span> <a href="{$product->manufacturer->url|escape}" title="{t}Go to manufacturer detail page{/t}">{$product->manufacturer->name|escape}</a>
                {/if}
            </div>
        </div>

        <div class="p-to-cart-block">
        {if $layout->showPriceIn("productDetail")}
            <div class="p-final-price-wrapper">
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/standardPrice.tpl")}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/savePrice.tpl") youSaveSign="&ndash;" emptyString="-"}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/finalPrice.tpl")}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/additionalPrice.tpl")}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/measurePrice.tpl")}
            </div>
        {/if}
            <div class="p-add-to-cart-wrapper">
        {if !$displayTableVariants}
            {include file=$layout->getTemplate("layout/product/sub/productDetail/addToCart.tpl")}
        {/if}
            </div>
        </div>


        </form>

        <div class="p-param-block">
            <div class="detail-parameters-wrapper">
                <table class="detail-parameters second">
                    {include file=$layout->getRootTemplate("layout/product/sub/productDetail/rows/rows.tpl") hideCategory=TRUE}
                </table>
            </div>
            <div class="social-buttons-wrapper">
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/linkIcons.tpl")}
                {include file=$layout->getRootTemplate("layout/product/sub/productDetail/shareButtons.tpl")}
            </div>
        </div>


        {include file=$layout->getRootTemplate("layout/product/sub/productDetail/cofidis.tpl")}
        {include file=$layout->getRootTemplate("arrange/hledejCenyCz.tpl")}
    </div>



    <div class="p-image-wrapper">
        {include file=$layout->getSharedTemplate("layout/product/sub/productDetail/mainImage360.tpl")}

        <div class="p-image" style="{if $product->has360Images()}display:none;{/if}">
            {include file=$layout->getRootTemplate("layout/product/sub/productDetail/mainImageZoom.tpl")}
            {include file=$layout->getTemplate("layout/product/sub/productDetail/flags.tpl")}
            {include file=$layout->getRootTemplate("layout/product/sub/innerDiscounts.tpl") source=$product pageType="detail"}
        </div>
        <div class="row">
            {include file=$layout->getTemplate("layout/product/sub/productDetail/imageThumbnails.tpl") width=false height=false}
        </div>

    </div>

</div>
{* unset variable $variantsFrom right after .p-detail-inner div
is necessary for correct function of parameter dependent elements *}
{assign var="variantsFrom" value=FALSE scope="parent"}




  {include
      file=$layout->getRootTemplate("layout/product/sub/productDetail/tabs/tabsContent.tpl")
      tabsWrapperClass="col-sm-12 "
      tabsContentWrapperClass="col-sm-12 "
      relatedProductsClass="products products-block products-additional"
      alternativeProductsClass="products products-block products-additional"
  }
