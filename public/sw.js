var CACHE_STATIC_NAME = 'static-v18';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

// function trimCache(cacheName, maxItems){
// 	caches.open(cacheName)
// 	.then(function (cache){
// 		return cache.keys()
// 		.then(function(keys){
// 			if(keys.length > maxItems){
// 				cache.delete(keys[0])
// 				.then(trimCache(cacheName, maxItems));
// 			}
// 		});
// 	});
// }

self.addEventListener('install', function(event){
	console.log('[Service Worker] Installing Service Worker ...', event);
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME).then(function(cache){
			console.log('[Service Worker] Precaching App shell');
			cache.addAll(STATIC_FILES);
		})
	);
})
self.addEventListener('activate', function(event){
	console.log('[Service Worker] Activating Service Worker ...', event);
	event.waitUntil(
		caches.keys().then(function(keyList){
			return Promise.all(keyList.map(function(key){
				if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
					console.log('[Service Worker] removing ols cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
})

function isInArray(string, array){
	for(var i = 0; i < array.length; i++){
		if (array[i] === string){
			return true;
		}
	}

	return false;
}

self.addEventListener('fetch', function(event){
	var url = 'hhttps://pwagram-e0ce6.firebaseio.com/posts';

	if(event.request.url.indexOf(url) > -1){
		event.respondWith(
			caches.open(CACHE_DYNAMIC_NAME)
			.then(function(cache){
				return fetch(event.request)
				.then(function(res){
					// trimCache(CACHE_DYNAMIC_NAME, 3);
					cache.put(event.request, res.clone());
					return res;
				});
			})
		);
	}else if(isInArray(event.request.url, STATIC_FILES)){
		event.respondWith(
			caches.match(event.request)
		);
	}else{
		event.respondWith(
			caches.match(event.request).then(function(response){
				if(response){
					return response;
				}else{
					return fetch(event.request)
					.then(function(res){
						caches.open(CACHE_DYNAMIC_NAME)
						.then(function(cache){
							// trimCache(CACHE_DYNAMIC_NAME, 3);
							cache.put(event.request.url, res.clone());
							return res;
						});
					}).catch(function(err){
						return caches.open(CACHE_STATIC_NAME)
						.then(function(cache){
							if(event.request.headers.get('accept').includes('text/html')){
								return cache.match('/offline.html');
							}
						});
					});
				}
			})
		);
	}
	
});