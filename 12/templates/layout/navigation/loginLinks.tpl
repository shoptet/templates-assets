{extends file=$layout->getRootTemplate("layout/navigation/loginLinks.tpl")}
{block name="registerLink"}{/block}
{block name="logoutLink"}{/block}
{block name="loginLink"}
    <a href="{$url->getCustomerLoginUrl()|escape}" class="login-link toggle-window" data-target="login" rel="nofollow">
        <span class="sr-only">{t}Login{/t}</span>
    </a>
{/block}
{block name="myAccountLink"}
    {if $customer->loggedIn}
        <a href="{$url->getCustomerSectionUrl()|escape}" class="login-link" data-target="login">
            <span class="sr-only">{t}My account{/t}</span>
        </a>
    {elseif $affiliatePartner->loggedIn}
        <a href="{$url->getAffiliatePartnerSectionUrl()|escape}" class="login-link" data-target="login">
            <span class="sr-only">{t}My account{/t}</span>
        </a>
    {/if}
{/block}
