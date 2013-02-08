var cronJob = require('cron').CronJob;
var Simulator = require('./simulator.js'),
	sim = new Simulator();
	sim.start();

var job = new cronJob('*/5 1-59 * * * *', function(){
    // Runs every weekday (Monday through Friday)
    // at 11:30:00 AM. It does not run on Saturday
    // or Sunday.
    sim.simulate();
  }, function () {
    // This function is executed when the job stops
    sim.end();
  }, 
  true /* Start the job right now */
);
job.start();