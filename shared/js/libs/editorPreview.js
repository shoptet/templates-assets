// Capture link clicks and add editorPreview param to the next URL
document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link) {
        e.preventDefault();
        const urlObject = new URL(link.href);
        urlObject.searchParams.set('editorPreview', '');

        sendMessage({type: 'pageIsLoading'});
        window.location.href = urlObject.toString();
    }
});

// Receive messages
window.addEventListener('message', function(e) {
    if (e.data.type === 'reload') {
        window.location.reload();
    }

    if (e.data.type === 'navigate' && e.data.url) {
        const urlObject = new URL(e.data.url, window.location.origin);
        urlObject.searchParams.set('editorPreview', '');
        window.location.href = urlObject.toString();
    }
});

// Post messages
sendMessage({
    type: 'pageLoaded',
    pageType: shoptet.editorPreview.pageType
});

function sendMessage(message) {
    window.parent.postMessage(message, window.location.origin);
}
