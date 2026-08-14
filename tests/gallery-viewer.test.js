const test = require("node:test");
const assert = require("node:assert/strict");

const { createGalleryViewer } = require("../gallery-viewer.js");

test("keeps the current page visible until the requested image finishes loading", async () => {
  let resolveLoad;
  const renders = [];
  const viewer = createGalleryViewer({
    sources: ["page-1.webp", "page-2.webp"],
    loadImage: () => new Promise((resolve) => { resolveLoad = resolve; }),
    render: (state) => renders.push({ ...state }),
  });

  const navigation = viewer.goTo(1);

  assert.deepEqual(renders.at(-1), {
    status: "loading",
    displayedIndex: 0,
    requestedIndex: 1,
    source: "page-1.webp",
  });

  resolveLoad();
  await navigation;

  assert.deepEqual(renders.at(-1), {
    status: "ready",
    displayedIndex: 1,
    requestedIndex: 1,
    source: "page-2.webp",
  });
});

test("preloads the previous and next images after a page becomes ready", async () => {
  const preloaded = [];
  const viewer = createGalleryViewer({
    sources: ["page-1.webp", "page-2.webp", "page-3.webp", "page-4.webp"],
    loadImage: async () => {},
    preloadImage: (source) => preloaded.push(source),
    render: () => {},
  });

  await viewer.goTo(2);

  assert.deepEqual(preloaded, ["page-2.webp", "page-4.webp"]);
});

test("keeps the displayed page stable when the requested image fails", async () => {
  const renders = [];
  const viewer = createGalleryViewer({
    sources: ["page-1.webp", "page-2.webp"],
    loadImage: async () => { throw new Error("network"); },
    render: (state) => renders.push({ ...state }),
  });

  await viewer.goTo(1);

  assert.deepEqual(renders.at(-1), {
    status: "error",
    displayedIndex: 0,
    requestedIndex: 1,
    source: "page-1.webp",
  });
});

test("ignores a stale image load after a newer navigation finishes", async () => {
  const loads = new Map();
  const renders = [];
  const viewer = createGalleryViewer({
    sources: ["page-1.webp", "page-2.webp", "page-3.webp"],
    loadImage: (source) => new Promise((resolve) => loads.set(source, resolve)),
    render: (state) => renders.push({ ...state }),
  });

  const toSecond = viewer.goTo(1);
  const toThird = viewer.goTo(2);
  loads.get("page-3.webp")();
  await toThird;
  loads.get("page-2.webp")();
  await toSecond;

  assert.deepEqual(renders.at(-1), {
    status: "ready",
    displayedIndex: 2,
    requestedIndex: 2,
    source: "page-3.webp",
  });
  assert.equal(renders.filter((state) => state.status === "ready").length, 1);
});
