/*
<div class="selector-class smart-label-wrapper">
    <label for="text">text</label>
    <input type="text" value="">
</div>
*/

if (shoptet.abilities.feature.smart_labels){
    (function($){

        $.fn.SmartLabels = function(options){

            var defaults = {
                populatedClass : 'populated',
                focusedClass : 'focused'
            },

            settings = $.extend({}, defaults, options);

            var validTypes = [
                'text',
                'phone',
                'tel',
                'password',
                'number',
                'email',
                'select',
                'textarea'
            ];

            return this.each(function(){

                var element = $(this), //.smart-label-wrapper
                    input = element.find('input, select, textarea');

                // if .smart-label-wrapper has valid elements
                if (typeof input[0] !== "undefined") {
                    if ($(input[1]).attr('type') == 'tel') {
                        input = $(input[1]);
                    }

                    if (input[0].nodeName == 'SELECT') {
                        var att = document.createAttribute("type");
                        att.value = "select";
                        input[0].setAttributeNode(att);
                    }

                    if (input[0].nodeName == 'TEXTAREA') {
                        var att = document.createAttribute("type");
                        att.value = "textarea";
                        input[0].setAttributeNode(att);
                    }

                    if(validTypes.indexOf(input.attr('type')) > -1) {
                        if (input.val() == ''){
                            element.removeClass(settings.populatedClass);
                        } else {
                            element.addClass(settings.populatedClass);
                        }


                        input.on('focus', function(){
                            element.addClass(settings.focusedClass);
                        });

                        input.on('blur', function(){
                            element.removeClass(settings.focusedClass);
                            
                            if(input.val()){
                                element.addClass(settings.populatedClass);
                            }else{
                                element.removeClass(settings.populatedClass);
                            }
                        });

                        input.on('keyup', function(){
                            element.addClass(settings.populatedClass);
                        });
                    }
                }

                if (this.classList.contains('js-phone-form-group')) {
                    var phonelabel = this.getElementsByTagName('label')[0];
                    var phoneInput = this.querySelectorAll('.js-phone-form-control');

                    phonelabel.style.setProperty("left", phoneInput[0].offsetLeft + "px");

                    document.addEventListener('ShoptetPhoneCodeChange', function (e) {
                        phonelabel.style.setProperty("left", phoneInput[0].offsetLeft + "px");
                    }, false);
                }
            });
        };
    })(jQuery);

    $(document).ready(function(){
        /* START SMART LABELS */
        $('.smart-label-wrapper').SmartLabels();
    });
}
