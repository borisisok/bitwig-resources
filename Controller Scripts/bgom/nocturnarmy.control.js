/* Workdir:
 * cd /cygdrive/c/Users/gomol/Documents/Bitwig\ Studio/Controller\ Scripts/bgom/
 * Docs: 
 * file:///C:/Program%20Files/Bitwig%20Studio/3.2.8/resources/doc/control-surface/scripting-guide.pdf
 * file:///C:/Program%20Files/Bitwig%20Studio/3.2.8/resources/doc/control-surface/api/annotated.html
 */
loadAPI(1);

host.defineController("bgom", "Automap army of MIDI Nocturns", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Automap MIDI"], ["Automap MIDI"]);

const MODE_PAGE =
{
    MIXER: 0,
    PAN: 1,
    DEVICE: 2,
    VUMETER: 3,
    SEND_0: 4,
    SEND_1: 5,
    SEND_2: 6,
    SEND_3: 7,
};

const MODE_SHIFT =
{
    MAIN: 120,
    SOLO: 121,
    MUTE: 122,
    REC: 123,
    UNDEF_0: 124,
    UNDEF_1: 125
};

var current_shift = {}


current_shift[MODE_SHIFT.MAIN] = false
current_shift[MODE_SHIFT.SOLO] = false
current_shift[MODE_SHIFT.MUTE] = false
current_shift[MODE_SHIFT.REC] = false



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

const CC_SHIFT_BUTTON =
    [
        120,
        121,
        122,
        123,
        124,
        125
    ];

const SHIFT_CHAN = 7


const CC_MIN = 0
const CC_MAX = 16
const CC_NUM = 17


var nocturns = [
    createState(),
    createState(),
    createState(),
    createState(),
]


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


var current_page = MODE_PAGE.MIXER


function getCC(nocturn_num, cc) {
    return (nocturn_num * CC_NUM) + cc
}

function get_noc_num(index) {
    return Math.floor(index / CC_ENCODER.length)
}

function get_noc_cc(noc_num, index) {
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

function makeTwoIndexedFunction(index, index2, f) {
    return function (value) {
        f(+index, +index2, value);
    };
}
var trackBank

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    host.getMidiInPort(0).setSysexCallback(onSysex);

    //trackBank = host.createTrackBank(8, 2, 0);
    trackBank = host.createMainTrackBank(32, 4, 99);


    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);

        track.addVuMeterObserver(128, -1, true, makeIndexedFunction(t, function (index, value) {
            set_enc_state(MODE_PAGE.VUMETER, index, value)
        }));

        track.getVolume().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            println("Volume: track: " + index + " value: " + value);
            set_enc_state(MODE_PAGE.MIXER, index, value)
        }));

        track.getPan().addValueObserver(128, makeIndexedFunction(t, function (index, value) {
            set_enc_state(MODE_PAGE.PAN, index, value)
        }));

        sb = track.sendBank()
        println("sendBank: getSizeOfBank: " + sb.getSizeOfBank());
        for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
            send = sb.getItemAt(send_index)
            send.addValueObserver(128, makeTwoIndexedFunction(t, send_index, function (track_num, send_num, value) {
                println("send ValueObserver: t: " + track_num + " s: " + send_num + " val: " + value)

                set_enc_state(MODE_PAGE['SEND_' + send_num], track_num, value)
            }));

        }
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

    if ((data1 >= CC_SHIFT_BUTTON[0]) && (data1 <= CC_SHIFT_BUTTON[5])) {
        // shift button detection
        println("YO night shift")
        if (data2 != 0) { 
            println("Shift on: " + data1)
            current_shift[data1] = true }
        else { 
            println("Shift off: " + data1)
            current_shift[data1] = false }
    } 

    if (data1 >= ((n * CC_NUM) + CC_ENCODER[0]) && data1 <= ((n * CC_NUM) + CC_ENCODER[7])) {
        e = data1 - (n * CC_NUM)
        t = (e + (n * CC_ENCODER.length))
        //println("YO I AM ENCODER")
        onEncoder(n, e, t, data1, data2)
    }
    else if (data1 == ((n * CC_NUM) + CC_FADER[0])) {
        println("YO I AM FADER")
    }
    else if (data1 >= ((n * CC_NUM) + CC_BUTTON[0]) && data1 <= ((n * CC_NUM) + CC_BUTTON[7])) {
        b = (data1 - (n * CC_NUM)) - CC_ENCODER.length
        t = (b + (n * CC_BUTTON.length))
        //println("YO I AM BUTTON")
        onButton(n, b, t, data1, data2)
    }
}


function onEncoder(nocturn_num, encoder_num, track_num, data1, data2) {
    //println("onEncoder: " + nocturn_num + " " + encoder_num + " " + track_num + " " + data1 + " " + data2)
    if (current_page == MODE_PAGE.MIXER) {
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getVolume().setIndication(true)
            track.getVolume().set(data2, 128)
        }
    } else if (current_page == MODE_PAGE.PAN) {
        track = trackBank.getTrack(track_num)
        if (track) {
            //track.getPan().setIndication(true)
            track.getPan().set(data2, 128);
        }
    } else if (current_page == MODE_PAGE.SEND_0) {
        track = trackBank.getTrack(track_num)
        if (track) {
            sb = track.sendBank()
            sb.getItemAt(0).set(data2, 128);
        }
    } else if (current_page == MODE_PAGE.SEND_1) {
        track = trackBank.getTrack(track_num)
        if (track) {
            sb = track.sendBank()
            sb.getItemAt(1).set(data2, 128);
        }
    } else if (current_page == MODE_PAGE.SEND_2) {
        track = trackBank.getTrack(track_num)
        if (track) {
            sb = track.sendBank()
            sb.getItemAt(2).set(data2, 128);
        }
    } else if (current_page == MODE_PAGE.SEND_3) {
        track = trackBank.getTrack(track_num)
        if (track) {
            sb = track.sendBank()
            sb.getItemAt(3).set(data2, 128);
        }
    }

}

function onButton(nocturn_num, botton_num, track_num, data1, data2) {
    //println("onButton: " + nocturn_num + " " + botton_num + " " + track_num + " " + data1 + " " + data2)
    if (nocturn_num == 0) {
        if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.MIXER) {
            current_page = MODE_PAGE.MIXER
            setIndicationMixer()
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.PAN) {
            current_page = MODE_PAGE.PAN
            setIndicationPan()
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.VUMETER) {
            current_page = MODE_PAGE.VUMETER
            setIndicationOff()
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.SEND_0) {
            current_page = MODE_PAGE.SEND_0
            setIndicationSend(0)
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.SEND_1) {
            current_page = MODE_PAGE.SEND_1
            setIndicationSend(1)
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.SEND_2) {
            current_page = MODE_PAGE.SEND_2
            setIndicationSend(2)
            setButton(nocturn_num, botton_num, 127)
        } else if (current_shift[MODE_SHIFT.MAIN] && botton_num == MODE_PAGE.SEND_3) {
            current_page = MODE_PAGE.SEND_3
            setIndicationSend(3)
            setButton(nocturn_num, botton_num, 127)
        }
    }

    if (current_shift[MODE_SHIFT.SOLO] ) {
        println("Solo....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getSolo().toggle();
        }
        //setIndicationSolo(3)
        setButton(nocturn_num, botton_num, 127)
    } else if (current_shift[MODE_SHIFT.MUTE] ) {
        println("Mute....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getMute().toggle();
        }
        //setIndicationMute(3)
        setButton(nocturn_num, botton_num, 127)
    }

}

function setButton(nocturn_num, botton_num, val) {
    println("setButton: " + nocturn_num + " " + botton_num + " val: " + val)
    //println("setButton: " + CC_BUTTON.length)
    for (var i = 0; i < CC_BUTTON.length; i++) {
        // println("cc: " + i + " cur: " + nocturns[nocturn_num]['states'][current_page][CC_BUTTON[i]])
        nocturns[nocturn_num]['states'][current_page][CC_BUTTON[i]] = 0
    }
    nocturns[nocturn_num]['states'][current_page][CC_BUTTON[botton_num]] = 127
}

function setIndicationOff() {

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);
        track.getVolume().setIndication(false)
        track.getPan().setIndication(false)
        sb = track.sendBank()
        for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
            send = sb.getItemAt(send_index)
            send.setIndication(false)
        }
    }
}

function setIndicationMixer() {

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);
        track.getVolume().setIndication(true)
        track.getPan().setIndication(false)
        sb = track.sendBank()
        for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
            send = sb.getItemAt(send_index)
            send.setIndication(false)
        }
    }

}

function setIndicationPan() {

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);
        track.getVolume().setIndication(false)
        track.getPan().setIndication(true)
        sb = track.sendBank()
        for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
            send = sb.getItemAt(send_index)
            send.setIndication(false)
        }
    }

}


function setIndicationSend(send_num) {

    /* TRACK BANK */
    for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);
        track.getVolume().setIndication(false)
        track.getPan().setIndication(false)
        sb = track.sendBank()
        for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
            send = sb.getItemAt(send_index)
            if (send_index == send_num) {
                send.setIndication(true)
            } else {
                send.setIndication(false)
            }
        }
    }

}


function onSysex(data) {
}

