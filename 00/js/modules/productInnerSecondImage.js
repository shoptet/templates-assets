$(document).on("mouseenter", '.swap-images', function() {
    var img = $(this).find(".swap-image");
    if(img.attr('data-next')) {
        img.attr('src', img.attr('data-next'));
    }
}).on("mouseleave", '.swap-images', function() {
    var img = $(this).find(".swap-image");
    if(img.attr('data-next')) {
        img.attr('src', img.attr('data-src'));
    }
});
