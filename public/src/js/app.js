var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll('.enable-notifications');

if(!window.Promise){
    window.Promise = Promise;
}

if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js', {scope: '/'})
        .then(function(){
            console.log('Service Worker Registered!');
        });
}

window.addEventListener('beforeinstallprompt', function(event){
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function displayConfirmNotification(){
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You have successfully subscribed to our Notification service!',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US',
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
                { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
            ]
        };

        navigator.serviceWorker.ready
        .then(function(swreg) {
            swreg.showNotification('Successfully subscribed!', options);
        });
    }
}

function configurePushSub(){
    if (!('serviceWorker' in navigator)) {
        return;
    }

    var reg;
    navigator.serviceWorker.ready
    .then(function(swreg){
        reg = swreg;
        return swreg.pushManager.getSubscription();
    }).then(function(sub){
        if(sub === null){
            var vapidPublicKey = 'BI5YZulve60bzJ58w3KkRwxuChlFV_HjPaYeUftq6QKda0sWuNXlk7YhCkeoNjBQza3OCHRlMw6WEqOXYd5PFek';
            var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

            return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidPublicKey
            });
        }else{

        }
    }).then(function(newSub){
        return fetch('https://pwagram-e0ce6.firebaseio.com/subscriptions.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newSub)
        });
    }).then(function(res){
        if(res.ok){
            displayConfirmNotification();
        }
    }).catch(function(err){
        console.log(err);
        
    });
}

function askForNotificationPermission(){
    Notification.requestPermission(function(result){
        console.log('User Choice', result);
        if(result !== 'granted'){
            console.log('No notification permission granted!');
        } else {
            // displayConfirmNotification();
            configurePushSub();
        }
    });
}

if('Notification' in window){
    for (var i = 0; i < enableNotificationButtons.length; i++){
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
}