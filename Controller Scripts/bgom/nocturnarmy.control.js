/*
 * cd /cygdrive/c/Users/gomol/Documents/Bitwig\ Studio/Controller\ Scripts/bgom/
 */
loadAPI(1);

host.defineController("bgom", "Automap army of MIDI Nocturns", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Automap MIDI"], ["Automap MIDI"]);

const MODE_PAGE =
{
    MIXER: 0,
    PAN: 1,
    SEND: 2,
    VUMETER: 3,
    XFADE: 4,
    DEVICE: 5,
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

var numSendPages = 2;

/*
var nocturns = [
    createState(),
    createState(),
    createState()
]
*/
function createState() {
    return {
        states: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    }
}


var nocturns = [
    {
        states: [
            [0, 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    },
    {
        states: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    },
    {
        states: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
    }
]

var current_page = MODE_PAGE.MIXER


function getCC(nocturn_num, cc) {
    return (nocturn_num * CC_NUM) + cc
}
function get_noc_num(index){
    return Math.floor(index / CC_ENCODER.length)
}

function get_noc_cc(noc_num, index){
    return index - (CC_ENCODER.length * n)
}

function get_enc_state(mode, index) {
    n = get_noc_num(index)
    cc = get_noc_cc(n, index)
    return nocturns[n]['states'][mode][cc]
}

function set_enc_state(mode, index, value) {
    n = get_noc_num(index)
    cc = get_noc_cc(n, index)
    println("set_enc_state() mode: " + mode + " index: " + index + " value: " + value)
    println("set_enc_state() n: " + n + " cc: " + cc)
    nocturns[n]['states'][mode][cc] = value
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    host.getMidiInPort(0).setSysexCallback(onSysex);

    //trackBank = host.createTrackBank(8, 2, 0);
    trackBank = host.createMainTrackBank(32, numSendPages, 99);

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);

        track.addVuMeterObserver(128, -1, true, makeIndexedFunction(t, function (index, value) 
		{
            if (current_page == MODE_PAGE.VUMETER) {
                var n = Math.floor(index / CC_ENCODER.length)
                cc = index - (CC_ENCODER.length * n)
                nocturns[n]['states'][MODE_PAGE.VUMETER][cc] = value
            }
            }));


        track.getVolume().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            println("Volume: track: " + index + " value: " + value);
            set_enc_state(MODE_PAGE.MIXER, index, value)
        }));

        track.getPan().addValueObserver(128, makeIndexedFunction(t, function(index, value)
		{
            set_enc_state(MODE_PAGE.PAN, index, value )
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
    for (var i in nocturns) {
       // println ("i: " + i)
       // println ("state: " + nocturns[i]['states'][current_page] )
        for (var state in nocturns[i]['states'][current_page]) {
            val = nocturns[i]['states'][current_page][state]
            cc = +state + (+i * CC_NUM)
            //if (val > 0) {
            //   println("cc: " + cc + " val: " + val)
                sendChannelController(0, cc, val);
            //}
        }

    }
}

function onMidi(status, data1, data2) {
    println("onMidi() status: " + status + " data1: " + data1 + " data2: " + data2);
    // which nocturn number is the source
    n = Math.floor(data1 / CC_NUM)
    println("nocturn num: " + n);

        if (data1 >= ((n * CC_NUM) + CC_ENCODER[0]) && data1 <= ((n * CC_NUM) + CC_ENCODER[7])) {
                e = data1 - (n * CC_NUM) 
                t = ( e + (n * CC_ENCODER.length) ) 
                //println("YO I AM ENCODER")
                onEncoder(n, e, t, data1, data2)
        }
        else if (data1 == ((n * CC_NUM) + CC_FADER[0]) ) { 
            println("YO I AM FADER")
        }
        else if (data1 >= ((n * CC_NUM) + CC_BUTTON[0]) && data1 <= ((n * CC_NUM) + CC_BUTTON[7])) {
            b = ( data1 -  ( n * CC_NUM  ) ) - CC_ENCODER.length
            t = ( b + (n * CC_BUTTON.length) ) 
            //println("YO I AM BUTTON")
            onButton(n,b,t,data1,data2)
        }
}


function onEncoder(nocturn_num, encoder_num, track_num, data1, data2){
    //println("onEncoder: " + nocturn_num + " " + encoder_num + " " + track_num + " " + data1 + " " + data2)
    if (current_page == MODE_PAGE.MIXER) {
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getVolume().set(data2, 128);
        }
     }
}

function onButton(nocturn_num, botton_num, track_num, data1, data2){
    //println("onButton: " + nocturn_num + " " + botton_num + " " + track_num + " " + data1 + " " + data2)
    if (nocturn_num == 0 ) {
        if (botton_num == MODE_PAGE.MIXER){
            current_page = MODE_PAGE.MIXER
            setButton(nocturn_num,botton_num,127)
        } else if (botton_num == MODE_PAGE.VUMETER){
            current_page = MODE_PAGE.VUMETER
            setButton(nocturn_num,botton_num,127)
        }
    }
}

function setButton(nocturn_num, botton_num, val){
    println("setButton: " + nocturn_num + " " + botton_num + " val: " + val)
    //println("setButton: " + CC_BUTTON.length)
    for ( var i = 0; i < CC_BUTTON.length; i++) {
       // println("cc: " + i + " cur: " + nocturns[nocturn_num]['states'][current_page][CC_BUTTON[i]])
       nocturns[nocturn_num]['states'][current_page][CC_BUTTON[i]] = 0
    }
    nocturns[nocturn_num]['states'][current_page][CC_BUTTON[botton_num]] = 127
}

function onSysex(data) {
}

 