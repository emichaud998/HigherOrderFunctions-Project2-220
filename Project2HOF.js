let url = 'https://people.cs.umass.edu/~joydeepb/robot.jpg';
let robot = lib220.loadImageFromURL(url);
robot.show();
imageMap(robot, function(img, x, y) {
const c = img.getPixel(x, y);
return [c[0], 0, 0];
}).show();

imageMask(robot, function(img, x, y) {
return (y % 10 === 0);}, [1, 0, 0]).show();

blurImage(robot).show();
darken(robot).show();
lighten(robot).show();
lightenAndDarken(robot).show();


//imageMap(img: Image, func: (img: Image, x: number, y: number) => Pixel): Image
function imageMap(img, func){
  let imgCopy = img.copy();

  //Traverses through the whole pixel array
  for (let y = 0; y < img.height; ++y){
    for (let x = 0; x < img.width; ++x){
      let pix = func(img, x, y); //Gets the pixel value according to the unique function passed in
      imgCopy.setPixel(x, y, pix);
    }
  }
  return imgCopy;  
}

//imageMask(img: Image,func: (img: Image, x: number, y: number) => boolean, maskValue: Pixel): Image
function imageMask(img, func, maskValue){

  /*Passes in function to imageMap that returns maskValue value of pixel when function passed into imageMask returns
  true and returns original pixel values if function returns false*/
  let image = imageMap(img, function(img, x, y){
    if (func(img, x, y)){
      return maskValue;
    }
    else{
      return img.getPixel(x,y);
    }
  });
    return image;
}

//blurPixel(img: Image, x: number, y: number): Pixel
function blurPixel(img, x, y){
  let total = 0;
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;

  //Starts 5 pixels to the left of current pixel and traverses all the way through 5 pixels to the right of current pixel
  for (let i = x-5; i < img.width; ++i){
    if (i < 0){  //Edge case when there is not 5 pixels before current pixel
      ++count;
      continue;
      } 
    if (count === 11){ //Breaks when 11 pixels have been checked and accounted for
      break;
    }

    //Takes the sum of values of each color for adjacent pixels
    let pix = img.getPixel(i, y);
    r = r + pix[0];
    g = g + pix[1];
    b = b + pix[2];
    ++count;
    ++total; //Keeps track of the total pixels added together
  }

  //Returns the sums of r, g, and b divided by the total pixels added together (average)
  return ([r/total, g/total, b/total]);
}

//blurImage(img: Image): Image
function blurImage(img){
  return imageMap(img, blurPixel);
}

//isDark(img: Image, x: number, y: number): boolean
function isDark(img, x, y){
  let pix = img.getPixel(x, y);

  if ((pix[0] < 0.5) && (pix[1] < 0.5) && (pix[2] < 0.5)){
    return true;
  }
  return false;
}

//darken(img: Image): Image
function darken(img){

  //Passes in function to imageMap that returns black pixel if isDark is true and original pixel values otherwise
  return imageMap(img, function(img, x, y){
    if (isDark(img, x, y)){
      return [0, 0, 0];
    }
    else{
      return img.getPixel(x, y);
    }
  });
}
//isLight(img: Image, x: number, y: number): boolean
function isLight(img, x, y){
  let pix = img.getPixel(x, y);
  if ((pix[0] >= 0.5) && (pix[1] >= 0.5) && (pix[2] >= 0.5)){
    return true;
  }
  return false;
}

//lighten(img: Image): Image
function lighten(img){
  //Passes in function to imageMap that returns white pixel if isLight is true and original pixel values otherwise
  return imageMap(img, function(img, x, y){
    if (isLight(img, x, y)){
      return [1, 1, 1];
    }
    else{
      return img.getPixel(x, y);
    }
  });
}

//lightenAndDarken(img: Image): Image
function lightenAndDarken(img){
  //Lightens and darkens to produce image with black and white sections
  let image = lighten(img);
  return darken(image);
}

//Testing Code
test('imageMap function definition is correct', function() {
let identityFunction = function(image, x, y) {
return image.getPixel(x, y);
};
let inputImage = lib220.createImage(10, 10, [0, 0, 0]);
let outputImage = imageMap(inputImage, identityFunction);
// Output should be an image, so getPixel must work without errors.
let p = outputImage.getPixel(0, 0);
assert(p[0] === 0);
assert(p[1] === 0);
assert(p[2] === 0);
assert(inputImage !== outputImage);
});

function pixelEq (p1, p2) {
const epsilon = 0.002;
for (let i = 0; i < 3; ++i) {
if (Math.abs(p1[i] - p2[i]) > epsilon) {
return false;
}
}
return true;
};

test('identity function with imageMap', function() {
let identityFunction = function(image, x, y ) {
return image.getPixel(x, y);
};
let inputImage = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
inputImage.setPixel(0, 0, [0.5, 0.5, 0.5]);
inputImage.setPixel(5, 5, [0.1, 0.2, 0.3]);
inputImage.setPixel(2, 8, [0.9, 0.7, 0.8]);
let outputImage = imageMap(inputImage, identityFunction);
assert(pixelEq(outputImage.getPixel(0, 0), [0.5, 0.5, 0.5]));
assert(pixelEq(outputImage.getPixel(5, 5), [0.1, 0.2, 0.3]));
assert(pixelEq(outputImage.getPixel(2, 8), [0.9, 0.7, 0.8]));
assert(pixelEq(outputImage.getPixel(9, 9), [0.2, 0.2, 0.2]));
});

test('No blue or green in removeBlueAndGreen result', function() {
// Create a test image, of size 10 pixels x 10 pixels, and set it to all white.
const white = lib220.createImage(10, 10, [1,1,1]);
// Get the result of the function.
const shouldBeRed = imageMap(white, function(img, x, y) {
const c = img.getPixel(x, y);
return [c[0], 0, 0];
});
// Read the center pixel.
const pixelValue = shouldBeRed.getPixel(5, 5);
// The red channel should be unchanged.
assert(pixelValue[0] === 1);
// The green channel should be 0.
assert(pixelValue[1] === 0);
// The blue channel should be 0.
assert(pixelValue[2] === 0);
});

function pixelEq (p1, p2) {
const epsilon = 0.002;
for (let i = 0; i < 3; ++i) {
if (Math.abs(p1[i] - p2[i]) > epsilon) {
return false;
}
}
return true;
};

test('blur image', function() {
// Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
const image = lib220.createImage(11, 1, [0.6, 0.6, 0.6]);
for (let i = 0; i<5; ++i){
  image.setPixel(i, 0, [0.2, 0.2, 0.2]);
}
image.setPixel(5, 0, [0.8, 0.8, 0.8]);
// Process the image.
const output = blurImage(image);
let outpix = output.getPixel(5,0);
assert(pixelEq(outpix, [0.4363636364, 0.4363636364, 0.4363636364]));

outpix = output.getPixel(8,0);
assert(pixelEq(outpix, [0.525, 0.525, 0.525]));

});