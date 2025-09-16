(function(shoptet) {
  document.addEventListener('DOMContentLoaded', function() {
        var $html = $('html');

    $html.on('click', '.js-discussion-container .add-comment', function() {
      $('.js-discussion-container .add-comment').show();
      $(this).hide();
      $discussionForm = $('.discussion-form');
      $discussionForm.addClass('visible-permanent');
      moveElementAfterSelector($('.discussion-form'), $(this));

      $discussionForm[0].querySelectorAll('.js-validate-required').forEach(el => {
        shoptet.validator.removeErrorMessage(el, shoptet.validatorRequired.messageType);
      })

      $('.discussion-form input[name="parentId"]').remove();
      if($(this).attr('data-id')) {
          $('<input name="parentId" value="' + $(this).data('id') + '" type="hidden">')
              .insertAfter('.discussion-form input[name="discussionEntityId"]');
      }
    });

    if (shoptet.config.ums_a11y_pagination) {
      const loadingAnnouncer = shoptet.screenReader.createLoadingAnnouncer();
      $html.on('click', '.js-loadMore__button--discussions, .js-loadMore__button--ratings', function(e) {
        e.preventDefault();

        const $clickedEl = $(this);
        const target = $clickedEl.hasClass('js-loadMore__button--discussions') ? 'discussions' : 'ratings';
        const type = $clickedEl.attr('data-type');
        const entityId = $clickedEl.attr('data-id');
        const offset = Number($clickedEl.attr('data-offset'));

        const allowedTargets = ['ratings', 'discussions'];

        if (!allowedTargets.includes(target) || isNaN(offset) || offset < 0 || !entityId) {
          return
        }

        const listingControlsSelector = '.listingControls'

        let $listingWrapper = $('#ratingsList');
        let itemSelector = '#ratingsList > .vote-wrap';
        let signalCustomEventName = 'ShoptetProductRatingsRequested';
        let signalDomLoadName = 'ShoptetDOMProductRatingsLoaded';
        let action = 'ajaxRatingLoad';
        let controller = 'productDetail';

        if (target === 'discussions') {
          $listingWrapper = $('#discussionsList');
          itemSelector = '#discussionsList > .vote-wrap';
          signalCustomEventName = 'ShoptetProductDiscussionsRequested';
          signalDomLoadName = 'ShoptetDOMProductDiscussionsLoaded';
          action = 'ajaxDiscussionLoad';
          controller = 'productDetail';

          if (type === 'sectionArticle') {
            signalCustomEventName = 'ShoptetSectionArticleDiscussionsRequested';
            signalDomLoadName = 'ShoptetDOMSectionArticleDiscussionsLoaded';
            controller = 'sectionArticleDetail';
          }

          if (type === 'article') {
            signalCustomEventName = 'ShoptetArticleDiscussionsRequested';
            signalDomLoadName = 'ShoptetDOMArticleDiscussionsLoaded';
            controller = 'articleDetail';
          }
        }

        shoptet.scripts.signalCustomEvent(signalCustomEventName, e.target);
        showSpinner();
        loadingAnnouncer.begin($listingWrapper[0]);
        $(this).closest(listingControlsSelector).remove();

        $.ajax({
          type: 'POST',
          url: `/action/${controller}/${action}?id=${entityId}&offset=${offset}`,
          headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
          dataType: 'html',
          success: (function (payload) {
            const requestedDocument = shoptet.common.createDocumentFromString(payload);
            const $newListing = $(requestedDocument).find(itemSelector);
            const $newListingControls = $(requestedDocument).find(listingControlsSelector);

              if ($newListing?.length > 0) {
                $listingWrapper.append($newListing);
                shoptet.animations.fadeIn($newListing);
                if ($newListingControls) {
                  $listingWrapper.after($newListingControls);
                }
                loadingAnnouncer.end();
                hideSpinner();
                shoptet.helpers.focusFirst($newListing[0]);
              }
              shoptet.scripts.signalDomLoad(signalDomLoadName, $listingWrapper[0]);
            })
        });
      })
    } else {
      $html.on('click', '.js-load-discussions, .js-load-ratings', function(e) {
        e.preventDefault();

        const target = $(this).hasClass('js-load-discussions') ? 'discussions' : 'ratings';
        const type = $(this).attr('data-type');
        const entityId = $(this).attr('data-id');
        const offset = Number($(this).attr('data-offset'));

        const allowedTargets = ['ratings', 'discussions'];

        if (!allowedTargets.includes(target) || isNaN(offset) || offset < 0 || !entityId) {
            return
        }

        let $el = $('#ratingTab > .votes-wrap');
        let listingEl = '.votes-wrap:first > .vote-wrap'
        let loadNextEl = '.load-next-wrap'
        let signalCustomEventName = 'ShoptetProductRatingsRequested';
        let signalDomLoadName = 'ShoptetDOMProductRatingsLoaded';
        let action = 'ajaxRatingLoad';
        let controller = 'productDetail';

        if (target === 'discussions') {
            $el = $('.js-discussion-container > .votes-wrap')
            listingEl = '.votes-wrap:first > .vote-wrap'
            loadNextEl = '.load-next-wrap'
            signalCustomEventName = 'ShoptetProductDiscussionsRequested';
            signalDomLoadName = 'ShoptetDOMProductDiscussionsLoaded';
            action = 'ajaxDiscussionLoad';
            controller = 'productDetail';

            if (type === 'sectionArticle') {
              signalCustomEventName = 'ShoptetSectionArticleDiscussionsRequested';
              signalDomLoadName = 'ShoptetDOMSectionArticleDiscussionsLoaded';
              controller = 'sectionArticleDetail';
            }

            if (type === 'article') {
              signalCustomEventName = 'ShoptetArticleDiscussionsRequested';
              signalDomLoadName = 'ShoptetDOMArticleDiscussionsLoaded';
              controller = 'articleDetail';
            }
        }

        shoptet.scripts.signalCustomEvent(signalCustomEventName, e.target);
        showSpinner();
        $(this).closest(loadNextEl).remove();

        $.ajax({
            type: 'POST',
            url: `/action/${controller}/${action}?id=${entityId}&offset=${offset}`,
            headers: {'X-Shoptet-XHR': 'Shoptet_Coo7ai'},
            dataType: 'html',
            success: (function (payload) {
                const requestedDocument = shoptet.common.createDocumentFromString(payload);
                const listing = $(requestedDocument).find(listingEl);
                const loadNext = $(requestedDocument).find(loadNextEl);

                if (listing) {
                    $el.append(listing);
                    if (loadNext) {
                        $el.after(loadNext);
                    }
                }

                hideSpinner();
                shoptet.scripts.signalDomLoad(signalDomLoadName, $el[0]);
            })
        });
      })
    }
  });
})(shoptet);
