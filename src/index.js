import './css/styles.css';
import './css/gallery.css';
import './css/form.css';
import './css/btnBackToTop.css';
import './js/spinner.js';
import comeBackToTopPage from './js/btnUpTop';
import markupGallery from './templates/markupGallary.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import fetchSearchPhoto from './js/fetch';

// DOM elements
const refs = {
    formEL: document.querySelector(".search-form"),
    inputEl: document.querySelector("input[name='searchQuery']"),
    btnSubmit: document.querySelector("button[type='submit']"),
    gallaryEl: document.querySelector(".gallery"),
};

let page = 1;
let perPage = 40;
let inputValue = "";
let simpleLightBox; 


// Searching photo
refs.formEL.addEventListener("submit", handleSearchPhotoBySubmitForm);

// handler "Searching photo"
function handleSearchPhotoBySubmitForm(e) {
    // don`t restart page
    e.preventDefault();
    // restarting page number , when you start new searching 
    page = 1;
    // it`s word that you searching
    inputValue = refs.inputEl.value.trim();

    comeBackToTopPage();
    /* when you don`t enter word by searching, returned message about error
    and code stoped*/ 
    if (inputValue === "") {
        return photoSearchError();
    };
        // get info by API 
     fetchSearchPhoto(inputValue, page, perPage)
         .then(({ totalHits, hits }) => {
            // Total number of pages
            const totalPages = Math.ceil(totalHits / perPage);
            /* checking query, if he empty, then show a message and 
            don`t show button "load More"*/  
            if (hits.length === 0) {
                destroyMarkup();
                return photoSearchError();
            };

            destroyMarkup();
            showMessageAboutAllPhoto(totalHits);           
            createMarkup(hits);
            createSimpleLightbox();
            /* check the data received from the backend database, 
            if there is no data, show a message about end search + 
            don`t show button "load More"*/
            if (page >= totalPages) { 
                showInfoMessageEndSearch()
            };
        })
        .catch(() => {
            photoSearchError();
        })
};


// =============== infinity scroll =================
const options = {    
    rootMargin: '500px',
};
const callback = (entries) => {
    entries.forEach(entrie => {
        if (entrie.isIntersecting && inputValue !== "")  {
            page += 1;
            console.log(page);
            fetchSearchPhoto(inputValue, page, perPage)
            .then(({totalHits, hits}) => {           
            // Total number of pages
            const totalPages = Math.ceil(totalHits / perPage)
            /* check the data received from the backend database, 
            if there is no data, show a message about end search + 
            don`t show button "load More"*/
            if (page > totalPages) {
                showInfoMessageEndSearch();
            }    
                createMarkup(hits);
                simpleLightBox.destroy();
                createSimpleLightbox();
        })
        .catch((error) => {
            console.log(error)
        })
        }
    });
};
const observer = new IntersectionObserver(callback, options);
observer.observe(document.querySelector('#scrollArea'));






//!================ All functions ========================= 
function createMarkup(data) {
    refs.gallaryEl.insertAdjacentHTML("beforeend", markupGallery(data));
};
function destroyMarkup() {
    refs.gallaryEl.innerHTML = "";
}
function photoSearchError() {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");    
};
function showMessageAboutAllPhoto(totalHits) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`)
}
function showInfoMessageEndSearch() {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")
}
function createSimpleLightbox () {
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();
};


