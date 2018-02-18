var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  
  createPostArea.style.display = 'block';
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  
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
  fetch('https://pwagram-e0ce6.firebaseio.com/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput,
      location: locationInput,
      image: "https://firebasestorage.googleapis.com/v0/b/pwagram-e0ce6.appspot.com/o/sf-boat.jpg?alt=media&token=e83ef799-e221-4479-9bb6-7750931e699c",
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
        id: new Date().toISOString,
        title: titleInput.value,
        location: locationInput.value
      }
      writeData('sync-posts', post)
      .then(function(){
        return sw.sync.register('sync-new-post');
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