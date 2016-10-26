// 加载File System读写模块
var fs = require('fs');
// 加载编码转换模块
var iconv = require('iconv-lite');
var BrandModelModel = require('./app/mongodb/models/BrandModelModel');

var file = "./deviceBrandData";
readFile(file);

function readFile(file){
    fs.readFile(file, function(err, data){
        if(err)
            console.log("读取文件fail " + err);
        else{
            var str = iconv.decode(data, 'utf-8');
            var lines = str.split(",");
            for(var i=0;i<lines.length;i++) {
                var l = lines[i];
                var words = l.split("\t");
                var tid = words[0];
                var model = words[1];
                var type = words[2];
                var brand = words[3];

                if(type === "电视" || type === "空调") {
                    var bm = new BrandModelModel({
                        tid:tid,
                        model:model,
                        type:type,
                        brand:brand
                    });

                    bm.save();
                }
            }
        }
    });
}
