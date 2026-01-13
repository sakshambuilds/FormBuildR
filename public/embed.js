(function () {
    // Get the current script tag to read attributes
    var currentScript = document.currentScript || (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var formId = currentScript.getAttribute('form-id');
    if (!formId) {
        console.error('Form Embed: form-id attribute is missing.');
        return;
    }

    // Find the target container
    var container = document.getElementById('my-form');
    if (!container) {
        console.error('Form Embed: Target container <div id="my-form"></div> not found.');
        return;
    }

    // Derive the base URL from the script source
    var scriptSrc = currentScript.src;
    var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    // Handle case where script might be in a subfolder or root
    // If script is at https://domain.com/embed.js, baseUrl is https://domain.com
    // If script is at https://domain.com/assets/embed.js, baseUrl is https://domain.com/assets
    // We assume the app structure is standard.
    // For safety, let's assume the script is at root or we construct the URL relative to the script's origin.

    try {
        var url = new URL(scriptSrc);
        baseUrl = url.origin;
    } catch (e) {
        baseUrl = ''; // Fallback
    }

    // Create and inject iframe
    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/f/' + formId;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '0';

    // Clear container and append iframe
    container.innerHTML = '';
    container.appendChild(iframe);
})();
