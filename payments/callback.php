<?php

// Skip these two lines if you're using Composer
define('FACEBOOK_SDK_V4_SRC_DIR', 'facebook-php-sdk/src/Facebook/');
require __DIR__ . '/facebook-php-sdk/autoload.php';

use Facebook\FacebookSession;
use Facebook\FacebookRequest;
use Facebook\GraphObject;
use Facebook\FacebookRequestException;

FacebookSession::setDefaultApplication('844042765624257','qqJJ0AfOPpXQtUymZpkj4HPgon8');

$verify_token = "friendsmash";
$app_token = "844042765624257|qqJJ0AfOPpXQtUymZpkj4HPgon8";

// Use one of the helper classes to get a FacebookSession object.
//   FacebookRedirectLoginHelper
//   FacebookCanvasLoginHelper
//   FacebookJavaScriptLoginHelper
// or create a FacebookSession with a valid access token:
$session = new FacebookSession($app_token);

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
                $recipient = '';
                
                if( $gift_requests ) {
                    $data = $gift_requests->getPropertyAsArray('data');
                    $recipient = $data[0]->getProperty('to')->getProperty('id');
                    error_log('gift to '.$recipient);
                } else {
                    $recipient = $user->getProperty('id');
                    error_log('purchase for '.$recipient);
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