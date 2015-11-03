/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to use,
 * copy, modify, and distribute this software in source code or binary form for use
 * in connection with the web services and APIs provided by Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use of
 * this software is subject to the Facebook Developer Principles and Policies
 * [http://developers.facebook.com/policy/]. This copyright notice shall be
 * included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
URLs for different coin packages that the player can choose to purchase.
*/
var coins100 = server_url + '/payments/100coins.html';
var coins500 = server_url + '/payments/500coins.html';
var coins1000 = server_url + '/payments/1000coins.html';

var coinsForProduct = {
	coins100 : 100,
	coins500 : 500,
	coins1000 : 1000
}

/*
The Facebook JavaScript API is invoked to display the Pay Dialog. Full details
on this FB.ui() call can be found in the Pay Dialog - API Reference doc.

https://developers.facebook.com/docs/payments/reference/paydialog

Notice that we pass the URL of the product that the player wants to buy and the
appropriate quantity.

This is all that's needed to spawn the Facebook Pay Dialog, and allow the user
to make a payment.
*/
function purchaseProduct(product, callback, gift) {
	FB.ui({
		method: gift ? 'gift' : 'pay',
		action: 'purchaseitem',
		product: product
	}, function(response) {
		console.log('Payment completed', response);
		if(response.status && response.status == 'completed') {
			refreshParseUser().then(renderWelcome);
		}
		if(callback) callback(response);
	} );
}

/*
Purchase a product as a gift to a friend.
*/
function giftProduct(product, callback) {
	purchaseProduct(product, callback, true);
}
