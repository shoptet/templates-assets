(function(shoptet) {

    /**
     * Reveals images on the page that have not yet been loaded.
     * For each image without the 'loading' attribute, sets the 'src' attribute to the value from 'data-src' or 'data-src-retina'.
     * If the image already has the correct 'src', sets the 'loading' attribute to 'eager'.
     * Otherwise, sets the 'loading' attribute to 'lazy' and updates the 'src'.
     * 
     * @returns {void}
     */
    function unveil() {
      document.querySelectorAll('img:not([loading])').forEach((img) => {
          const source = img.getAttribute(window.devicePixelRatio > 1 ? "data-src-retina" : "data-src") || img.dataset.src;
          if (!source) {
              img.setAttribute('loading', 'eager');
              return;
          }
          if (img.src?.trim() === source.trim()) {
              img.setAttribute('loading', 'eager');
          } else {
              img.setAttribute('loading', 'lazy');
              img.setAttribute("src", source);
          }
      })
  }

  shoptet.images = shoptet.images || {};
  shoptet.scripts.libs.images.forEach((fnName) => {
      const fn = eval(fnName);
      shoptet.scripts.registerFunction(fn, 'images');
  });

})(shoptet);
