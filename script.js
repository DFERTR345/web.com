const API_KEY = 'AIzaSyDKFTPq4VIZxfpPF4Ve8K4VYsH6nXWKRzM';
const videoListElement = document.getElementById('video-list');
const albumImageElement = document.getElementById('album-image');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadMoreButton = document.getElementById('load-more');
const thumbnailModeButton = document.getElementById('thumbnail-mode');
const videoModeButton = document.getElementById('video-mode');
let currentVideoIndex = 0;
let videos = [];
let player;
let repeat = false;
let nextPageToken = '';
let isThumbnailMode = true;

document.getElementById('play').addEventListener('click', () => {
    playVideo(currentVideoIndex);
});

document.getElementById('prev').addEventListener('click', () => {
    currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    playVideo(currentVideoIndex);
});

document.getElementById('next').addEventListener('click', () => {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    playVideo(currentVideoIndex);
});

document.getElementById('repeat').addEventListener('click', () => {
    repeat = !repeat;
    document.getElementById('repeat').style.backgroundColor = repeat ? '#1ed760' : '#1db954';
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    searchVideos(query);
});

loadMoreButton.addEventListener('click', () => {
    fetchPopularVideos(nextPageToken);
});

thumbnailModeButton.addEventListener('click', () => {
    isThumbnailMode = true;
    document.getElementById('player').style.display = 'none';
    document.querySelector('.album-cover').style.display = 'block';
});

videoModeButton.addEventListener('click', () => {
    isThumbnailMode = false;
    document.getElementById('player').style.display = 'block';
    document.querySelector('.album-cover').style.display = 'none';
});

function playVideo(index) {
    const video = videos[index];
    albumImageElement.src = video.snippet.thumbnails.high.url;
    if (isThumbnailMode) {
        player.cueVideoById(video.id.videoId);
    } else {
        player.loadVideoById(video.id.videoId);
    }
}

function fetchPopularVideos(pageToken = '') {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&chart=mostPopular&regionCode=KR&type=video&videoCategoryId=10&maxResults=10&pageToken=${pageToken}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            videos = videos.concat(data.items);
            nextPageToken = data.nextPageToken;
            displayVideoList();
        })
        .catch(error => console.error('Error:', error));
}

function searchVideos(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=10&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            videos = data.items;
            displayVideoList();
        })
        .catch(error => console.error('Error:', error));
}

function displayVideoList() {
    videoListElement.innerHTML = '';
    videos.forEach((video, index) => {
        const listItem = document.createElement('li');
        const thumbnail = document.createElement('img');
        thumbnail.src = video.snippet.thumbnails.high.url;
        const videoInfo = document.createElement('div');
        videoInfo.className = 'video-info';
        videoInfo.textContent = video.snippet.title.replace(/<\/?[^>]+(>|$)/g, ""); // HTML 태그 제거
        listItem.appendChild(thumbnail);
        listItem.appendChild(videoInfo);
        listItem.addEventListener('click', () => {
            currentVideoIndex = index;
            playVideo(currentVideoIndex);
        });
        videoListElement.appendChild(listItem);
    });
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    fetchPopularVideos();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED && repeat) {
        playVideo(currentVideoIndex);
    }
}
