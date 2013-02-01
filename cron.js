var cronJob = require('cron').CronJob;

var random = function() {

}


var job = new cronJob('*/5 1-59 * * * *', function(){
    // Runs every 5 seconds for now
    console.log("a");
  }, function () {
    // This function is executed when the job stops
  }, 
  true /* Start the job right now */
);
job.start();