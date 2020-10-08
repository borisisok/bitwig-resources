
loadAPI(1);

host.defineController("bgom", "Automap army of MIDI Nocturns", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
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
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7
    ];

const CC_BUTTON =
    [
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
    ];

const CC_FADER =
    [
        16
    ];

const CC_MIN = 0
const CC_MAX = 16
const CC_NUM = 17


var nocturns = [
    createState(),
    createState(),
    createState()
]

function createState() {
    return {
        current_page : MODE_PAGE.MIXER,
        states: [
            [0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 0],
        ]
    }
}

function getCC(nocturn_num, cc) {
    return (nocturn_num * CC_NUM) + cc
}


var current_page = MODE_PAGE.MIXER

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    host.getMidiInPort(0).setSysexCallback(onSysex);

    //trackBank = host.createTrackBank(8, 2, 0);
    trackBank = host.createMainTrackBank(32, 0, 0);

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);

        track.getVolume().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            println("Volume: track: " + index + " value: " + value);

            n = Math.floor(index / CC_ENCODER.length)
            cc = index - (CC_ENCODER.length * n)
            println("nocturn num: " + n);
            println("nocturn cc: " + cc);

            nocturns[n]['states'][MODE_PAGE.MIXER][cc] = value
            //page_states[MODE_PAGE.MIXER][20 + index] = value;
        })

        );
    }


    println(nocturns[0]['states'])

    //    dump( nocturn[0]['states'] )

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
    for (var i in nocturns) {
        println("flush() ---------------------------------" );

        println("flush() item: " + i);
        println("flush() item cs: " + nocturns[i]['current_page']);
        
        for (var state in nocturns[i]['states'][nocturns[i]['current_page']]) {
            println("flush() stat: " + state);
            println("flush() val: " + nocturns[i]['states'][nocturns[i]['current_page']][state]);
            val = nocturns[i]['states'][nocturns[i]['current_page']][state]
            cc =  +state + ( +i * CC_NUM ) 
            println("flush() cc: " + cc);
            sendChannelController(0, cc, val);
        }

    }
}

function onMidi(status, data1, data2) {
    println("onMidi() status: " + status + " data1: " + data1 + " data2: " + data2);
}

function onSysex(data) {
}
