importScripts('workbox-sw.prod.v2.1.2.js');

const workboxSW = new self.WorkboxSW();
workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "d1dc36ea0bdeb23bcc31415d2e76dcf1"
  },
  {
    "url": "manifest.json",
    "revision": "a200cd152677081ec1e718faade102d5"
  },
  {
    "url": "offline.html",
    "revision": "0eaafd680998c59a7d35278e317d78f3"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "bf77315c0a75a821b0528b30e9294ece"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "325ea86fe2ac3e936a448916d32d3478"
  },
  {
    "url": "src/js/feed.js",
    "revision": "697b714d208b01d2ebed3d34de3f5878"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "bc82d46679516bce42a094e80b695f83"
  },
  {
    "url": "src/js/idb.js",
    "revision": "6c76ebc82c2d7220fd7fbe2fa8d2b53a"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "d3a6f28f70fb192a46526fab7494a8cc"
  },
  {
    "url": "sw-base.js",
    "revision": "a1b251bd717dd50efffe82bc42039dde"
  },
  {
    "url": "sw.js",
    "revision": "2fc0e22908bf7f960479dbfafbaf4107"
  },
  {
    "url": "workbox-sw.prod.v2.1.2.js",
    "revision": "685d1ceb6b9a9f94aacf71d6aeef8b51"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);