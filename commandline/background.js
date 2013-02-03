var cronJob = require('cron').CronJob;
var job = new cronJob('*/5 1-59 * * * *', function(){
    // Runs every weekday (Monday through Friday)
    // at 11:30:00 AM. It does not run on Saturday
    // or Sunday.
    console.log("a");
  }, function () {
    // This function is executed when the job stops
  }, 
  true /* Start the job right now */
);
job.start();