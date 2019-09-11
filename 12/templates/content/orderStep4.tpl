{extends file=$layout->getRootTemplate("content/orderStep4.tpl")}

{block name="recapitulationTable"}

    <div class="co-box co-payment-method">

        <h4 class="order-icon order-payment">{t}Payment and delivery{/t}</h4>

        <div class="row">
            {include file=$layout->getTemplate("layout/cart/sub/recapitulation/recapitulationTable.tpl")}
            {if !empty($bankAccount)}
                {include file=$layout->getRootTemplate("layout/cart/sub/recapitulation/bankAccountRecapitulation.tpl")}
            {/if}
        </div>

    </div>

    <div class="co-box co-order">
        <h4 class="order-icon order-content">
            {t}Order content{/t}
        </h4>
        {include file=$layout->getTemplate("layout/cart/sub/recapitulation/cartTable.tpl")}
    </div>
{/block}
