/* Workdir:
 *   cd /cygdrive/c/Users/gomol/Documents/Bitwig\ Studio/Controller\ Scripts/bgom/
     cd /cygdrive/c/Program\ Files/Bitwig\ Studio/3.2.8/resources/ControllerScripts
 * Docs: 
 *   file:///C:/Program%20Files/Bitwig%20Studio/3.2.8/resources/doc/control-surface/scripting-guide.pdf
 *   file:///C:/Program%20Files/Bitwig%20Studio/3.2.8/resources/doc/control-surface/api/annotated.html
 */
loadAPI(1)

host.defineController("bgom", "Automap army of MIDI Nocturns", "1.0", "DCA77860-FDCC-11EA-8B6E-0800200C9A66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Automap MIDI"], ["Automap MIDI"]);

const NOCTURN_NUM = 4

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
    SOLO: 8,
    MUTE: 9,
    ARM: 10
};

const MODE_SHIFT =
{
    SOLO: 120,
    MUTE: 121,
    ARM: 122,
    RESET: 123,
    UNDEF_1: 124,
    UNDEF_2: 125
};


var active_shift = {}

// init shift array
for (var shift_type in MODE_SHIFT) {
    println("shift_type: " + shift_type)
    active_shift[shift_type] = false
}


function no_active_shift() {
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            return false
        }
    }
    return true
}

function has_active_shift() {
    //println("has_active_shift ? ")
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            //println("has_active_shift yes " + shift_type)
            return true
        }
    }
    return false
}

function get_active_shift() {
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            return MODE_SHIFT[shift_type]
        }
    }
}

function get_active_shifts() {
    result = []
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            result.push(MODE_SHIFT[shift_type])
        }
    }
    return result
}

function get_active_shift_type() {
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            return shift_type
        }
    }
}

function get_active_shift_types() {
    result = []
    for (var shift_type in MODE_SHIFT) {
        if (active_shift[shift_type]) {
            result.push(shift_type)
        }
    }
    return result
}



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

const SEND_NUM = 4
const SCENE_NUM = 50

var nocturns = [
    createState(),
    createState(),
    createState(),
    createState(),
]


function createState() {
    return {
        states: createStateArrays()
    }
}

function createStateArrays() {
    //  println("X : ")
    var res = []
    for (x in MODE_PAGE) {
        res.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }
    return res
}

var current_page = MODE_PAGE.MIXER
var prev_page = false

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
    //println("set_enc_state() mode: " + mode + " index: " + index + " value: " + value)
    //println("set_enc_state() n: " + n + " cc: " + cc)
    nocturns[n]['states'][mode][cc] = value
}

function makeTwoIndexedFunction(index, index2, f) {
    return function (value) {
        f(+index, +index2, value);
    };
}


function dump(obj)
{
   println(obj);
   for(var key in obj)
   {
      println("Dump: " +  key);
   }
}

var trackBank

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);
    host.getMidiInPort(0).setSysexCallback(onSysex);


    cursorDevice = host.createCursorDeviceSection(8);
    cursorTrack = host.createCursorTrackSection(0, 1);
    primaryInstrument = cursorTrack.getPrimaryInstrument();
    // cursorClip = host.createCursorClipSection(16, 16);
    groove = host.createGrooveSection();
    masterTrack = host.createMasterTrackSection(0);
    transport = host.createTransportSection();

    trackBank = host.createMainTrackBank((NOCTURN_NUM * 8), SEND_NUM, SCENE_NUM);

    // page: the index of selected user defined device macro page

    cursorDevice.addSelectedPageObserver(0, function (page) {
        println("SelectedPageObserver: page: " + page)
    });


    scantracks = true;
    //t = 0;
    /* TRACK BANK */
    //while (scantracks) {
        for (var t = 0; t < 32; t++) {
        var track = trackBank.getTrack(t);
        
        println("XTrack is : " + dump(track));
        //if (track.isGroup()) {
        //    println("XTrack is grouptrack: " + t);
        //} //else {

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

            track.getSolo().addValueObserver(makeIndexedFunction(t, function (index, on) {
                println("SOLO")
                set_enc_state(MODE_PAGE.SOLO, index, on ? 127 : 0)
            }));

            track.getMute().addValueObserver(makeIndexedFunction(t, function (index, on) {
                println("MUTE")
                set_enc_state(MODE_PAGE.MUTE, index, on ? 127 : 0)
            }));

            track.getArm().addValueObserver(makeIndexedFunction(t, function (index, on) {
                println("ARM")
                set_enc_state(MODE_PAGE.ARM, index, on ? 127 : 0)
            }));


            sb = track.sendBank()
            println("sendBank: getSizeOfBank: " + sb.getSizeOfBank());
            for (send_index = 0; send_index < sb.getSizeOfBank(); send_index++) {
                send = sb.getItemAt(send_index)
                send.addValueObserver(128, makeTwoIndexedFunction(t, send_index, function (track_num, send_num, value) {
                    //   println("send ValueObserver: t: " + track_num + " s: " + send_num + " val: " + value)

                    set_enc_state(MODE_PAGE['SEND_' + send_num], track_num, value)
                }));

            }

            
       // }
      //  t++
    }

    primaryInstrument = cursorTrack.getPrimaryInstrument();
    for (var p = 0; p < 8; p++) {
        var macro = primaryInstrument.getMacro(p).getAmount();
        macro.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            println("macro.ValueObserver: index: " + index + " value: " + value)
            set_enc_state(MODE_PAGE.DEVICE, index, value)
        }));
        // macro.addIsMappingObserver(getObserverIndexFunc(p, isMapping)); //TODO
    }
    for (var p = 0; p < 8; p++) {
        var parameter = cursorDevice.getParameter(p);
        parameter.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            index = (+index + 8)
            println("parameter.ValueObserver: index: " + index + " value: " + value)
            set_enc_state(MODE_PAGE.DEVICE, index, value)
        }));
    }
    for (var p = 0; p < 8; p++) {
        var common = cursorDevice.getCommonParameter(p);
        common.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            index = (+index + 16)
            println("common.ValueObserver: index: " + index + " value: " + value)
            set_enc_state(MODE_PAGE.DEVICE, index, value)
        }));
    }
    for (var p = 0; p < 8; p++) {
        var env = cursorDevice.getEnvelopeParameter(p);
        env.addValueObserver(128, makeIndexedFunction(p, function (index, value) {
            index = (+index + 24)
            println("env.ValueObserver: index: " + index + " value: " + value)
            set_enc_state(MODE_PAGE.DEVICE, index, value)
        }));
    }

    //   host.scheduleTask(blinkTimer, null, 2000);

}

var blink = false;

function blinkTimer() {
    blink = !blink;
    println("Blink: " + blink)
    host.scheduleTask(blinkTimer, null, 2000);
}

var blink = false;

var isDelayed = false;

function startDelay() {
    if (isDelayed) {
        return false
    }
    host.scheduleTask(delayTimer, null, 500);
    isDelayed = true
    return true
}

function delayTimer() {
    isDelayed = false;
    println("Removing delay! ")
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
    // println("S: " + current_page)


    if (has_active_shift()) {
        // avoid storing shift page as the prev page
        if (current_page < CC_BUTTON.length)
            prev_page = current_page
        println("A: " + current_page)
        current_page = MODE_PAGE[get_active_shift_type()]
        println("A mod: " + current_page)
    } else if (prev_page != false) {
        current_page = prev_page
        println("B: " + prev_page)
        prev_page = false
    }

    for (var i in nocturns) {
        //  println("i: " + i)
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

        for (var shift_type in MODE_SHIFT) {
            if (data1 == MODE_SHIFT[shift_type]) {
                if (data2 != 0) {
                    println("Shift on: " + data1)
                    println("Shift on: shift_type: " + shift_type)

                    active_shift[shift_type] = true
                }
                else {
                    println("Shift off: " + data1)
                    active_shift[shift_type] = false
                }
            }
        }
    }

    if (data1 >= ((n * CC_NUM) + CC_ENCODER[0]) && data1 <= ((n * CC_NUM) + CC_ENCODER[7])) {
        e = data1 - (n * CC_NUM)
        t = (e + (n * CC_ENCODER.length))
        //println("YO I AM ENCODER")
        onEncoder(n, e, t, data1, data2)
    }
    else if (data1 == ((n * CC_NUM) + CC_FADER[0])) {
        println("YO I AM FADER")
        if (data2 > 110) {
            // only allow 1 change per second
            if (startDelay()) {
                // next preset
                println("switching to next preset")
                cursorTrack.getPrimaryInstrument().switchToNextPreset()
            }
        } else if (data2 < 24) {
            // only allow 1 change per second
            if (startDelay()) {
                // prev preset
                println("switching to prev preset")
                cursorTrack.getPrimaryInstrument().switchToPreviousPreset()

            }
        }

    }
    else if (data1 >= ((n * CC_NUM) + CC_BUTTON[0]) && data1 <= ((n * CC_NUM) + CC_BUTTON[7])) {
        b = (data1 - (n * CC_NUM)) - CC_ENCODER.length
        t = (b + (n * CC_BUTTON.length))
        //println("YO I AM BUTTON")
        onButton(n, b, t, data1, data2)
    }

    /*
    else if (has_active_shift) {
        prev_page = current_page
        current_page = MODE_PAGE[get_active_shift()]
    } else if (no_active_shift) {
        current_page = prev_page
    }
    */
}


function onEncoder(nocturn_num, encoder_num, track_num, data1, data2) {
    //println("onEncoder: " + nocturn_num + " " + encoder_num + " " + track_num + " " + data1 + " " + data2)
    if (current_page == MODE_PAGE.MIXER) {
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getVolume().setIndication(true)
            track.getVolume().set(data2, 128)
        }
    } else if (current_page == MODE_PAGE.DEVICE) {
        track = trackBank.getTrack(track_num)
        if (track) {
            //track.getPan().setIndication(true)
            track.getPan().set(data2, 128);
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

    if (current_page == MODE_PAGE.DEVICE) {
        track = trackBank.getTrack(track_num)
        if (nocturn_num == 0) {
            cursorDevice.getMacro(encoder_num).getAmount().set(data2, 128);
        } else if (nocturn_num == 1) {
            cursorDevice.getParameter(encoder_num).getAmount().set(data2, 128);
        } else if (nocturn_num == 2) {
            cursorDevice.getCommonParameter(encoder_num).getAmount().set(data2, 128);
        } else if (nocturn_num == 3) {
            cursorDevice.getEnvelopeParameter(encoder_num).getAmount().set(data2, 128);
        }

    }

}

function onButton(nocturn_num, botton_num, track_num, data1, data2) {
    //println("onButton: " + nocturn_num + " " + botton_num + " " + track_num + " " + data1 + " " + data2)
    if (nocturn_num == 0 && no_active_shift()) {
        if (botton_num == MODE_PAGE.MIXER) {
            current_page = MODE_PAGE.MIXER
            setIndicationMixer()
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.PAN) {
            current_page = MODE_PAGE.PAN
            setIndicationPan()
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.DEVICE) {
            current_page = MODE_PAGE.DEVICE
            inst = cursorTrack.getPrimaryInstrument();
            setIndicationOff()
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.VUMETER) {
            current_page = MODE_PAGE.VUMETER
            setIndicationOff()
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.SEND_0) {
            current_page = MODE_PAGE.SEND_0
            setIndicationSend(0)
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.SEND_1) {
            current_page = MODE_PAGE.SEND_1
            setIndicationSend(1)
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.SEND_2) {
            current_page = MODE_PAGE.SEND_2
            setIndicationSend(2)
            setButton(nocturn_num, botton_num, 127)
        } else if (botton_num == MODE_PAGE.SEND_3) {
            current_page = MODE_PAGE.SEND_3
            setIndicationSend(3)
            setButton(nocturn_num, botton_num, 127)
        }
    }

    if (active_shift['SOLO']) {
        println("Solo....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getSolo().toggle();
        }
        //setIndicationSolo(3)
        // setButton(nocturn_num, botton_num, 127)
    } else if (active_shift['MUTE']) {
        println("Mute....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getMute().toggle();
        }
        //setIndicationMute(3)
        //setButton(nocturn_num, botton_num, 127)
    } else if (active_shift['ARM']) {
        println("Arm....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getArm().toggle();
        }
        //setIndicationMute(3)
        //setButton(nocturn_num, botton_num, 127)
    } else if (active_shift['RESET']) {
        println("Reset....")
        track = trackBank.getTrack(track_num)
        if (track) {
            track.getVolume().set(794, 1000)
            track.getPan().set(64, 128);
        }
        //setIndicationMute(3)
        //setButton(nocturn_num, botton_num, 127)
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

