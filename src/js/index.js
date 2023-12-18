import {createApi} from 'unsplash-js';
const  main = document.querySelector('#main');
const  loadMoreBtn = document.querySelector('.load-more');
const  searchInput = document.querySelector('.search-box input');
const  popup = document.querySelector('.popup');
const  closeBtn = popup.querySelector('.uil-times');
const  downloadImgBtn = popup.querySelector('.uil-import');

//navbar properties
document.getElementById('modernArt').addEventListener('click', () => handleNavItemClick('Modern Art'));
document.getElementById('classics').addEventListener('click', () => handleNavItemClick('Classics'));
document.getElementById('sculptures').addEventListener('click', () => handleNavItemClick('Sculptures'));
document.getElementById('cubism').addEventListener('click', () => handleNavItemClick('Cubism'));
document.getElementById('abstractArt').addEventListener('click', () => handleNavItemClick('Abstract Art'));
document.getElementById('favourites').addEventListener('click', () => handleNavItemClick('Favourites'));

//API key
const unsplash = createApi({
  accessKey: 'rKWCXW0J0GXXIMXVfLzdnMjo6pi-ZUF5_Dn85NVMyRM'
});


let currentPage = 1;
let searchTerm=null;

//---------download image function-----------
const downloadImg = (imgURL) =>{
  // console.log(imgURL);
  fetch(imgURL).then(res=> res.blob()).then(file => {
// console.log(file)
const a= document.createElement("a");
a.href = URL.createObjectURL(file);
a.download = new Date().getTime(); 
a.click();
  }).catch(()=> alert("Faild to download image!"));
}

// --------------------navbar function--------------------

function handleNavItemClick(category) {
  if (category === 'Favourites') {
     const likedImageIds = getLikedImageIds();
    if (likedImageIds.length > 0) {
      main.innerHTML = '';
      likedImageIds.forEach((imageId) => {
       unsplash.photos.get({ photoId: imageId })
       .then((result) => {
        if (result.type === 'success') {
          const likedImage = result.response;
         
          displayLikedPhoto(likedImage);
        }
      })
      .catch((error) => {
        console.error(`Error ${imageId}:`, error);
      });
  });
} else {
  main.innerHTML = '<p>No liked images yet.</p>';
}
} else {
searchPhotos(category);
}
}

// ------liked image function &  local storage----------
function getLikedImageIds() {
  const likedImageIdsStr = localStorage.getItem('likedImageIds');
  return likedImageIdsStr ? JSON.parse(likedImageIdsStr) : [];
}

// -------------like button function---------

function likeImage(event, imageId) {
  event.stopPropagation();

  const likedImageIds = getLikedImageIds();
  const likeButton = document.querySelector(`.like-btn[data-image-id="${imageId}"]`);

  const isLiked = likedImageIds.includes(imageId);

  if (isLiked) {
    const updatedLikedImageIds = likedImageIds.filter((id) => id !== imageId);
    localStorage.setItem('likedImageIds', JSON.stringify(updatedLikedImageIds));
    const likedImageElement = document.querySelector(`.card[data-image-id="${imageId}"]`);
    if (likedImageElement) {
      likedImageElement.remove();
    }

  } else {
    likedImageIds.push(imageId);
    localStorage.setItem('likedImageIds', JSON.stringify(likedImageIds));
  }

  likeButton.classList.toggle('liked', !isLiked);
}
// Function to display liked images

function displayLikedPhoto(likedImage) {
  const { id, urls, alt_description } = likedImage;
  const likedImageIds = getLikedImageIds();
  const isLiked = likedImageIds.includes(id);
  const likeBtnClass = isLiked ? 'liked' : '';

  const likedPhotoHtml = `<li class="card" data-image-id="${id}">
    <img src="${urls.small}" alt="${alt_description}"/>
    <div class="card-info">
      <div class="name">
        <i class="uil uil-camera"></i>
        <span>${alt_description}</span>
      </div>
      <div class="card-btn">
        <button class="like-btn ${likeBtnClass}" data-image-id="${id}">
          <i class="uil uil-heart"></i>
        </button>
        <button class="download-btn" data-url="${urls.small}">
          <i class="uil uil-import"></i>
        </button>
      </div>
    </div>
  </li>`;

  main.innerHTML += likedPhotoHtml;

  addEventListeners();
}

//Event listener for like and download buttons
function addEventListeners() {
  const likeButtons = document.querySelectorAll('.like-btn');
  const downloadButtons = document.querySelectorAll('.download-btn');

  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const imageId = button.dataset.imageId;
      likeImage(event, imageId);
    });
  });

  downloadButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const imageUrl = button.dataset.url;
      downloadImg(imageUrl);
      e.stopPropagation();
    });
  });
}


//------------popup-------------
const showPopup = (name, img, desc) => {
  const popupImg = popup.querySelector(".popup-box img");
  const popupSpan = popup.querySelector(".popup-box span");
  
  const description = popup.querySelector(".description");
  if (popupImg && popupSpan && description) {
    popupImg.src = img;
    popupSpan.innerText = name;
    description.innerText=desc;
    downloadImgBtn.setAttribute("data-img", img); // storing img URL as a button
    popup.classList.add("show");
    document.body.style.overflow = "hidden";
  } else {
    console.error("Popup elements not found.");
  }
}

//--------------close button-----------

const hidePopupBox  = () =>{
  popup.classList.remove("show");
  document.body.style.overflow="auto";
}



//----------display Image function-------------
function displayPhotos(photos) {
  const getUrls = photos.map((photo) => {
    return `<li class="card">
      <img src="${photo.urls.small}"  alt2="${photo.description}" alt="${photo.tags[2].title}"/>
      <div class="card-info">
          <div class="name">
              <i class="uil uil-camera"></i>
              <span>${photo.alt_description}</span>
          </div>
          <div class="card-btn">
              <button class="like-btn" data-image-id="${photo.id}">
                  <i class="uil uil-heart"></i>
              </button>
              <button class="download-btn" data-url="${photo.urls.small}">
                  <i class="uil uil-import"></i>
              </button>
          </div>
      </div>
    </li>`;
  });

  main.innerHTML += getUrls.join('');

  const likeButtons = document.querySelectorAll('.like-btn');
  const downloadButtons = document.querySelectorAll('.download-btn');

  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const imageId = button.dataset.imageId;
      likeImage(event, imageId);
    });
  });
  
  downloadButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const imageUrl = button.dataset.url;
      downloadImg(imageUrl);
      e.stopPropagation();
    });
  });
}
// -------search function-------------

function searchPhotos(query) {
  main.innerHTML='';
  unsplash.search.getPhotos({
    query: query,
    page: 1,
    perPage: 12,
    orientation: 'portrait',
  }).then((result) => {
    if (result.type === 'success') {
      const photos = result.response.results;
      displayPhotos(photos);
      currentPage=2;
      searchTerm = query; 
    }
  });
}
//loadMore function 
function loadMorePhotos() {
  if (searchTerm) {
   
    unsplash.search.getPhotos({
      query: searchTerm,
      page: currentPage,
      perPage: 10,
      orientation: 'portrait',
    }).then((result) => {
      if (result.type === 'success') {
        const photos = result.response.results;
        displayPhotos(photos);
        currentPage++; 
      }
    });
  }
}


searchPhotos('Classic Art');
//-----------  event listener of load more button-------------
loadMoreBtn.addEventListener('click', () => {
  loadMorePhotos();
});

// ------------Enter event listner of search bar-----------
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
     const query = searchInput.value.trim();
    if (query !== '') {
      searchPhotos(query);
    }
  }
});

//event Listner + popup download btn
closeBtn.addEventListener('click',hidePopupBox);
downloadImgBtn.addEventListener('click',(e)=> downloadImg(e.target.dataset.img));

//popup event
main.addEventListener('click', (event) => {
  const targetImage = event.target.closest('img');
  if (targetImage) {
      const imageUrl = targetImage.getAttribute('src');
      const altText = targetImage.getAttribute('alt');
      const desc = targetImage.getAttribute('alt2');
      showPopup(altText, imageUrl, desc);
  }
});


closeBtn.addEventListener('click', hidePopupBox);

downloadImgBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  const imageUrl = this.getAttribute('data-img');


  if (!this.classList.contains('clicked')) {
    this.classList.add('clicked'); 
    downloadImg(imageUrl);
  }
});

