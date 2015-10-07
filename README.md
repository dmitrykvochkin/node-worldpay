# node-worldpay
NodeJs module to integrate worldpay(www.worldpay.com) credit card processing in your applications. 

NPM - https://www.npmjs.com/package/node-worldpay
WorldPay docs - http://support.worldpay.com/support/





###How to use:
```javascript
var Worldpay = require('node-worldpay'),
	worldpay = new Worldpay({
		merchantCode: 'YOUR_MERCHANT_CODE',
		password: 'PASSWORD',
		installationId: 'INSTALLATION_ID',
		baseUrl: 'https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp'
	});
```


####Charge credit card
```javascript
worldpay.charge({
	card: {
      number: '4945670000000',
      cvc: '000',
      expirationMonth: '03',
      expirationYear: '2016',
      holderName: "Ra's al Ghul"
    }
}, function(err, result){
	console.log(result.orderStatus[0].payment);
});
```