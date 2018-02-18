var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');


function initializeMedia() {
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function(constraints){
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise(function(resolve, reject){
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices.getUserMedia({video: true})
  .then(function(stream){
    videoPlayer.srcObject = stream;
    videoPlayer.style.display = 'block';
  })
  .catch(function(err){
    imagePickerArea.style.display = 'block';
  });
}


captureButton.addEventListener('click', function(event){
  console.log('capture button clicked');

  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';

  var context = canvasElement.getContext('2d');
  context.drawImage(
    videoPlayer, 
    0, 0, canvas.width, 
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );

  videoPlayer.srcObject.getVideoTracks().forEach(function(track){
    track.stop();
  });

});

function openCreatePostModal() {
  
  createPostArea.style.display = 'block';
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);

  initializeMedia();
  
  if (deferredPrompt){
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult){
      console.log(choiceResult.outcome);

      if(choiceResult.outcome === 'dismissed'){
        console.log('User cancelled installation');
      }else{
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';

  setTimeout(() => {
    createPostArea.style.display = 'none';
  }, 1);

  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
  clearCards();
  
  for(var i = 0; i < data.length; i++){
    createCard(data[i]);
  }
}
var url = 'https://pwagram-e0ce6.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
  
    updateUI(dataArray);
  });

if ('indexedDB' in window){
  readAllData('posts').then(function(data){
    if(!networkDataReceived){
      console.log('From cache', data);
      updateUI(data);
    }
  });
}
function sendData(){
  fetch('https://us-central1-pwagram-e0ce6.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput,
      location: locationInput,
    })
  }).then(function(res){
    console.log('Sent data', res);
    updateUI();
  });
}

form,addEventListener('submit', function(event){
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  if('serviceWorker' in navigator && 'SyncManager' in window){
    navigator.serviceWorker.ready
    .then(function(sw){
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: "https://firebasestorage.googleapis.com/v0/b/pwagram-e0ce6.appspot.com/o/sf-boat.jpg?alt=media&token=e83ef799-e221-4479-9bb6-7750931e699c",

      }
      writeData('sync-posts', post)
      .then(function(){
        return sw.sync.register('sync-new-posts');
      }).then(function() {
        var snackbarContainer = document.querySelector('#confirmation-toast');
        var data = { message: 'Your Post was saved for syncing'};
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
      }).catch(function(err){
        console.log(err);
      });
    });
  } else {
    sendData();
  }
});