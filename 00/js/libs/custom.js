(function(shoptet) {

    /*
    * Called after successful validation of form
    * @param {Object} form
    * form = validated form
    * You can stop submitting of form by returning false
    * @return Boolean
    */
    function postSuccessfulValidation(form) {
        return true;
    };

    /*
    * Called after failed validation of form
    * @param {Object} form
    * form = validated form
    * @return undefined
    */
    function postFailedValidation(form) {};

    shoptet.custom = shoptet.custom || {};
    shoptet.custom.postSuccessfulValidation = postSuccessfulValidation;
    shoptet.custom.postFailedValidation = postFailedValidation;

})(shoptet);
