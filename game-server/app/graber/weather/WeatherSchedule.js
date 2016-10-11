var schedule = require('node-schedule');
var WeatherGraber = require('./WeatherGraber');

var rule = new schedule.RecurrenceRule();
var times = [];
//每隔一分钟
for (var i = 1; i < 60; i = i + 1) {
    if ((parseInt(i) / 10) == 0) {
        times.push(i);
    }
}
rule.minute = times;

var j = schedule.scheduleJob(rule, function () {
    WeatherGraber.saveWeather();
});