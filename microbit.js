let player = {
    pos: {
        x: 0,
        y: 0
    },
    health: 0,
    time: 0,
    type: NaN,
    draw: () => {
        led.plot(player.pos.x, player.pos.y)
    }
}

let buttons = {
    a: input.buttonIsPressed(Button.A),
    b: input.buttonIsPressed(Button.B),
    l: false,
    r: false,
    u: false
}

function clear() {
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            led.unplot(x, y)
        }
    }
}

function run() {
    buttons.a = input.buttonIsPressed(Button.A)
    buttons.b = input.buttonIsPressed(Button.B)
    if (buttons.a) {
        player.pos.y--
    }
    if (buttons.b) {
        player.pos.y++
    }
    if (buttons.l) {
        player.pos.x--
        buttons.l = false
    }
    if (buttons.r) {
        player.pos.x++
        buttons.r = false
    }
    if (buttons.u) {
        switch(player.type) {
            case 0:
                // fighter
                break
            case 1:
                // gunner
                break
            case 2:
                // mage
                break
        }
        buttons.u = false
    }
    clear()
    player.draw()
}

function start() {
    loops.everyInterval(100, run)
}

input.onGesture(Gesture.TiltLeft, function () {
    buttons.l = true
})

input.onGesture(Gesture.TiltRight, function () {
    buttons.r = true
})
input.onGesture(Gesture.Shake, function() {
    buttons.u = true
})
