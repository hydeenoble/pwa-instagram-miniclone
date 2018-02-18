importScripts('./src/js/idb.js');
importScripts('./src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v28';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/idb.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];


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
	var url = 'https://pwagram-e0ce6.firebaseio.com/posts';

	if(event.request.url.indexOf(url) > -1){
		event.respondWith(
			fetch(event.request)
			.then(function(res){
				var clonedRes = res.clone();
				clearAllData('posts')
				.then(function(){
					return clonedRes.json()
				}) 
				.then(function(data){
					for (var key in data) {
						writeData('posts', data[key]);
					}
				});
				return res;
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

self.addEventListener('sync', function(event){
	console.log('[Service Worker] Background syncing', event);
	if(event.tag === 'sync-new-posts') {
		console.log('[Service Worker] Syncing new Posts');
		event.waitUntil(
			readAllData('sync-posts')
			.then(function(data){
				for (var dt of data){
					fetch('https://us-central1-pwagram-e0ce6.cloudfunctions.net/storePostData', {
					method: 'POST',
					headers: {
					  'Content-Type': 'application/json',
					  'Accept': 'application/json'
					},
					body: JSON.stringify({
					  id: dt.id,
					  title: dt.title,
					  location: dt.location,
					  image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-e0ce6.appspot.com/o/sf-boat.jpg?alt=media&token=e83ef799-e221-4479-9bb6-7750931e699c',
					})
				  }).then(function(res){
					console.log('Sent data', res);
					if (res.ok){
						res.json()
						.then(function(resData){
							deleteSingleItem('sync-posts', resData.id);
						})
					}
				  }).catch(function(err){
					  console.log('Error while sending data', err);
				  });
				}
			})
		);
	}
});

self.addEventListener('notificationclick', function(event){
	var notification = event.notification;
	var action = event.action;

	console.log(notification);

	if(action === 'confirm'){
		console.log('Confirm was chosen');
		notification.close();
	} else {
		console.log(action);
		event.waitUntil(
			clients.matchAll()
			.then(function(clis){
				var client = clis.find(function(c){
					return c.visibilityState === 'visible';
				});

				if(client !== undefined){
					client.navigate(notification.data.url);
					client.focus();
				} else {
					clients.openWindow(notification.data.url);
				}
			})
		);
		notification.close();
	}
});

self.addEventListener('notificationclosed', function(event){
	console.log('Notification was closed', event);
});

self.addEventListener('push', function(event) {
	console.log('Push Notification recieved', event);

	var data = {
		title: 'New!',
		content: 'Something default happened',
		openUrl: '/'
	};

	if(event.data){
		data = JSON.parse(event.data.text());
	}

	var options = {
		body: data.content,
		icon: '/src/images/icons/app-icon-96x96.png',
		badge: '/src/images/icons/app-icon-96x96.png',
		data: {
			url: data.openUrl
		}
	};

	event.waitUntil(
		self.registration.showNotification(data.title, options)
	);
});