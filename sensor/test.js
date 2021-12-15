const sensor = require('./build/Release/sensor');

sensor.start(1.0, 4.0, function () {
  console.log("Done!!")
}, function(data) {
  const sample = JSON.parse(data)
  console.log(sample)
}); 


min_d = 0.0
max_d = 2.0

const aFunc = function( ){

  while (false) {
    sensor.set_distance_range(min_d, max_d);
    console.log(`@node  min_distance: ${sensor.get_min_distance()}`)
    console.log(`@node  max_distance: ${sensor.get_max_distance()}`)

    min_d += 0.001
    max_d += 0.001

    d = 0
    for(let i =0; i<10000000000; ++i) {
      d += Math.cos(i)
    }

  }
}

aFunc()

