
loadAPI(1);

host.defineController("Novation", "Automap MIDI Nocturn", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Automap MIDI"], ["Automap MIDI"]);

var states = { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0 };


var MODE_PAGE =
{
	MIXER : 0,
	DEVICE : 1
};

var CC_ENCODER =
[
	20,
    21,
    22,
    23,
    24,
    25,
    26,
    27
];

var CC_FADER =
[
    28
];

var CC_BUTTON =
[
	30,
    31,
    32,
    33,
    34,
    35,
    36,
    37
];

var current_page = MODE_PAGE.MIXER

function makeIndexedFunction(index, f) {
    return function (value) {
        f(index, value);
    };
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    host.getMidiInPort(0).setSysexCallback(onSysex);

    /* Host */
    transport = host.createTransport();
    transport.addIsPlayingObserver(function (on) {
        isPlaying = on;
        println(isPlaying ? "PLAY" : "STOP");
    });

    trackBank = host.createTrackBank(8, 2, 0);

    /* TRACK BANK */
    for (var t = 0; t < 8; t++) {
        var track = trackBank.getTrack(t);

        track.getVolume().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            println("Volume: track: " + index + " value: " + value);
            if (current_page == MODE_PAGE.MIXER) {
                states[20 + index] = value
            }
        })

        );
    }

    /* CURSOR TRACK */
    cursorTrack = host.createCursorTrackSection(2, 0);

    /* CURSOR DEVICE */
    cursorDevice = host.createCursorDeviceSection(8);
    cursorDevice.addSelectedPageObserver(0, function (page) {
      //  println("page: " + page );
    });
    primaryInstrument = cursorTrack.getPrimaryInstrument();
    for (var p = 0; p < 8; p++) {
        var macro = primaryInstrument.getMacro(p).getAmount();
        macro.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            if (current_page == MODE_PAGE.DEVICE) {
                states[20 + index] = value
            }
        }));
    }
}

function exit() {
}

function pausecomp(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while (curDate - date < millis);
}

function flush() {
    var index;
    //println("page " + current_page );
    for (var key in states) {
        //pausecomp(200);
    
        //println("flush() key: " + key + " states[key]: " + states[key]);

        sendChannelController(0, key, states[key]);
    }

}

function onMidi(status, data1, data2) {
    println("onMidi() status: " + status + " data1: " + data1 + " data2: " + data2);

    if (CC_ENCODER.indexOf(data1) > -1) {
        println("onMidi() CC_ENCODER.data1: " + CC_ENCODER.indexOf(data1));
        println("onMidi() encoder data");
        if (current_page == MODE_PAGE.MIXER)
            trackBank.getTrack(CC_ENCODER.indexOf(data1)).getVolume().set(data2, 128);
    }
    else if (CC_FADER.indexOf(data1) > -1) {
        println("onMidi() CC_FADER.data1: " + CC_FADER.indexOf(data1));
        println("onMidi() fader data");

    }
    else if (CC_BUTTON.indexOf(data1) > -1) {
        println("onMidi() CC_BUTTON.data1: " + CC_BUTTON.indexOf(data1));
        println("onMidi() button data");
        current_page=CC_BUTTON.indexOf(data1);
        for (var key in CC_BUTTON) {
            states[CC_BUTTON[key]] = 0;
        }
    }

    states[data1] = data2;

}

function onSysex(data) {
}

