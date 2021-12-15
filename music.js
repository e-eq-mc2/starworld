const Command = require('./lib/command.js')

class Music extends Command {
  set(song) {
    super.set('afplay', [song, '-d'])
  }

  spawn(callback) {
    super.spawn((chunk) => {
      const stdout = chunk.toString()
      callback(stdout)
    })
  }

  run(song, callback) {
    this.set(song)
    super.run(callback)
  }
}

module.exports = Music
