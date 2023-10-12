// Capture link clicks and add editorPreview param to the next URL
document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link) {
        e.preventDefault();
        const urlObject = new URL(link.href);
        urlObject.searchParams.set('editorPreview', '');
        window.location.href = urlObject.toString();
    }
});

// Receive messages
window.addEventListener('message', function(e) {
    if (e.data.type === 'reload') {
        window.location.reload();
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
