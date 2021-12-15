const Common = require("./common.js")

class Colormap {
  constructor(name = 'mix') {
    this.samples = {
      //'lavender' : ['#f0f8ff', '#e6e6fa', '#b0c4de', '#4682b4', '#4169e1'],
      'blue'     : ['#add8e6', '#87cefa', '#00bfff', '#6495ed', '#1e90ff'],
      'aqua'     : ['#e0ffff', '#00ffff', '#40e0d0', '#20b2aa', '#008b8b'],
      'green'    : ['#98fb98', '#7fffd4', '#66cdaa', '#2e8b57', '#228b22'],
      'yellow'   : ['#ffffe0', '#f0e68c', '#ffd700', '#ffa500', '#ff8c00'],
      'red'      : ['#ffb6c1', '#ffc0cb', '#ff69b4', '#ff1493', '#c71585'],
      'rose'     : ['#e6cde3', '#e198b4', '#eb6ea5', '#e95295', '#e95464'],
      'purple'   : ['#d8bfd8', '#ee82ee', '#ba55d3', '#8b008b', '#483d8b'],

      'blue2'     : ['#013E97', '#0B68F0', '#0150C4', '#003179', '#002459'],
      'aqua2'     : ['#006F7E', '#00CBE7', '#00899C', '#005764', '#003D45'],
      'green2'    : ['#3E8400', '#5CC200', '#4DA300', '#2D6000', '#183300'],
      'red2'      : ['#D24141', '#B41E1E', '#950707', '#700000', '#460000'],
      'purple2'   : ['#B90074', '#FD009F', '#E1008D', '#95005E', '#700046'],


      'white'    : ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
      'black'    : ['#000000', '#000000', '#000000', '#000000', '#000000'],
    }

    const toBeMixed = ['blue', 'aqua', 'green', 'yellow', 'red', 'rose', 'purple']
    this.samples['mix'] = []
    for (let [k, v] of Object.entries(this.samples)) {
      if ( toBeMixed.includes(k) ) {
        this.samples['mix'] = this.samples['mix'].concat(v)
      }
    }

    const toBeMixed2 = ['blue2', 'aqua2', 'green2', 'red2', 'purple2']
    this.samples['mix2'] = []
    for (let [k, v] of Object.entries(this.samples)) {
      if ( toBeMixed2.includes(k) ) {
        this.samples['mix2'] = this.samples['mix2'].concat(v)
      }
    }




    this.blackRate = 0
    this.injectBlackAll()

    this.set(name)
  }

  injectBlackAll() {
    for ( let [k, v] of Object.entries(this.samples) ) {
      if ( k.match(/-black/) ) continue
      this.injectBlack(k, this.blackRate)
    }
  }

  injectBlack(src, rate) {
    const smpl  = this.samples[src]
    const dst   = `${src}-black`
    const len   = Math.round(smpl.length * rate)
    const black = '#000000' 
    this.samples[dst] = smpl.concat(Array(len).fill(black))
  }

  increaseBlack(dr = 0.1) {
    this.blackRate += dr 
    //this.injectBlackAll()
  }

  decreaseBlack(dr = 0.1) {
    this.blackRate -= dr 
    if ( this.blackRate < 0 ) this.blackRate = 0
    //this.injectBlackAll()
  }
  
  get(name) {
    return this.samples[name]
  }

  set(name) {
    this.current = name
  }

  getBlackRate() {
    return this.blackRate
  }

  setBlackRate(rate) {
    this.blackRate = rate
    //this.injectBlackAll()
    console.log(`blackRate: ${this.blackRate}`)
  }

  choose(name) {
    const smpl = name ? this.samples[name] : this.samples[this.current]

    const max = smpl.length + smpl.length * this.blackRate
    const i   = Math.floor(Math.random() * max);

    const color = i < smpl.length ? smpl[i] : '#000000' 

   return color
   //return Common.pickup(smpl)
  }
}

module.exports = Colormap
