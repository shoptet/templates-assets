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
                smartLabelClass : 'smart-label-wrapper',
                populatedClass : 'populated',
                focusedClass : 'focused'
            },

            settings = $.extend({}, defaults, options);

            var invalidTypes = [
                'radio',
                'checkbox',
                'hidden',
                'submit'
            ];

            return this.each(function(){

                var element = $(this), //.form-group
                    input = element.find('textarea, input, select');

                if ($(input[1]).attr('type') == 'tel') {
                    input = $(input[1]);
                }

                if(invalidTypes.indexOf(input.attr('type')) == -1) {
                    element.addClass(settings.smartLabelClass);

                    if(input.val() == ''){
                        element.removeClass(settings.populatedClass);
                    } else {
                        element.addClass(settings.populatedClass);
                    }


                    input.on('focus', function(){
                        element.addClass(settings.focusedClass);
                    });

                    input.on('blur', function(){
                        element.removeClass(settings.focusedClass);

                        if(!input.val()){
                            element.removeClass(settings.populatedClass);
                        }
                    });

                    input.on('keyup', function(){
                        element.addClass(settings.populatedClass);
                    });
                }
            });
        };
    })(jQuery);

    $(document).ready(function(){
        /* START SMART LABELS */
        $('#checkoutContent .form-group').SmartLabels();
        $('#register-form .form-group').SmartLabels();
    });
}
