var mongoose = require('./mongoose.js');
var graber = require('./graber.js');
var WeatherModel = require('./WeatherModel.js');
var cheerio = require('cheerio');

module.exports.saveWeather = function () {
    graber.grab("http://tianqi.moji.com/weather/china/zhejiang/jiaxing", function (html) {
        var $ = cheerio.load(html);
        var tem = $('.wea_weather').children('em').text().trim();
        var hum = $('.wea_about').children('span').text().trim();
        hum = hum.replace('湿度', '');
        hum = hum.replace('%', '');
        var WeatherEntity = new WeatherModel({
            temperature: tem,
            humidity: hum
        });

        WeatherEntity.save(function (err) {
            if (err) {
                console.log('save err:' + err);
            } else {
                console.log('成功');
                graber.grab("http://tianqi.moji.com/aqi/china/zhejiang/jiaxing", function (html) {
                    var $ = cheerio.load(html);
                    var air = $('#aqi_value').text().trim();
                    var hum = $('.clearfix').children('li');
                    var pm = hum.eq(1).children('span').text().trim();
                    var conditions = {air: ''};
                    var update = {$set: {air: air, pm: pm}};
                    WeatherModel.update(conditions, update, function (error) {
                        if (error) {
                            console.log(error);
                        }
                    });
                });
            }
        });
    });
}

