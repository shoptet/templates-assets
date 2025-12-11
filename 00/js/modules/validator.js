shoptet.validator.invalidEmails = [
    'centum.cz',
    'cetrum.cz',
    'emai.cz',
    'eznam.cz',
    'gamil.com',
    'gmail.co',
    'gmai.com',
    'gmail.cz',
    'gmail.sk',
    'gmail.pl',
    'gmail.de',
    'gmail.ro',
    'setnam.cz',
    'seunam.cz',
    'seynam.cz',
    'sezmam.cz',
    'sezn.cz',
    'sezna.cz',
    'seznam.com',
    'seznan.cz',
    'seznma.cz',
    'sznam.cz'
];
var validators = {
    required: function (elementValue) {
        var isValid = true;
        if ($(this).attr('required') || $(this).hasClass('required')) {
            if ($(this).attr('name') === 'score') {
                // Has separate validation below
                isValid = true
            } else if ($(this).attr('type') == 'checkbox') {
                if (!$(this).is(':checked')) {
                    isValid = false;
                    var specialMessage = $(this).attr('data-special-message');
                    var newMessage = shoptet.messages.validator[`${$(this).attr('name').split('[')[0]}Required`]
                    if ($(this).attr('required') && !!newMessage) {
                        shoptet.validator.message = newMessage
                    } else {
                        if (specialMessage) {
                            shoptet.validator.message = shoptet.messages[specialMessage];
                        } else {
                            shoptet.validator.message = shoptet.messages['validatorCheckbox'];
                        }
                    }
                }
            } else if (!elementValue.trim()) {
                isValid = false;
                var newMessage = shoptet.messages.validator[`${$(this).attr('name')}Required`]
                if ($(this).attr('required') && !!newMessage) {
                    shoptet.validator.message = newMessage
                } else {
                    shoptet.validator.message = shoptet.messages['validatorRequired'];
                }
            }
        }
        return isValid;
    },
    password: function (elementValue) {
        var isValid = true;
        if ($(this).attr('type') == 'password' && $(this).attr('id') == 'passwordAgain') {
            var $password = $(this).closest('form').find('input#password[type=password]');
            if ($password && $(this).val() != $password.val()) {
                isValid = false;
                shoptet.validator.message = shoptet.messages['validatorPassword'];
            }
        }
        return isValid;
    },
    email: function (elementValue) {
        var isValid = true;
        if ($(this).attr('type') == 'email') {
            isValid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(elementValue.trim());
            shoptet.validator.message = shoptet.messages['validatorEmail'];
            if (isValid) {
                var domain = elementValue.trim().split('@')[1];
                var tld = domain.split('.');
                tld = tld[tld.length - 1];
                if (tld.length < 2) {
                    isValid = false;
                }
                if ($.inArray(domain, shoptet.validator.invalidEmails) !== -1) {
                    isValid = false;
                }
            }
        }
        return isValid;
    },
    fullname: function (elementValue) {
        var isValid = true;
        if ($(this).attr('id') == 'billFullName' || $(this).attr('id') == 'deliveryFullName') {
            // hex u00A0, dec 160 NO-BREAK SPACE
            // hex u2007, dec 8199 FIGURE SPACE
            // hex u202F, dec 8239 NARROW NO-BREAK SPACE
            // hex u2060, dec 8288 WORD JOINER
            // How to test characters listed above?
            // Take decimal value and create character, e.g. String.fromCharCode(160)
            var r = new RegExp(/[\u00A0]|[\u2007]|[\u202F]|[\u2060]|[\s]/i);
            isValid = r.test(elementValue.trim());
            shoptet.validator.message = shoptet.messages['validatorFullName'];
        }
        return isValid;
    },
    billStreet: function (elementValue) {
        var isValid = true;
        if ($(this).attr('id') == 'billStreet' && $(this).attr('data-warning')) {
            isValid = !/\s(\d+)(\/\d+)?[a-z]?$/i.test(elementValue.trim());
            shoptet.validator.message = shoptet.messages['validatorStreet'];
        }
        return isValid;
    },
    billHouseNumber: function (elementValue) {
        var isValid = true;
        if ($(this).attr('id') == 'billHouseNumber') {
            isValid = /^[0-9][0-9A-Za-z\s\/\-]{0,14}$/.test(elementValue.trim());
            shoptet.validator.message = shoptet.messages['validatorHouseNumber'];
        }
        return isValid;
    },
    score: function (elementValue) {
      var isValid = true;
      // TODO: Remove the ums check in issue #20873
        if (shoptet.config.discussion_rating_forms && $(this).attr('name') === 'score') {
            isValid = false
            shoptet.validator.message = shoptet.messages.validator.scoreRequired;
            $(this).closest('.rating-stars-group').find('.msg-error').remove()
            $(this).closest('.rating-stars-group').find('input[name="score"]').removeClass('error-field');
            if ($(this).closest('form').has('input[name="score"]:checked').length) {
                isValid = true
            }
        }
        return isValid;
    }
};
var validate = function(isSubmit) {
    var isValid = true;
    if (!$(this).hasClass('no-js-validation')) {
        var elementValue = new String($(this).val());
        if (isSubmit || elementValue.length) {
            for (var validator in validators) {
                isValid = validators[validator].call(this, elementValue);
                if (!isValid) {
                    break;
                }
            }
        }
    }
    if (isValid) {
        $(this).removeClass('error-field');
        shoptet.validator.removeValidatorMessage($(this));
    } else {
        $(this).addClass('error-field');
        if (typeof shoptet.validator.message !== 'undefined') {
            shoptet.validator.showValidatorMessage(
                $(this),
                shoptet.validator.message,
                'msg-error'
            );
        }
        shoptet.scripts.signalCustomEvent('ShoptetValidationError', $(this)[0]);
    }
    shoptet.modal.resize();
    return isValid;
};


shoptet.validator.initValidator = function($el, settings) {
    return $el.each(function() {
        shoptet.validator.shoptetFormValidator.init(this, settings);
    })
};

shoptet.validator.shoptetFormValidator = {
    messages: {},
    init: function(currentForm, settings) {
        if (currentForm.tagName != 'FORM') {
            // if initialization object is not form then return
            return;
        }

        var $currentForm = $(currentForm);
        var $elements = $currentForm.find(
            'input[required], input.required, textarea[required], input#companyId, input#passwordAgain, .js-validate'
        );
        if (!$elements.length) {
            // there are no elements to be checked
            return;
        } else {
            $elements.change(function () {
                var isSubmit = false;
                return validate.call($(this), isSubmit);
            });

        }
        settings = settings || {};
        $currentForm.data('validatorSettings', settings);

        $currentForm.submit(function(event) {
            var invalidElementsCounter = 0;
            $elements.each(function() {
                var isSubmit = true;
                if ($(this).hasClass('js-validation-suspended')) {
                    return;
                }
                var isElementValid = validate.call($(this), isSubmit);
                shoptet.scripts.signalCustomEvent('validatedFormSubmit', this);
                if (!isElementValid && invalidElementsCounter++ == 0 && shoptet.validatorPhone.ajaxPending === 0) {
                    $(this).focus();
                }
            });

            if (shoptet.validatorPhone.ajaxPending !== 0) {
                // Async validation -  abort submitting
                event.preventDefault();
                new Promise(function (resolve) {
                    document.addEventListener(shoptet.validatorPhone.ajaxDoneEvent, resolve);
                }).then(function() {
                    // Done - resubmit form
                    $currentForm.submit();
                });
            }

            if (invalidElementsCounter) {
                $currentForm.addClass('validation-failed');
                if ($.isFunction($currentForm.data('validatorSettings').onFailed)) {
                    $currentForm.data('validatorSettings').onFailed();
                }
                event.stopImmediatePropagation();
                setTimeout( function() { $('body').css('cursor', 'inherit'); }, 100);
                shoptet.scripts.signalCustomEvent('ShoptetFailedValidation', $currentForm[0]);
                shoptet.custom.postFailedValidation($currentForm[0]);
                return false;
            } else {
                $currentForm.removeClass('validation-failed');
                var $unveiledElements = $currentForm.find('[data-unveil]');
                $unveiledElements.each(function() {
                    var isChecked = $(this).is(":checked");
                    if(!isChecked) {
                        var clearBlockId = $(this).data('unveil');
                        $('#' + clearBlockId).find('input, textarea').each(function() {
                            $(this).val('');
                        });
                    }
                });
                var requiredFields = document.getElementsByClassName('js-validate-required');
                for (var key in requiredFields) {
                    if (typeof requiredFields[key] === 'object') {
                        shoptet.scripts.signalCustomEvent('validatedFormSubmit', requiredFields[key]);
                    }
                }
                var invalid = shoptet.validator.formContainsInvalidFields($currentForm[0]);
                if (invalid) {
                    var $firstInvalidEl = $currentForm.find(shoptet.validator.invalidFieldClasses)
                        .first().parents('.form-group');
                    scrollToEl($firstInvalidEl);
                    shoptet.scripts.signalCustomEvent('ShoptetFailedValidation', $currentForm[0]);
                    shoptet.custom.postFailedValidation($currentForm[0]);
                    return false;
                }
                shoptet.scripts.signalCustomEvent('ShoptetSuccessfulValidation', $currentForm[0]);
                return shoptet.custom.postSuccessfulValidation($currentForm[0]);
            }
        });

        return this;
    }
};

shoptet.validator.showValidatorMessage = function($el, message, cssClass) {
    $el.data('validatorMessageMessage', message);
    return $el.each(function() {
        shoptet.validator.validatorMessage.show($el, cssClass);
    })
};

shoptet.validator.removeValidatorMessage = function($el) {
    return $el.each(function() {
        shoptet.validator.validatorMessage.hide($el);
    })
};

//
// Validator message object
//
shoptet.validator.validatorMessage = {
    init: function($el) {
        do {
            var id = 'id-' + Math.floor((Math.random() * 1024) + (Math.random() * 2048));
        } while ($('#' + id).length);
        $('<div class="validator-msg js-validator-msg" id="' + id + '"></div>').appendTo($('body'));
        var $container = $('#' + id);
        $('html').on('click', '#' + id, function() {
            $container.prev('input').removeClass('error-field');
            $container.remove();
            $el.data('validatorMessage', false);
        });
        $el.data('validatorMessage', $container);
        $container.data('parent', $el);
    },
    show: function($el, cssClass) {
        if (!$el.data('validatorMessage')) {
            this.init($el);
        }

        var $container = $el.data('validatorMessage');
        $container
            .addClass(cssClass)
            .html($el.data('validatorMessageMessage'));

        $el.closest('.js-validated-element-wrapper').append($container);
        $container.fadeIn(150);
    },
    hide: function($el) {
        if ($el.data('validatorMessage')) {
            var validatorMessage = $el.data('validatorMessage');
            validatorMessage.remove();
            $el.data('validatorMessage', false);
        }
    }
};
