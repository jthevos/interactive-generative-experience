# interactive-generative-experience

# Overview

This project creates a multi-sensory experience that outputs a piece of interactive art -
using facial movement as input. This piece of art demonstrates two diametrically
opposed states: Calm and Agitated.

The visual component is achieved by applying Perlin Noise to multiple
concentric circles. The severity of this noise scales with agitation level.

The audio component explores the use of Tibetan bowls at three different
frequencies in addition to white noise. The dissonance level of these audio
samples scales with agitation level.

All pieces communicate with the others using the Open Sound Control (OSC) protocol.

# Setup

Use of this project requires Node Package Manager (NPM). Download it [here](https://www.npmjs.com/get-npm).

Once downloaded, run `npm install` in the directory where `package.json` resides.
This will install all necessary project dependencies with the appropriate version.

After successfully installing dependencies, run `nodemon index.js` to start
the server allowing for transmission of OSC messages.

Open the browser of your choice, and navigate to localhost:3000 to begin
using the application.
