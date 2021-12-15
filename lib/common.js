class Common {
  static random(min = 0, max = 1) {
    const rnd = Math.floor( Math.random() * (max + 1 - min) ) + min
    return rnd
  }

  static randomReal(min = 0, max = 1) {
    const rnd = Math.random() * (max - min) + min
    return rnd
  }

  static around(i, j, ti, tj, r) {
    return ( ti - r < i && i < ti + r ) && ( tj - r < j && j < tj + r )
  }

  static pickup(ary) {
    const i = Math.floor(Math.random() * ary.length);
    return ary[i];
  }

  static time(callback) {
    const startTime = performance.now();
    callback()

    const dt = performance.now() - startTime
    //console.log(`Elapsed time(ms): ${dt}`);
    return dt
  }

}

module.exports = Common
