let mySound;

function preload() {
soundFormats('mp3', 'ogg');
mySound = loadSound('../media/wahwah');
}

function setup() {
// Autoplay the sound when the page loads
mySound.play();
}
