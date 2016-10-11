var Graber = require("../../other/grabers/graber.js");
var cheerio = require('cheerio');
var mongoose = require('../../mongodb/mongoose.js');
var FloorModel = require('../../mongodb/models/FloorModel.js');
var FloorModelModel = require('../../mongodb/models/FloorModelModel.js');

var count = 1;

FloorModel.find({}, null, {limit:100, skip:900}, function(err, docs) {
  for(var i=0;i<docs.length; i++) {
    var baseUrl = docs[i].url;
    var prefix = baseUrl.substr(0, baseUrl.indexOf('.'));

    var modelUrl = "http://xiaoqu.jx.fccs.com" + prefix + "_model.html";

    grabModels(modelUrl, baseUrl, count);
  }
});


var grabModels = function(href, floorUrl, i) {
  Graber.grab(href, function(html) {
    console.log(href);
    var doc = html.toString();
    var $ = cheerio.load(doc, {decodeEntities: false});

    $('.listCol ul li').each(function() {
      var name = $(this).children("p").eq(0).html();
      name = name.substr(name.lastIndexOf('</span') + 8);

      var room=0, hall=0, toilet=0;
      if(name.indexOf("室") > -1 && name.indexOf("厅") > -1 && name.indexOf("卫") > -1) {
        room = name.substring(0, name.indexOf('室'));
        hall = name.substring(name.indexOf('室') + 1, name.indexOf('厅'));
        toilet = name.substring(name.indexOf('厅') + 1, name.indexOf('卫'));
      } else if(name.indexOf("室") > -1 && name.indexOf("厅") > -1) {
        room = name.substring(0, name.indexOf('室'));
        hall = name.substring(name.indexOf('室') + 1, name.indexOf('厅'));
      }

      FloorModelModel.find({room:room, hall:hall, toilet:toilet, floorUrl:floorUrl}, function(err, docs) {
        if(docs.length === 0) {
          var floorModelEntity = new FloorModelModel({
            floorUrl:floorUrl,
            name:name,
            hall:hall,
            room:room,
            toilet:toilet,
            kitchen:0
          });

          floorModelEntity.save(function(err, docs) {
            if(err) console.log(err);
          });
        }
      });
    });

    // 抓取下一页
    var pagesNav = $('.pages').eq(0).children('.fr').eq(0).children('.pnav').eq(0).children('.pages-nav').eq(0);
    var lastA = $(pagesNav).children('a').last();
    if($(lastA).text().indexOf('下一页') > -1) {
      var nextPageUrl = $(lastA).attr('href');
      grabModels('http://xiaoqu.jx.fccs.com/' + nextPageUrl, floorUrl, count);
    } else {
      console.log('抓取完毕(' + (count++) + ')');
    }
  });
};