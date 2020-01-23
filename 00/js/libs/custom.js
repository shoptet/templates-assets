(function(shoptet) {

    /*
    * This function does not accept any arguments
    * Called after successful validation of form
    * You can stop submitting of form by returning false
    * @return Boolean
    */
    function postSuccessfulValidation() {
        return true;
    };

    /*
    * This function does not accept any arguments
    * Called after failed validation of form
    * @return undefined
    */
    function postFailedValidation() {};

    shoptet.custom = shoptet.custom || {};
    shoptet.custom.postSuccessfulValidation = postSuccessfulValidation;
    shoptet.custom.postFailedValidation = postFailedValidation;

})(shoptet);
