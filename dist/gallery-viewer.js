(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.OliaGallery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createGalleryViewer({ sources, loadImage, preloadImage = () => {}, render }) {
    let displayedIndex = 0;
    let requestedIndex = 0;
    let requestId = 0;

    async function goTo(index) {
      const targetIndex = (index + sources.length) % sources.length;
      const currentRequestId = ++requestId;
      requestedIndex = targetIndex;
      render({
        status: "loading",
        displayedIndex,
        requestedIndex,
        source: sources[displayedIndex],
      });
      try {
        await loadImage(sources[targetIndex]);
      } catch (_) {
        if (currentRequestId !== requestId) return;
        render({
          status: "error",
          displayedIndex,
          requestedIndex,
          source: sources[displayedIndex],
        });
        return;
      }
      if (currentRequestId !== requestId) return;
      displayedIndex = targetIndex;
      render({
        status: "ready",
        displayedIndex,
        requestedIndex,
        source: sources[displayedIndex],
      });
      if (sources.length > 1) {
        preloadImage(sources[(displayedIndex - 1 + sources.length) % sources.length]);
        preloadImage(sources[(displayedIndex + 1) % sources.length]);
      }
    }

    return { goTo };
  }

  return { createGalleryViewer };
});
