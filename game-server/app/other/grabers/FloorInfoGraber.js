"use strict";
var Graber = require("../../other/grabers/graber.js");
var cheerio = require('cheerio');
var mongoose = require('../../mongodb/mongoose.js');
var FloorModel = require('../../mongodb/models/FloorModel.js');

var grabFloors = function(prefix, suffix) {
    var url = prefix + suffix;
    console.log("grabbing...." + url);
    Graber.grab(url, function(html) {
        var doc = html.toString();
        var $ = cheerio.load(doc, {decodeEntities: false});

        $('.xqfy_list ul li').each(function() {
            var info = $(this).children('.info0').eq(0);
            var title = $(info).children('.t').eq(0).children('a').eq(0).html();
            var subUrl = $(info).children('.t').eq(0).children('a').eq(0).attr('href');
            var lp = $(info).children('.lp').eq(0).children('label').eq(0).text();
            var array = lp.split(" ");
            var first = array[0];
            first = first.replace("[", "").replace("]", "");
            var area = first.split("-")[0];
            var busiCircle = first.split("-")[1];
            var address = array[1];
            var floorEntity = new FloorModel({url:subUrl, name:title, area:area, busiCircle:busiCircle, address: address});
            floorEntity.save(function(err, docs) {
                if(err) console.log("FloorGraber.grab.save:err" + err);
            });
        });

        var pagesNav = $('.pages').eq(0).children('.fr').eq(0).children('.pnav').eq(0).children('.pages-nav').eq(0);
        var lastA = $(pagesNav).children('a').last();
        if($(lastA).text().indexOf('下一页') > -1) {
            var nextPageUrl = $(lastA).attr('href');
            grabFloors(prefix, nextPageUrl);
        }

    });
};

grabFloors("http://xiaoqu.jx.fccs.com", "");