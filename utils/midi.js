function initMIDI() {
  console.log('TARS: MIDI has started. ')
	navigator
	.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure)
}

function onMIDISuccess(midiAccess) {
  console.log('TARS: MIDI is ready')
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
	// console.log({midiKeyID, value})

	// Pad 5
	if (midiKeyID === 0) {
    console.log(5)
    f = 'mosaic';
	}

  // Pad 6
	if (midiKeyID === 1) {
    console.log(6)
    f = 'mirrored';
	}

  // Pad 7
	if (midiKeyID === 2) {
    console.log(7)
    f = 'kaleidoscope';
	}

  // Pad 8
	if (midiKeyID === 3) {
    console.log(8)
    f = 'standard';
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
    f = 'mosaic';
	}

	// Knob 1
	if (midiKeyID === 70) {
		const mapKnob = map(value, 0, 127, 0, width)
    kaleidoscopeX = mapKnob
	}	

	// Knob 2
	if (midiKeyID === 71) {
		const mapKnob = map(value, 0, 127, 0, height)
    kaleidoscopeY = mapKnob
	}
  
  // Knob 3
	if (midiKeyID === 72) {
		const mapKnob = map(value, 0, 127, -1, 1)
    mosaicAmt = mapKnob;
  }

  // Knob 4
  if (midiKeyID === 73) {
    const mapKnob = map(value, 0, 127, 2, 20)
    mosaicSquares = floor(mapKnob);
  }

  // Knob 5
  if (midiKeyID === 74) {
    const mapKnob = map(value, 0, 127, 0, 0.1)
    noiseScaleY = mapKnob;
  }

  // Knob 6
  if (midiKeyID === 75) {
    const mapKnob = map(value, 0, 127, 0, 500)
    noiseScaleX = mapKnob;
  }

  // Knob 7
  if (midiKeyID === 76) {
    const mapKnob = map(value, 0, 127, 1, 200)
    horizontalSpread = mapKnob
  }

  // Knob 8
  if (midiKeyID === 77) {
    const mapKnob = map(value, 0, 127, -0.002, 0.002)
    n = mapKnob
  } 
}