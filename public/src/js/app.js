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

function displayConfrimNotification(){
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You have successfully subscribed to our Notification service!'
        };

        navigator.serviceWorker.ready
        .then(function(swreg) {
            swreg.showNotification('Successfully subscribed (From SW)!', options)
        });
    }
}

function askForNotificationPermission(){
    Notification.requestPermission(function(result){
        console.log('User Choice', result);
        if(result !== 'granted'){
            console.log('No notification permission granted!');
        } else {
            displayConfrimNotification();
        }
    });
}

if('Notification' in window){
    for (var i = 0; i < enableNotificationButtons.length; i++){
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i],addEventListener('click', askForNotificationPermission);
    }
}