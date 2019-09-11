{block name="navigationButtons"}
    <div class="navigation-buttons">
        {include file=$layout->getTemplate("layout/navigation/currency.tpl")}
        <a href="#" class="toggle-window" data-target="search"><span class="sr-only">{t}Search{/t}</span></a>
        {if $modules->isActive("users") || $modules->isActive("affiliate")}
            {include file=$layout->getTemplate("layout/navigation/loginLinks.tpl")}
        {/if}
        <a href="{$url->getCartUrl()|escape}" class="toggle-window cart-count" data-target="cart" rel="nofollow"><span class="sr-only">{t}Shopping cart{/t}</span>{include file=$layout->getRootTemplate("layout/cart/sub/cartCount.tpl")}</a>
        <a href="#" class="toggle-window" data-target="navigation"><span class="sr-only">{t}Menu{/t}</span></a>
    </div>
{/block}
