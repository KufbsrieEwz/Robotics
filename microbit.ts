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

let players: Player[] = []

let buttons = {
    a: input.buttonIsPressed(Button.A),
    b: input.buttonIsPressed(Button.B),
    l: false,
    r: false,
    u: false
}

let bullets: Bullet[] = []
let explosions: Explosion[] = []

function clear() {
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            led.unplot(x, y)
        }
    }
}

function run() {
    console.log(explosions.length)
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
                bullets.splice(bullets.indexOf(i), 1)
            }
        }
        if ([0, 1, 2, 3, 4].indexOf(i.pos.x) == -1 || [0, 1, 2, 3, 4].indexOf(i.pos.y) == -1) {
            bullets.splice(bullets.indexOf(i), 1)
        }
        i.draw()
    }
    for (let i of explosions) {
        if (i.time < 3) {
            i.time++
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
    if (player.type == 0) {
        for (let i of players) {
            if (i.pos == player.pos) {
                i.health--
            }
        }
    }
    if (buttons.a) {
        player.pos.y--
        player.dir = 'up'
    }
    if (buttons.b) {
        player.pos.y++
        player.dir = 'down'
    }
    if (buttons.l) {
        player.pos.x--
        player.dir = 'left'
        buttons.l = false
    }
    if (buttons.r) {
        player.pos.x++
        player.dir = 'right'
        buttons.r = false
    }
    if (buttons.u) {
        switch (player.type) {
            case 0:
                // fighter
                // dash?
                break
            case 1:
                // gunner
                // shoot bullet in last moved direction
                new Bullet(new Vector2(player.pos.x, player.pos.y), player.dir, 1, player.id)
                break
            case 2:
                // mage
                // aoe attack (3x3)
                new Explosion(new Vector2(player.pos.x, player.pos.y), 0, player.id)
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

input.onGesture(Gesture.Shake, function() {
    buttons.u = true
})
