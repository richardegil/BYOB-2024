function initMIDI() {
  console.log('TARS: MIDI has started. ')
	navigator
	.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure)
}

function onMIDISuccess(midiAccess) {
  console.log('"TARS: MIDI is ready')
  const inputs = midiAccess.inputs
	
	inputs.forEach(input => {
		input.onmidimessage = handleMidi
	})
}

function onMIDIFailure(error) {
	console.log("TARS: " + error)
}

function handleMidi (message) {
	let [_, midiKeyID, value] = message.data
	console.log({midiKeyID, value})

	// Pad 1
	if (midiKeyID === 0) {
    console.log(1)
    currentCanvas = cnvs[0];
	}

  // Pad 2
	if (midiKeyID === 1) {
    console.log(2)
    shapeValue = "box"
    currentCanvas = cnvs[1];
	}

  // Pad 3
	if (midiKeyID === 2) {
    console.log(3)
    currentCanvas = cnvs[2];
	}

  // Pad 4
	if (midiKeyID === 3) {
    console.log(4)
    currentCanvas = cnvs[3];
	}

  // Pad 5
	if (midiKeyID === 4) {
    console.log(5)
    f = 'standard';
	}

  // Pad 6
	if (midiKeyID === 5) {
    console.log(6)
    f = 'kaleidoscope';
	}

  // Pad 7
	if (midiKeyID === 6) {
    console.log(7)
    f = 'mirrored';
	}

  // Pad 8
	if (midiKeyID === 7) {
    console.log(8)
    f = 'tiled';
	}

	// Knob 1
	if (midiKeyID === 70) {
		const mapKnob = map(value, 0, 127, -0.003, 0.001)
    threshold = mapKnob
    console.log({threshold})
	}	

	// Knob 2
	if (midiKeyID === 71) {
		const mapKnob = map(value, 0, 127, 0, 0.01)
    mapZ = map(value, 0, 127, 0, 1000)
    console.log({mapZ})
	}
  
  // Knob 3
	if (midiKeyID === 72) {
		const mapKnob = map(value, 0, 127, 0, 0.01)
    noiseScaleX = mapKnob;
    console.log({noiseScaleX})
}

// Knob 4
if (midiKeyID === 73) {
  const mapKnob = map(value, 0, 127, 0, 0.01)
  noiseScaleY = mapKnob;
  console.log({noiseScaleY})
}

  // Knob 5
  if (midiKeyID === 74) {
    const mapKnob = map(value, 0, 127, 0, 2)
    color = mapKnob;
    console.log({color})
  }

  // Knob 6
  if (midiKeyID === 75) {
    const mapKnob = map(value, 0, 127, 0, 500)
    beta = mapKnob;
    console.log({beta})
  }

  // Knob 7
  if (midiKeyID === 76) {
    const mapKnob = map(value, 0, 127, -0.02, 0.02)
    m = mapKnob
  }

  // Knob 8
  if (midiKeyID === 77) {
    const mapKnob = map(value, 0, 127, -0.002, 0.002)
    n = mapKnob
  } 
}