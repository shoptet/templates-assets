$(document).ready(function() {
    // Cloud zoom
    shoptet.config.cloudZoomOptions = {
        position: 'inside',
        showTitle: false,
        adjustX: 0,
        adjustY: 0
    };
    $('.cloud-zoom').CloudZoom(shoptet.config.cloudZoomOptions);
    $('html').on('click', '.mousetrap', function() {
        $(this).prev('a.p-main-image').trigger('click');
    });
});
