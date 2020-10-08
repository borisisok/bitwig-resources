
loadAPI(1);

host.defineController("bgom", "Automap MIDI Nocturn", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Automap MIDI"], ["Automap MIDI"]);

const MODE_PAGE =
{
    MIXER: 0,
    DEVICE: 1,
    XFADE: 2,
    VUMETER: 3
};

const CC_ENCODER =
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

const CC_FADER =
    [
        28
    ];

const CC_BUTTON =
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

var page_states = [
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 127, 31: 0, 32: 0, 33: 0, 34: 0, 35: 0, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 0, 31: 127, 32: 0, 33: 0, 34: 0, 35: 0, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 127, 33: 0, 34: 0, 35: 0, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 0, 33: 127, 34: 0, 35: 0, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 0, 33: 0, 34: 127, 35: 0, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 0, 33: 0, 34: 0, 35: 127, 36: 0, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 0, 33: 0, 34: 0, 35: 0, 36: 127, 37: 0 },
    { 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 30: 128, 31: 0, 32: 0, 33: 0, 34: 0, 35: 0, 36: 0, 37: 127 },
];

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

    //trackBank = host.createTrackBank(8, 2, 0);
    trackBank = host.createMainTrackBank(8, 0, 0);
    

    println("crossfade: " + transport.crossfade)

    transport.crossfade.addValueObserver(128,  function (value) {
        println("Volume: CROSSFADE : value: " + value);
        page_states[MODE_PAGE.MIXER][28] = value;
    });

    /* TRACK BANK */
    for (var t = 0; t < 8; t++) {
        var track = trackBank.getTrack(t);

        track.addVuMeterObserver(128, -1, true, makeIndexedFunction(t, function (index, value) 
		{
            if (current_page == MODE_PAGE.VUMETER)
              page_states[MODE_PAGE.VUMETER][20 + index] = value;
            }));

        track.getVolume().setIndication(true);
        track.getVolume().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            println("Volume: track: " + index + " value: " + value);
            page_states[MODE_PAGE.MIXER][20 + index] = value;
        })

        );
    }

    /* CURSOR TRACK */
    cursorTrack = host.createCursorTrackSection(2, 0);

    /* CURSOR DEVICE */
    cursorDevice = host.createCursorDeviceSection(8);
    cursorDevice.addSelectedPageObserver(0, function (page) {
          println("SelectedPageObserver page: " + page );
    });

    // TODO: checkout API of
    //           CursorDeviceFollowMode 
    //           CursorRemoteControlsPage
    // steal code from:
    //    nektar/SE49_v2.control.js:

    // deviceChain.scrollTo(index); b = deviceChain.getDevice(index); b === primaryInstrument

    // availableParameterPages

    primaryInstrument = cursorTrack.getPrimaryInstrument();
    for (var p = 0; p < 8; p++) {
        var macro = primaryInstrument.getMacro(p).getAmount();
        macro.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            page_states[MODE_PAGE.DEVICE][20 + index] = value;
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

function clear_encoder_leds() {
    CC_ENCODER
    for (var cc in CC_ENCODER) {
        //pausecomp(200);
        //println("flush() key: " + key + " states[key]: " + states[key]);
        sendChannelController(0, cc, 0);
    }
}
function flush() {
    var index;
    //println("page " + current_page );
    for (var key in page_states[current_page]) {
        //pausecomp(200);
        //println("flush() key: " + key + " states[key]: " + states[key]);
        sendChannelController(0, key, page_states[current_page][key]);
    }
}

function onMidi(status, data1, data2) {
    println("onMidi() status: " + status + " data1: " + data1 + " data2: " + data2);

    if (CC_ENCODER.indexOf(data1) > -1) {
        println("onMidi() CC_ENCODER.data1: " + CC_ENCODER.indexOf(data1));
        println("onMidi() encoder data");
        if (current_page == MODE_PAGE.MIXER)
            trackBank.getTrack(CC_ENCODER.indexOf(data1)).getVolume().set(data2, 128);
        else if (current_page == MODE_PAGE.DEVICE)
            var macro = primaryInstrument.getMacro(CC_ENCODER.indexOf(data1)).getAmount().set(data2, 128);

    }
    else if (CC_FADER.indexOf(data1) > -1) {
        println("onMidi() CC_FADER.data1: " + CC_FADER.indexOf(data1));
        println("onMidi() fader data");
        transport.crossfade.set(data2, 128);
    }
    else if (CC_BUTTON.indexOf(data1) > -1) {
        if (CC_BUTTON.indexOf(data1) != current_page)
            clear_encoder_leds
     
            println("onMidi() CC_BUTTON.data1: " + CC_BUTTON.indexOf(data1));
            println("onMidi() button data");
        if (current_page == MODE_PAGE.MIXER) {
            trackBank.setIndication = true;

            //println("onMidi() button data: scrollTracksUp");
            //trackBank.scrollTracksUp();
            println("onMidi() button data: scrollTracksDown");
            trackBank.scrollTracksDown();
        } else if (current_page == MODE_PAGE.DEVICE) {
            //cursorDevice.switchToPreviousPreset(); 
            cursorDevice.switchToNextPreset();
            println("switchToNextPreset()" + cursorDevice);
        }
        current_page = CC_BUTTON.indexOf(data1);
        for (var key in CC_BUTTON) {
            page_states[current_page][CC_BUTTON[key]] = 0;

        }
        data2 = 127
    }
    page_states[current_page][data1] = data2;
}

function onSysex(data) {
}

