(function(shoptet) {

    /*
    * Called after successful validation of form
    * @param {Object} form
    * form = validated form
    * @param {Object} args
    * args = optional arguments
    * You can stop submitting of form by returning false
    * @return Boolean
    */
    function postSuccessfulValidation(form, args) {
        return true;
    }

    /*
    * Called after failed validation of form
    * @param {Object} form
    * form = validated form
    * @param {Object} args
    * args = optional arguments
    * @return undefined
    */
    function postFailedValidation(form, args) {}

    shoptet.custom = shoptet.custom || {};
    shoptet.custom.config = shoptet.custom.config || {};
    shoptet.custom.postSuccessfulValidation = shoptet.custom.postSuccessfulValidation || postSuccessfulValidation;
    shoptet.custom.postFailedValidation = shoptet.custom.postSuccessfulValidation || postFailedValidation;

})(shoptet);
