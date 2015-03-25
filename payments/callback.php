<?php

// Skip these two lines if you're using Composer
define('FACEBOOK_SDK_V4_SRC_DIR', 'facebook-php-sdk/src/Facebook/');
require __DIR__ . '/facebook-php-sdk/autoload.php';
require __DIR__ . '/parse-php-sdk-master/autoload.php';

use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphObject;
use Facebook\FacebookRequestException;

use Parse\ParseClient;
use Parse\ParseUser;
use Parse\ParseQuery;

FacebookSession::setDefaultApplication('844042765624257','qqJJ0AfOPpXQtUymZpkj4HPgon8');

ParseClient::initialize( 
    'N1lOGVWXpikgvPFJxkfkd4kRTvaPNuOWe83zRoRx', 
    'OMoIKyKtmqMyLsaM4wYqStNzGOjFlujBbkMYswW8', 
    '0zaDlFNK1GpHq5s3KqZ51hG9UhFVAXmxb7nZm34q' );

$verify_token = "friendsmash";
$app_token = "844042765624257|qqJJ0AfOPpXQtUymZpkj4HPgon8";

// Use one of the helper classes to get a FacebookSession object.
//   FacebookRedirectLoginHelper
//   FacebookCanvasLoginHelper
//   FacebookJavaScriptLoginHelper
// or create a FacebookSession with a valid access token:
$session = new FacebookSession($app_token);

$coins_for_product = [
    'https://friendsmashsampledev.herokuapp.com/payments/100coins.html' => 100,
    'https://friendsmashsampledev.herokuapp.com/payments/500coins.html' => 500,
    'https://friendsmashsampledev.herokuapp.com/payments/1000coins.html' => 1000,
];

// Get the GraphUser object for the current user:

$method = $_SERVER['REQUEST_METHOD'];
//stdout('RTU');
if ($method == 'GET' && $_GET['hub_verify_token'] === $verify_token) {
  echo $_GET['hub_challenge'];
} else {
    $data = file_get_contents("php://input");
    $json = json_decode($data, true);

    if( $json["object"] && $json["object"] == "payments" ) {
        $payment_id = $json["entry"][0]["id"];
        try {
            $result = (new FacebookRequest(
                $session, 'GET', '/' . $payment_id . '?fields=user,actions,items,gift_requests'
            ))->execute()->getGraphObject(GraphObject::className());
            error_log('payment id: '.$result->getProperty('id'));
            $actions = $result->getPropertyAsArray('actions');
            if( $actions[0]->getProperty('status') == 'completed' ){

                $gift_requests = $result->getProperty('gift_requests');
                $user = $result->getProperty('user');
                $items = $result->getPropertyAsArray('items');
                $product = $items[0]->getProperty('product');
                $coins = $coins_for_product[$product];

                error_log('product '.$product);

                $recipient = '';
                
                if( $gift_requests ) {
                    $data = $gift_requests->getPropertyAsArray('data');
                    $recipient = $data[0]->getProperty('to')->getProperty('id');
                    error_log('gift to '.$recipient);
                } else {
                    $recipient = $user->getProperty('id');
                    error_log('purchase for '.$recipient);
                }

                $query = new ParseQuery("_User");

                $query = ParseUser::query();
                $query->equalTo("fbid", $recipient);

                try {
                    $parse_user = $query->find()[0];
                    if( !$parse_user ) return;
                    error_log($recipient . ' coins: ' . $coins );
                    $parse_user->increment('coins', $coins);
                    $parse_user->save(true);
                } catch (ParseException $ex) {
                    error_log($ex);
                }
            }
        } catch (FacebookRequestException $e) {
          // The Graph API returned an error
            error_log($e->getRawResponse());
        } catch (\Exception $e) {
            error_log($e);
        }
    }
}