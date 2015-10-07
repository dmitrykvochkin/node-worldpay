var request = require('request'),
    builder = require('xmlbuilder'),
    xml2js   = require('xml2js').parseString,
    ERROR = true,
    CreditCardType = {
      VISA: 'vs',
      MASTERCARD: 'ms',
      AMERICAN_EXPRESS: 'as',

      DINERS_CLUB: 'dc',
      DISCOVER: 'ds',
      JCB: 'jcb'
    };










function Worldpay(userOptions){
	var options = this.options = merge({}, userOptions);

  return this;
};







Worldpay.prototype.charge = function(userOptions, callback){
  var options = this.options,
      url = options.baseUrl;

  var xml = buildXml({
    merchantCode: options.merchantCode,
    installationId: options.installationId,
    cardType: detectCardType(userOptions.card.number),
    card: userOptions.card
  });



  request({
    method: 'POST',
    url: url,
    body: xml,
    headers: {
      'content-type': 'text/xml'
    },
    auth: {
      username: options.merchantCode,
      password: options.password
    }
  }, function(error, response, body){

    if(error){ return callback(error, null); }

    if(response.statusCode < 200 || response.statusCode >= 300) {return callback('Failed request [response status: ' + response.statusCode + ']');}

    xml2js(body, function(err, result){
      callback(null, result.paymentService.reply[0]);
    });

  });

};


module.exports = Worldpay;











function buildXml(options){
  var xml = builder.create('paymentService', {version: '1.0', encoding: 'UTF-8'})
                    .att('version', '1.4')
                    .att('merchantCode', options.merchantCode)
                    .ele('submit')
                    .ele('order', {orderCode: generateUniqueId(), installationId: options.installationId})
                    .ele('description', {}, 'Order created at: 23h982y9h9')
                    .up()
                    .ele('amount', {value: 1000, currencyCode: 'USD', exponent: options.exponent || 0})
                    .up()
                    .ele('orderContent').dat('thisis-cdata-content-asiwantitobe')
                    .up()
                    .ele('paymentDetails')
                    .ele(GetWorldpaySSLNode(options.cardType))
                    .ele('cardNumber', {}, options.card.number)
                    .up()
                    .ele('expiryDate').ele('date', {month: options.card.expirationMonth, year: options.card.expirationYear})
                    .up().up()
                    .ele('cardHolderName', {}, options.card.holderName)
                    .up()
                    .ele('cvc', {}, options.card.cvc)
                    .up()
                    .end(); //{ pretty: true}


  var doctype = '<!DOCTYPE paymentService PUBLIC "-//WorldPay//DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">';
      
  xml = xml.substring(0, 38) + doctype + xml.substring(38, xml.length);

  return xml;
}




function GetWorldpaySSLNode(t)
{
    var s = "";
    if (t == CreditCardType.VISA) s = "VISA-SSL";
    else if (t == CreditCardType.MASTERCARD) s = "ECMC-SSL";
    else if (t == CreditCardType.AMERICAN_EXPRESS) s = "AMEX-SSL";
    else if (t == CreditCardType.DINERS_CLUB) s = "DINERS-SSL";
    else if (t == CreditCardType.DISCOVER) s = "DISCOVER-SSL";
    else if (t == CreditCardType.JCB) s = "JCB-SSL";

    return s;
}







//http://stackoverflow.com/questions/72768/how-do-you-detect-credit-card-type-based-on-number
function detectCardType(number){

  if(number.toString().match('^4[0-9]{6,}$')){
    return CreditCardType.VISA;
  }else if(number.toString().match('^5[1-5][0-9]{5,}$')){
    return CreditCardType.MASTERCARD;
  }else if(number.toString().match('^3[47][0-9]{5,}$')){
    return CreditCardType.AMERICAN_EXPRESS;
  }else if(number.toString().match('^3(?:0[0-5]|[68][0-9])[0-9]{4,}$')){
    return CreditCardType.DINERS_CLUB;
  }else if(number.toString().match('^6(?:011|5[0-9]{2})[0-9]{3,}$')){
    return CreditCardType.DISCOVER;
  }else if(number.toString().match('^(?:2131|1800|35[0-9]{3})[0-9]{3,}$')){
    return CreditCardType.JCB;
  }

}






function generateUniqueId() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
}



/**
 * deep merge 2 or more objects
 * @return IF first argument = true -> merges second object into the first ELSE return new object
 */
function merge() {
  var i,
    args = arguments,
    len,
    ret = {},
    doCopy = function (copy, original) {
      var value, key;

      // An object is replacing a primitive
      if (typeof copy !== 'object') {
        copy = {};
      }

      for (key in original) {
        if (original.hasOwnProperty(key)) {
          value = original[key];

          // Copy the contents of objects, but not arrays or DOM nodes
          if (value && typeof value === 'object' && Object.prototype.toString.call(value) !== '[object Array]'
              && key !== 'renderTo' && typeof value.nodeType !== 'number' && Object.prototype.toString.call(value) !== '[object Date]') {
            copy[key] = doCopy(copy[key] || {}, value);
        
          // Primitives and arrays are copied over directly
          } else {
            if(Object.prototype.toString.call(value) == '[object Date]'){
              copy[key] = new Date(original[key]);
            }else{
              copy[key] = original[key];
            }
          }
        }
      }
      return copy;
    };

  // If first argument is true, copy into the existing object. Used in setOptions.
  if (args[0] === true) {
    ret = args[1];
    args = Array.prototype.slice.call(args, 2);
  }

  // For each argument, extend the return
  len = args.length;
  for (i = 0; i < len; i++) {
    ret = doCopy(ret, args[i]);
  }

  return ret;
};