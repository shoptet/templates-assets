{extends file=$layout->getRootTemplate("layout/header/header.tpl")}

{block name="topNavigation"}{/block}

{block name="userAction"}
<div class="user-action">
    <div class="content-window-in login-window-in">
      <div class="container">
          <div class="row">
              <div class="col-sm-2 col-lg-offset-1">
                  {include file=$layout->getTemplate("layout/cart/sub/continueShopping.tpl") dataTarget="login"}
              </div>
              <div class="col-sm-8 col-lg-7">
                  {include file=$layout->getTemplate("layout/navigation/userActionWindow.tpl")}
              </div>
          </div>
      </div>
    </div>
</div>
{/block}
