var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
  var index = Math.abs(crc.crc32(uid)) % connectors.length;
  return connectors[index];
};

module.exports.findByServerid = function(serverid, connectors) {
  var connector = connectors[0];
  for (var i=0; i<connectors.length; i++){
    if (connectors[i].serverid == serverid){
      connector = connectors[i];
      break;
    }
  }
  return connector;
};
