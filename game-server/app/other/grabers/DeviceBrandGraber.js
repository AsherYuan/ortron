var Graber = require("../../other/grabers/graber.js");
var mongoose = require('../../mongodb/mongoose.js');
var DeviceBrandModel = require('../../mongodb/models/DeviceBrandModel.js');

var grabBrands = function(href, type) {
  Graber.grab(href, function(json) {
    var obj = JSON.parse(json);
    for(var i=0;i<obj.brands.length;i++) {
      var brand = obj.brands[i];
      var name = brand.name;
      var entity = new DeviceBrandModel({name:name, type:type});
      entity.save(function(data){});
      console.log(name);
    }
  });
};

grabBrands('http://list.jd.com/list.html?cat=737,794,870&md=1&my=list_brand', '空调');
// grabBrands('http://list.jd.com/list.html?cat=737,794,798&md=1&my=list_brand', '电视');