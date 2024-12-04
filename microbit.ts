radio.setGroup(0)

/*
function decodeRadioValues(message: String) {
    let decoded: {[key: string]: any} = {}
    let values: any[] = message.split(';')
    for (let i = 0; i < values.length; i++) {
        values[i] = values[i].split('=')
        if (values[i][0][0] == ' ') {
            values[i][0] = values[i][0].split(' ')[1]
        }
        decoded[values[i][0]] = JSON.parse(values[i][1])
    }
    return decoded
}
*/

function getById(array: any[], id: number) {
    for (let i of array) {
        if (i.id == id || i.parent == id) return array.indexOf(i)
    }
    return -1
}

function decodeRadio(message: String) {
    let split: String[] = message.split(' ')
    switch (split[0]) {
        case 'new':
            switch (split[1]) {
                case 'Player':
                    players.push(new Player(new Vector2(+split[2].split(',')[0], +split[2].split(',')[1]), split[2].split(',')[2], +split[2].split(',')[3], +split[2].split(',')[4], +split[2].split(',')[5], +split[2].split(',')[6]))
                    break
                case 'AfterImage':
                    new AfterImage(new Vector2(+split[2].split(',')[0], +split[2].split(',')[1]), +split[2].split(',')[2], +split[2].split(',')[3])
                    break
                case 'Bullet':
                    new Bullet(new Vector2(+split[2].split(',')[0], +split[2].split(',')[1]), split[2].split(',')[3], +split[2].split(',')[4], +split[2].split(',')[5])
                    break
                case 'Explosion':
                    new AfterImage(new Vector2(+split[2].split(',')[0], +split[2].split(',')[1]), +split[2].split(',')[2], +split[2].split(',')[3])
                    break
            }
            break
        case 'edit':
            switch (split[1]) {
                case 'players':
                    players[getById(players, +split[2])] = new Player(new Vector2(+split[3].split(',')[0], +split[3].split(',')[1]), split[3].split(',')[2], +split[3].split(',')[4], +split[3].split(',')[5], +split[3].split(',')[6], +split[3].split(',')[7])
                    break
            }
            break
        default:
            break
    }
}

radio.onReceivedString(decodeRadio)

/*
radio message format:
(1)

new = make new object
||
edit = change object that exists

(2)

class

(3)

(parameters)
||
`id: ${id}`

(4)


||
(parameters)
*/

// example: 'new Player 0,0,up,5,0,2,1' creates a new player at 0, 0, (top left), facing up, with 5 health, 0 deciseconds of being alive, the mage class, and with an id of 1

class Vector2 {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

class Bullet {
    pos: Vector2
    dir: String
    vel: number
    parent: number
    constructor(pos: Vector2, dir: String, vel: number, parent: number) {
        this.pos = pos
        this.dir = dir
        this.vel = vel
        this.parent = parent
        bullets.push(this)
    }
    draw() {
        led.plot(this.pos.x, this.pos.y)
    }
}

class Explosion {
    pos: Vector2
    time: number
    parent: number
    constructor(pos: Vector2, time: number, parent: number) {
        this.pos = pos
        this.time = time
        this.parent = parent
        explosions.push(this)
    }
    draw() {
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                led.plot(this.pos.x + x, this.pos.y + y)
            }
        }
    }
}

class AfterImage {
    pos: Vector2
    time: number
    parent: number
    constructor(pos: Vector2, time: number, parent: number) {
        this.pos = pos
        this.time = time
        this.parent = parent
        afterImages.push(this)
    }
    draw() {
        led.plot(this.pos.x, this.pos.y)
    }
}

class Player {
    pos: Vector2
    dir: String
    health: number
    time: number
    type: number
    id: number
    constructor(pos: Vector2, dir: String, health: number, time: number, type: number, id: number) {
        this.pos = pos
        this.dir = dir
        this.health = health
        this.time = time
        this.type = type
        this.id = id
    }
    draw() {
        led.plot(this.pos.x, this.pos.y)
    }
}

let player = new Player(new Vector2(0, 0), 'up', 5, 0, 2, Math.random())

let players: Player[] = [player]

let buttons = {
    a: input.buttonIsPressed(Button.A),
    b: input.buttonIsPressed(Button.B),
    l: false,
    r: false,
    u: false
}

let bullets: Bullet[] = []
let explosions: Explosion[] = []
let afterImages: AfterImage[] = []

function clear() {
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            led.unplot(x, y)
        }
    }
}

function run() {
    clear()
    buttons.a = input.buttonIsPressed(Button.A)
    buttons.b = input.buttonIsPressed(Button.B)
    for (let i of bullets) {
        switch (i.dir) {
            case 'up':
                i.pos.y -= i.vel
                break
            case 'down':
                i.pos.y += i.vel
                break
            case 'left':
                i.pos.x -= i.vel
                break
            case 'right':
                i.pos.x += i.vel
                break
            default:
                break
        }
        for (let j of players) {
            if (i.pos == j.pos && i.parent != j.id) {
                j.health--
            }
        }
        if ([0, 1, 2, 3, 4].indexOf(i.pos.x) == -1 || [0, 1, 2, 3, 4].indexOf(i.pos.y) == -1) {
            bullets.splice(bullets.indexOf(i), 1)
        }
        i.draw()
    }
    for (let i of explosions) {
        if (i.time > 0) {
            i.time--
        } else {
            explosions.splice(explosions.indexOf(i), 1)
        }
        for (let j of players) {
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    if (new Vector2(i.pos.x + x, i.pos.y + y) == j.pos && i.parent != j.id) {
                        j.health--
                    }
                }
            }
        }
        i.draw()
    }
    for (let i of afterImages) {
        if (i.time > 0) {
            i.time--
        } else {
            afterImages.splice(afterImages.indexOf(i), 1)
        }
        for (let j of players) {
            if (i.pos == j.pos) {
                j.health--
            }
        }
        i.draw()
    }
    if (player.type == 0) {
        for (let i of players) {
            if (i.pos == player.pos) {
                i.health--
                radio.sendString(`edit players ${i.id} ${i.pos.x},${i.pos.y},${i.dir},${i.health},${i.time},${i.type},${i.id}`)
                // example: 'edit players id x,y,dir,health,time,type,id'
            }
        }
    }
    if (buttons.a) {
        player.pos.y--
        player.dir = 'up'
        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
    }
    if (buttons.b) {
        player.pos.y++
        player.dir = 'down'
        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
    }
    if (buttons.l) {
        player.pos.x--
        player.dir = 'left'
        buttons.l = false
        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
    }
    if (buttons.r) {
        player.pos.x++
        player.dir = 'right'
        buttons.r = false
        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
    }
    if (buttons.u) {
        switch (player.type) {
            case 0:
                // fighter
                // dash
                switch (player.dir) {
                    case 'up':
                        player.pos.y -= 3
                        new AfterImage(new Vector2(player.pos.x, player.pos.y + 1), 3, player.id)
                        new AfterImage(new Vector2(player.pos.x, player.pos.y + 2), 2, player.id)
                        new AfterImage(new Vector2(player.pos.x, player.pos.y + 3), 1, player.id)
                        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
                        break
                    case 'down':
                        player.pos.y += 3
                        new AfterImage(new Vector2(player.pos.x, player.pos.y - 1), 3, player.id)
                        new AfterImage(new Vector2(player.pos.x, player.pos.y - 2), 2, player.id)
                        new AfterImage(new Vector2(player.pos.x, player.pos.y - 3), 1, player.id)
                        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
                        break
                    case 'left':
                        player.pos.x -= 3
                        new AfterImage(new Vector2(player.pos.x + 1, player.pos.y), 3, player.id)
                        new AfterImage(new Vector2(player.pos.x + 2, player.pos.y), 2, player.id)
                        new AfterImage(new Vector2(player.pos.x + 3, player.pos.y), 1, player.id)
                        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
                        break
                    case 'right':
                        player.pos.x += 3
                        new AfterImage(new Vector2(player.pos.x - 1, player.pos.y), 3, player.id)
                        new AfterImage(new Vector2(player.pos.x - 2, player.pos.y), 2, player.id)
                        new AfterImage(new Vector2(player.pos.x - 3, player.pos.y), 1, player.id)
                        radio.sendString(`edit players ${player.id} ${player.pos.x},${player.pos.y},${player.dir},${player.health},${player.time},${player.type},${player.id}`)
                        break
                }
                break
            case 1:
                // gunner
                // shoot bullet
                new Bullet(new Vector2(player.pos.x, player.pos.y), player.dir, 1, player.id)
                radio.sendString(`new Bullet ${player.pos.x},${player.pos.y},${player.dir},1,${player.id}`)
                break
            case 2:
                // mage
                // aoe attack (3x3)
                new Explosion(new Vector2(player.pos.x, player.pos.y), 3, player.id)
                radio.sendString(`new Explosion ${player.pos.x},${player.pos.y},3,${player.id}`)
                break
        }
        buttons.u = false
    }
    player.draw()
}

function start() {
    loops.everyInterval(100, run)
}

start()

input.onGesture(Gesture.TiltLeft, function () {
    buttons.l = true
})

input.onGesture(Gesture.TiltRight, function () {
    buttons.r = true
})

input.onGesture(Gesture.Shake, function () {
    buttons.u = true
})
