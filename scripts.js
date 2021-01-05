const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');


let isRed = false;
let isRgbSplit = false;
let isGhosting = false;


const toggleRedEffects = () => {
  isRed = !isRed;
  if (isRed) {
    isGhosting = false;
  }
}

const toggleRgbSplit = () => {
  isRgbSplit = !isRgbSplit;
}

const toggleGhostingEffects = () => {
  isGhosting = !isGhosting;
  if (isGhosting) {
    isRed = false;
  }
}

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.srcObject = localMediaStream;             //play video where the source is the webcam
      video.play();
    })
    .catch(err => {
      console.error(`OH NO!!!`, err);
    });
}

function paintToCanvas() {
  const width = window.innerWidth > video.videoWidth? video.videoWidth : window.innerWidth;
  const height = window.innerHeight > video.videoHeight? video.videoHeight : window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {                         //updates feed every 16ms (60 frames/second)
    ctx.drawImage(video, 0, 0, width, height);       //takes the image from the video starting from x=0, y=0 and draws it on the canvas

    let pixels = ctx.getImageData(0, 0, width, height);   //gives an array of pixels starting from 0,0 and has the r,b,g,a of each pixel stored.

    if (isRed) {
      pixels = redEffect(pixels);

    }

    if (isRgbSplit) {
      pixels = rgbSplit(pixels);
      ctx.globalAlpha = 1;                                //ghosting effect;
    }

    if (isGhosting) {
      ctx.globalAlpha = 0.01;
    }


    if (!isRgbSplit && !isGhosting) {
      ctx.globalAlpha = 1;
    }

    // put them back
    ctx.putImageData(pixels, 0, 0);                           //display the manipulated pixels
  }, 1000/60);
}

function takePhoto() {
  // play the snap sound
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');                //"handsome" is the name we want our downloaded image to have;
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);                //insert link before the first child of strip;
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {                       //i+=4 since each pixel is represented with 4 elements rgba
    pixels.data[i + 0] = pixels.data[i + 0] + 80; // RED               //pump up red;
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN              
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED                 
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);       // when the webcam is enabled, draw video on canvas
