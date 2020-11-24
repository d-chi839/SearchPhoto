'use strict';

const apiKey = 'ca08e52614856ae2edacf88cda59f3ff';

const IS_INITIALIZED = "IS_INITIALIZED";
const IS_FETCHING = "IS_FETCHING";
const IS_FAILED = "IS_FAILED";
const IS_FOUND = "IS_FOUND";

const requestFlickrUrl = (searchText) => {
    const parameter = $.param({
        method: 'flickr.photos.search',
        api_key: apiKey,
        text: searchText,
        license: '4',
        extras: 'owner_name,license',
        format: 'json',
        nojsoncallback: 1,
    });
    let url = `https://api.flickr.com/services/rest/?${parameter}`;
    return url;
}; 

// 画像URL
const getFlickrImageUrl = (photo, size) => {
    let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
    
    if (size) {
        url += `_${size}`
    }
    url += '.jpg';
    return url;
};

// ページURL
const getFlickrPageUrl = (photo) => `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;

// alt
const getFlickrText = (photo) => {
    let text = `"${photo.title}" by ${photo.ownername}`;
    if (photo.license === '4') {
        text += " / CC BY";
    }
    return text;
};

// ツールチップ
Vue.directive('tooltip', {
    bind(el, binding) {
        $(el).tooltip({
            title: binding.value,
            placement: 'bottom',
            trigger: 'hover',
        });
    },
    unbind(el) {
        $(el).tooltip('dispose');
    },
});

new Vue({
    el: '#app',
    props: {
        searchText: '',
    },
    data:{
        search: this.searchText,
        photos: [],
        currentState: IS_INITIALIZED,
    },
    computed: {
        isInitialized: function() {
            return this.currentState === IS_INITIALIZED;
        },
        isFetching: function() {
            return this.currentState === IS_FETCHING;
        },
        isFailed: function() {
            return this.currentState === IS_FAILED;
        },
        isFound: function() {
            return this.currentState === IS_FOUND;
        },
    },
    methods: {
        toFetching() {
            this.currentState = IS_FETCHING;
        },
        toFailed() {
            this.currentState = IS_FAILED;
        },
        toFound() {
            this.currentState = IS_FOUND;
        },
        
        
        getPhoto(event) {
            
            const url = requestFlickrUrl(this.searchText);

            this.toFetching();

            axios.get(url)
            .then((response) => {
                console.log(response);
                
                this.photos = response.data.photos.photo.map(photo => ({
                    id: photo.id,
                    imgUrl: getFlickrImageUrl(photo, 'q'),
                    pageUrl: getFlickrPageUrl(photo),
                    text: getFlickrText(photo),
            }))

            const fetchedPhotos = response.data.photos.photo;

            if (fetchedPhotos.length === 0) {
                this.toFailed();
                return;
            }
            
            this.toFound();
            
            })
            .catch((error) => {
                console.log(error);
            });
                
        },

    },
});
