var crypto = require('crypto');

/**
 * 根据uid生成token
 *
 * @param  {String} uid user id
 * @param  {String} pwd encrypt password
 * @return {String}     token string
 */
module.exports.create = function(uid, pwd) {
  var msg = uid;
  var cipher = crypto.createCipher('aes256', pwd);
  var enc = cipher.update(msg, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
};

/**
 * 根据token还原uid
 *
 * @param  {String} token token string
 * @param  {String} pwd   decrypt password
 * @return {Object}  uid and timestamp that exported from token. null for illegal token.
 */
module.exports.parse = function(token, pwd) {
  var decipher = crypto.createDecipher('aes256', pwd);
  var dec;
  try {
    dec = decipher.update(token, 'hex', 'utf8');
    dec += decipher.final('utf8');
  } catch(err) {
    //console.error('[token] fail to decrypt token. %j', token);
    return null;
  }
  var ts = dec.split('|');
  if(ts.length !== 1) {
    // illegal token
    return null;
  }
  return {uid: ts[0]};
};
