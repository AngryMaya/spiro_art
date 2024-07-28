let bgR, bgr, bgd, bgBrightness;
let spiroR, spiror, spirod;
let angle = 0;
let direction;
let bgRSlider, bgrSlider, bgdSlider, bgBrightnessSlider;
let spiroRSlider, spirorSlider, spirodSlider, directionButton;
let spiroSpeedSlider, lineColorSlider, lineThicknessSlider;
let bgGraphics, spiroGraphics;
let trail = [];
let currentLineColor;
let currentLineThickness;
let isAnimating = true;
let stopButton, saveButton, restartButton;
let isAutoPilot = false;
let autoPilotButton;
let lastAutoChange = 0;
const AUTO_CHANGE_INTERVAL = 5000; // Changes parameters every 5 seconds
let music; // Variable to hold the sound file
let headerImage; // Variable to hold the header image
let audioStarted = false; // New variable to track if audio has started

function preload() {
  // Load the audio file and header image
  music = loadSound('Short Meditation Music - 3 Minute Relaxation Calming.mp3');
  headerImage = loadImage('כותרת.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgGraphics = createGraphics(width, height);
  spiroGraphics = createGraphics(width, height);
  spiroGraphics.noFill();

  // Initialize parameters
  bgR = random(50, 200);
  bgr = random(10, 50);
  bgd = random(10, 100);
  bgBrightness = 100;
  spiroR = random(50, 200);
  spiror = random(10, 50);
  spirod = random(10, 100);
  direction = 1;
  currentLineColor = 0;
  currentLineThickness = 2;

  // Create sliders
  bgRSlider = createSlider(50, 200, bgR);
  bgrSlider = createSlider(10, 50, bgr);
  bgdSlider = createSlider(10, 100, bgd);
  bgBrightnessSlider = createSlider(0, 255, bgBrightness);
  spiroRSlider = createSlider(50, 200, spiroR);
  spirorSlider = createSlider(10, 50, spiror);
  spirodSlider = createSlider(10, 100, spirod);
  spiroSpeedSlider = createSlider(1, 100, 10);
  lineColorSlider = createSlider(0, 255, 0);
  lineThicknessSlider = createSlider(1, 10, 2, 0.1);

  // Create buttons
  directionButton = createButton('Direction');
  directionButton.mousePressed(changeDirection);
  
  stopButton = createButton('Stop/Resume');
  stopButton.mousePressed(toggleAnimation);
  
  saveButton = createButton('Save Image');
  saveButton.mousePressed(saveMandala);
  
  restartButton = createButton('Restart');
  restartButton.mousePressed(restartMandala);

  autoPilotButton = createButton('Auto Pilot');
  autoPilotButton.mousePressed(toggleAutoPilot);

  // Style buttons
  [directionButton, stopButton, saveButton, restartButton, autoPilotButton].forEach(button => {
    button.style('width', '120px'); // Adjust as needed
    button.style('height', '30px'); // Adjust as needed
    button.style('font-size', '14px');
    button.style('border-radius', '10px'); // Rounded corners
    button.style('border', 'none');
    button.style('background-color', 'white');
    button.style('color', 'black');
    button.style('cursor', 'pointer');
    button.style('margin', '5px'); // Optional: Add margin to space out buttons
  });

  // Add input events
  bgRSlider.input(updateBackground);
  bgrSlider.input(updateBackground);
  bgdSlider.input(updateBackground);
  bgBrightnessSlider.input(updateBackground);
  lineColorSlider.input(updateLineColor);
  lineThicknessSlider.input(updateLineThickness);

  updateBackground();
  positionControls();
  // music.loop(); // Remove this line
}

function draw() {
  // Check if audio context is running, if not, display a message
  if (!audioStarted) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Click anywhere to start your experience', width/2, height/2);
    return;
  }

  updateBackground();
  image(bgGraphics, 0, 0);

  // Draw header image at the top center of the canvas
  image(headerImage, width / 2 - headerImage.width / 2, 0);

  if (isAnimating) {
    spiroGraphics.push();
    spiroGraphics.translate(width / 2, height / 2);

    spiroR = spiroRSlider.value();
    spiror = spirorSlider.value();
    spirod = spirodSlider.value();

    let x = (spiroR - spiror) * cos(angle) + spirod * cos(((spiroR - spiror) / spiror) * angle);
    let y = (spiroR - spiror) * sin(angle) - spirod * sin(((spiroR - spiror) / spiror) * angle);

    trail.push({ x, y, color: currentLineColor, thickness: currentLineThickness });

    if (trail.length > 1000) {
      trail.shift();
    }

    for (let i = 0; i < trail.length - 1; i++) {
      let alpha = map(i, 0, trail.length, 50, 255);
      spiroGraphics.stroke(trail[i].color, alpha);
      spiroGraphics.strokeWeight(trail[i].thickness);
      spiroGraphics.line(trail[i].x, trail[i].y, trail[i+1].x, trail[i+1].y);
    }

    let spiroSpeed = spiroSpeedSlider.value() * 0.001;
    angle += spiroSpeed * direction;
    spiroGraphics.pop();
  }

  image(spiroGraphics, 0, 0);
  drawLabels();

  if (isAutoPilot && millis() - lastAutoChange > AUTO_CHANGE_INTERVAL) {
    updateAutoPilot();
    lastAutoChange = millis();
  }
}

// Add this new function to handle mouse presses
function mousePressed() {
  if (!audioStarted) {
    // Try to start the audio context
    getAudioContext().resume().then(() => {
      console.log('AudioContext started');
      music.loop(); // Start the music loop here
      audioStarted = true;
    });
  }
}

function changeDirection() {
  direction *= -1;
}

function toggleAnimation() {
  isAnimating = !isAnimating;
}

function saveMandala() {
  let mandalaGraphics = createGraphics(width, height);
  mandalaGraphics.image(bgGraphics, 0, 0);
  mandalaGraphics.image(spiroGraphics, 0, 0);
  save(mandalaGraphics, 'mandala.png');
}

function restartMandala() {
  spiroGraphics.clear();
  trail = [];
  angle = 0;
}

function updateBackground() {
  bgGraphics.clear();
  
  let r = map(bgRSlider.value(), 50, 200, 0, 255);
  let g = map(bgrSlider.value(), 10, 50, 0, 255);
  let b = map(bgdSlider.value(), 10, 100, 0, 255);
  let brightness = bgBrightnessSlider.value();
  
  let bgColor = color(r, g, b);
  bgColor = color(
    constrain(red(bgColor) + brightness - 128, 0, 255),
    constrain(green(bgColor) + brightness - 128, 0, 255),
    constrain(blue(bgColor) + brightness - 128, 0, 255)
  );
  
  let gradientColor1 = bgColor;
  let gradientColor2 = color(255 - red(bgColor), 255 - green(bgColor), 255 - blue(bgColor));
  
  let yOffset = (frameCount * 0.5) % height;
  
  for (let y = -height; y < height; y++) {
    let inter = map(y + yOffset, 0, height, 0, 1);
    let c = lerpColor(gradientColor1, gradientColor2, inter);
    bgGraphics.stroke(c);
    bgGraphics.line(0, y + yOffset, width, y + yOffset);
  }
}

function updateLineColor() {
  currentLineColor = lineColorSlider.value();
}

function updateLineThickness() {
  currentLineThickness = lineThicknessSlider.value();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bgGraphics.resizeCanvas(windowWidth, windowHeight);
  spiroGraphics.resizeCanvas(windowWidth, windowHeight);
  
  positionControls();
  updateBackground();
  trail = [];
}

function positionControls() {
  let centerX = width / 2;
  let bottomY = height - 110;
  let sliderWidth = 120;
  let sliderHeight = 20;
  let padding = 20;
  let labelPadding = 60;

  bgRSlider.position(centerX - 2.5*sliderWidth - 3*padding, bottomY - 2*sliderHeight - padding);
  bgrSlider.position(centerX - 1.5*sliderWidth - 2*padding, bottomY - 2*sliderHeight - padding);
  bgdSlider.position(centerX - 0.5*sliderWidth - padding, bottomY - 2*sliderHeight - padding);
  bgBrightnessSlider.position(centerX + 0.5*sliderWidth, bottomY - 2*sliderHeight - padding);
  spiroRSlider.position(centerX + 1.5*sliderWidth + padding, bottomY - 2*sliderHeight - padding);

  spirorSlider.position(centerX - 2.5*sliderWidth - 3*padding, bottomY);
  spirodSlider.position(centerX - 1.5*sliderWidth - 2*padding, bottomY);
  spiroSpeedSlider.position(centerX - 0.5*sliderWidth - padding, bottomY);
  lineColorSlider.position(centerX + 0.5*sliderWidth, bottomY);
  lineThicknessSlider.position(centerX + 1.5*sliderWidth + padding, bottomY);

  let buttonY = bottomY + 33;
  let buttonWidth = 120;
  let buttonSpacing = 20;
  let totalButtonWidth = 5 * buttonWidth + 4 * buttonSpacing;
  let buttonStartX = centerX - totalButtonWidth / 2;

  directionButton.position(buttonStartX, buttonY);
  stopButton.position(buttonStartX + buttonWidth + buttonSpacing, buttonY);
  saveButton.position(buttonStartX + 2 * (buttonWidth + buttonSpacing), buttonY);
  restartButton.position(buttonStartX + 3 * (buttonWidth + buttonSpacing), buttonY);
  autoPilotButton.position(buttonStartX + 4 * (buttonWidth + buttonSpacing), buttonY);
}

function toggleAutoPilot() {
  isAutoPilot = !isAutoPilot;
  if (isAutoPilot) {
    autoPilotButton.html('Auto Pilot Enabled');
  } else {
    autoPilotButton.html('Auto Pilot');
  }
}

function updateAutoPilot() {
  spiroRSlider.value(random(50, 200));
  spirorSlider.value(random(10, 50));
  spirodSlider.value(random(10, 100));
  spiroSpeedSlider.value(random(1, 100));
  lineColorSlider.value(random(0, 255));
  lineThicknessSlider.value(random(1, 10));
}

function drawLabels() {
  fill(255);
  textSize(14);
  textAlign(CENTER);

  text('Background R', bgRSlider.x + bgRSlider.width / 2, bgRSlider.y - 10);
  text('Background G', bgrSlider.x + bgrSlider.width / 2, bgrSlider.y - 10);
  text('Background B', bgdSlider.x + bgdSlider.width / 2, bgdSlider.y - 10);
  text('Brightness', bgBrightnessSlider.x + bgBrightnessSlider.width / 2, bgBrightnessSlider.y - 10);
  text('Spiro R', spiroRSlider.x + spiroRSlider.width / 2, spiroRSlider.y - 10);
  text('Spiro G', spirorSlider.x + spirorSlider.width / 2, spirorSlider.y - 10);
  text('Spiro B', spirodSlider.x + spirodSlider.width / 2, spirodSlider.y - 10);
  text('Spiro Speed', spiroSpeedSlider.x + spiroSpeedSlider.width / 2, spiroSpeedSlider.y - 10);
  text('Line Color', lineColorSlider.x + lineColorSlider.width / 2, lineColorSlider.y - 10);
  text('Line Thickness', lineThicknessSlider.x + lineThicknessSlider.width / 2, lineThicknessSlider.y - 10);
}