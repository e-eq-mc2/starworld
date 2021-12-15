const { spawn } = require('child_process')

class Command {

  constructor(cmd, opt) { 
    this.set(cmd, opt)
  }

  set(cmd, opt) {
    this.command = cmd 
    this.option  = opt
  }

  opt2str(opt) {
    let str = ""

    this.option.forEach(e => str += `${e} `);

    return str
  }

  str() {
    const str = this.command + " " + this.opt2str(this.option)
    return str
  }

  log(str) {
    console.log(str)
  }

  spawn(callback) {
    this.childProcess = spawn(this.command, this.option)

    this.log('========================')
    this.log('command:' + this.str() )
    this.log('process id:' + process.pid)
    this.log('child process id:' + this.childProcess.pid)
    this.log('========================')

    let res = ""
    this.childProcess.stdout.on('data', callback)
  }

  run(callback) {
    this.spawn(callback)
  }

  kill(signal = 'SIGTERM') {
    if ( typeof(this.childProcess) == 'undefined' ) return 
    this.log('========================')
    this.log('Kill process id:' + this.childProcess.pid)
    this.log('========================')
    this.childProcess.kill(signal)
  }

}

module.exports = Command
