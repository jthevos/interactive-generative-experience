var face = [];
var position = {x:0, y:0};
var scale = 0;
var orientation = {x:0, y:0, z:0};
var mouthWidth = 0;
var mouthHeight = 0;
var eyebrowLeft = 0;
var eyebrowRight = 0;
var eyeLeft = 0;
var eyeRight = 0;
var jaw = 0;
var nostrils = 0;

// known FaceOSC array positions
let noseChinDistance;
const CHIN_BOTTOM = 8;
const NOSE_BRIDGE = 29;

const CALM_STATE     = 0.002;
const AGITATED_STATE = 0.5;

let diam;
let steps = 90;  // sides of the polygon. Increasing this will result in a more
                 // circular shape
let sinStep;


let slider;

let whiteNoise;
let calmSound;
let agitatedSound;
let agitatedBassSound;

// known frequency of the tibetanBowl audio sample
let tibetanBowlFrequency = 92.4986056779086;

function setup() {
    sinStep = TWO_PI/steps;
    smooth(16);
  	createCanvas(window.innerWidth, window.innerHeight, P2D);
	//setupOsc(8338, 3334);
    slider = createSlider(0, 100, 0);

    // load in the calm sound and set its volume to full
    calmSound = loadSound('../audio/tibetanBowl.wav', () => {
        calmSound.loop();
        calmSound.setVolume(100);
    });

    // load in white noise sound and set its volume to 0
    whiteNoise = loadSound('../audio/whiteNoise.wav', () => {
        whiteNoise.loop();
        whiteNoise.setVolume(0);
    });

    // load in both agitated sounds, adjust their playback rates,
    // and set their volumes to 0
    agitatedSound = loadSound('../audio/tibetanBowl.wav', () => {
        agitatedSound.loop();
        agitatedSound.setVolume(0);

        // map to 0 - 1 range and set the new rate
        agitatedSoundRate = mapValue(89.5, 0, tibetanBowlFrequency, 0, 1);
        agitatedSound.rate(agitatedSoundRate);
    });

    agitatedBassSound = loadSound('../audio/tibetanBowl.wav', () => {
        agitatedBassSound.loop();
        agitatedBassSound.setVolume(0);

        // map to 0 - 1 range and set the new rate
        bassSoundRate = mapValue(10, 0, tibetanBowlFrequency, 0, 1);
        agitatedBassSound.rate(bassSoundRate);
    });
}

function draw() {
  	background(20);
    noFill();

    let agitationLevel = mapValue(noseChinDistance, 110, 200, 0, 1);
    let sliderVal = slider.value();
    let scaledSliderVal = mapValue(slider.value(), 0, 100, 0, 1);
    //oscDebug(vibrationSpeed);

    // Audio Piece
    whiteNoise.setVolume(sliderVal);
    agitatedSound.setVolume(sliderVal);
    agitatedBassSound.setVolume(sliderVal);


    // Visual Piece
    if (face.length > 0) {
		var faceParts = [[0,16], [17,21], [22,26], [27,30], [31,35], [36,41], [42,47], [48,59], [60,65]];
		noFill();
        noseChinDistance = distance(face[29].x, face[29].y, face[8].x, face[8].y);
	}

    diam = 150;  // set diameter in pixels

    while (diam < width/2) {
        //oscDebug(diam);
        push();
        translate(width/2, height/2);
        beginShape();
        for(j = 0; j < steps; j++) {
            let n;

            if (diam % 2 == 0) {
                //stroke('rgba(100,100,255,1)');
                stroke(230);
                n = noise(sin(j*sinStep/2), diam * 0.006, frameCount * CALM_STATE);

            } else {
                stroke(`rgba(255,255,255,${scaledSliderVal})`);
                n = noise(sin(j*sinStep/2), diam * 0.006, frameCount * AGITATED_STATE);
            }

            let x = sin(j * sinStep) * diam * n;
            let y = cos(j * sinStep) * diam * n;
            vertex(x,y);

        }
        endShape(CLOSE);
        pop();
        diam += 7;

    }
}

// experimental function - do not use yet
function setFrequency(sample, frequency) {
    let rateChangeFactor = frequency / tibetanBowlFrequency;
    sample.rate(sample.sampleRate() * rateChangeFactor);
}

// aritifically throttle osc messages printing
function oscDebug(...args) {
    let randnum = Math.floor(Math.random() * 100);
    if (randnum % 17 == 0) {
        print(args);
    }
}

// simple distance formula. This might exist in the Math class
function distance(x1,y1,x2,y2) {
    return ((x1 - x2)**2 + (y1 - y2)**2)**(1/2)
}

// linear scale mapping between two scales given a value
function mapValue(value, minValue, maxValue, minResultValue, maxResultValue) {
    if (value < minValue || value > maxValue) {
        return 0.003;   // return minimum agitation level if invalid mapping
    }

    let normalized = (value - minValue) / (maxValue - minValue);
    let result = normalized * (maxResultValue - minResultValue) + minResultValue;

    return result;
}

// handle osc receipt
function receiveOsc(address, value) {
	if (address == '/raw') {
		face = [];
		for (var i=0; i<value.length; i+=2) {
			face.push({x:value[i], y:value[i+1]});
		}
	}
	else if (address == '/pose/position') {
		position = {x:value[0], y:value[1]};
	}
	else if (address == '/pose/scale') {
		scale = value[0];
	}
	else if (address == '/pose/orientation') {
		orientation = {x:value[0], y:value[1], z:value[2]};
	}
	else if (address == '/gesture/mouth/width') {
		mouthWidth = value[0];
	}
	else if (address == '/gesture/mouth/height') {
		mouthHeight = value[0];
	}
	else if (address == '/gesture/eyebrow/left') {
		eyebrowLeft = value[0];
	}
	else if (address == '/gesture/eyebrow/right') {
		eyebrowRight = value[0];
	}
	else if (address == '/gesture/eye/left') {
		eyeLeft = value[0];
	}
	else if (address == '/gesture/eye/right') {
		eyeRight = value[0];
	}
	else if (address == '/gesture/jaw') {
		jaw = value[0];
	}
	else if (address == '/gesture/nostrils') {
		nostrils = value[0];
	}
}

// in = 8338 out = 3334
// need an async function here, otherwise we get an io undefined error.
async function setupOsc(oscPortIn, oscPortOut) {
	var socket = await io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '127.0.0.1'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
                //sendOscToPython()
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}
