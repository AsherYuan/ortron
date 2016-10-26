var pomelo = require('pomelo');
var status = require('pomelo-status-plugin');
var globalChannel = require('pomelo-globalchannel-plugin');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'ortron');

// app configuration
app.configure('production|development', 'connector|user|home|estate', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 30,
      useDict : false,
      useProtobuf : false
    });
});

/**
 * 全局channel，可用于不同服务器之间的互相通信
 * @type {Object}
 */
// app.use(globalChannel, {globalChannel: {
//   host: '127.0.0.1',
//   port: 6379
// }});
//
// app.use(status, {status: {
//   host: '127.0.0.1',
//   port: 6379
// }});


// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
