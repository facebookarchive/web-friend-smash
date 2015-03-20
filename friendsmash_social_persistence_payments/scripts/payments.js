var coinsForProduct = {
	'https://friendsmashsampledev.herokuapp.com/payments/100coins.html' : 100,
	'https://friendsmashsampledev.herokuapp.com/payments/500coins.html' : 500,
	'https://friendsmashsampledev.herokuapp.com/payments/1000coins.html' : 1000
}

function purchaseProduct(product, callback, gift) {
	FB.ui({
		method: gift ? 'gift' : 'pay',
		action: 'purchaseitem',
		product: product
	}, function(response) {
		console.log('Payment completed', response);
		if(response.status && response.status == 'completed') {
			saveParseUser( coinsForProduct[product], 0 ).then( function(user) {
				if(callback) callback(response);
			}, function(error) {
    			console.log('Error buying bomb');
			});
		}
		if(callback) callback(response);
	} );
}

function giftProduct(product, callback) {
	purchaseProduct(product, callback, true);
}