{extends file=$layout->getRootTemplate("layout/product/product.tpl")}
{block name="break"}
    {assign var=break value=6}
    {if $columnCount == 4}
        {$break = 12}
    {/if}
{/block}
