{extends file=$layout->getRootTemplate("layout/footer/footer.tpl")}

{block name="systemFooter"}
{if $modules->isActive("newsletters")}
  <div class="container footer-newsletter">
    {include file=$layout->getTemplate("elements/newsletter.tpl")}
  </div>
{/if}
{/block}
