var request = require('request');



function Worldpay(userOptions){
	
};



Worldpay.prototype.verify = function(userOptions){
	console.log('Worldpay.verify');
};

Worldpay.prototype.charge = function(userOptions){
	console.log('Worldpay.charge');
};


module.exports = Worldpay;