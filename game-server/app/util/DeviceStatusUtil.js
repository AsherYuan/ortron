var DeviceStatusUtil = module.exports;

DeviceStatusUtil.getInitStatus = function (deviceType) {
  var model = "自动";
  var status = "关";
  var ac_windspeed = "0";
  var ac_temperature = "22";
  var tv_ismute = "0";

  var month = new Date().getMonth() + 1;

  // 空调操作
  if (deviceType === '空调') {
    if (month >= 12 && month <= 2) {
      model = "制热";
    } else if (month > 2 && month < 6) {
      model = "自动";
    } else if (month > 5 && month < 10) {
      model = "制冷";
    } else if (month > 10 && month < 12) {
      model = "自动";
    }
  } else if (deviceType === '电视') {

  } else {
    // TODO
  }


  var status = {
    model : model,
    status: status,
    ac_windspeed: ac_windspeed,
    ac_temperature: ac_temperature,
    tv_ismute: tv_ismute
  }
  return status;
};