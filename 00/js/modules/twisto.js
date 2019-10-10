if (typeof twistoCheckPayload !== 'undefined') {
    $(document).ready(function () {

        var changeMouseCursorToProgress = function (restoreInMiliseconds) {
            $('body').css('cursor', 'progress');
            if (restoreInMiliseconds) {
                window.setTimeout(
                    function () {
                        $('body').css('cursor', 'inherit');
                    },
                    restoreInMiliseconds
                );
            }
        };

        $('#submit-order').closest('form').submit(function (event, twistoVerificationSuccesfull) {
            if (twistoVerificationSuccesfull) {
                return true;
            }
            event.preventDefault();
            twistoPayload.customer.email = getValue('email').toLowerCase();
            twistoPayload.order.billing_address = getAddress('bill');
            if (!checkContactInformation(twistoPayload.order.billing_address)) {
                return false;
            }
            if ($('#another-shipping').prop('checked')) {
                twistoPayload.order.delivery_address = getAddress('delivery');
                if (!checkContactInformation(twistoPayload.order.delivery_address)) {
                    return false;
                }
            } else {
                delete twistoPayload.order.delivery_address;
            }

            $(this).attr('disabled', 'disabled');
            changeMouseCursorToProgress(4000);
            Twisto.check(
                twistoPayload,
                function (response) {
                    if (response.status == 'accepted') {
                        var $form = $('#submit-order').closest('form');
                        $form.find('input[name=twisto_transaction_id]').val(response.transaction_id);
                        var twistoVerificationSuccesfull = true;
                        $form.trigger('submit', [twistoVerificationSuccesfull]);
                    } else {
                        window.location.replace(twistoRejectedUrl);
                    }
                },
                function () {
                    window.location.replace(twistoFailedUrl);
                }
            );
        });

    });
}
