<?php

$verify_token = "friendsmash";
$app_token = "844042765624257|qqJJ0AfOPpXQtUymZpkj4HPgon8";

$method = $_SERVER['REQUEST_METHOD'];
//stdout('RTU');
if ($method == 'GET' && $_GET['hub_verify_token'] === $verify_token) {
  echo $_GET['hub_challenge'];
} else {
    $data = file_get_contents("php://input");
    $json = json_decode($data, true);
    if( $json["object"] && $json["object"] == "payments" ) {
        
        $graph_url = "https://graph.facebook.com/" . $json["entry"][0]["id"] . "?fields=actions,items,gift_requests&access_token=" . $app_token;
        error_log("graph api");
        error_log($graph_url);

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $graph_url);
        $result = curl_exec($curl);
        error_log("result");
        error_log($graph_url);

        $result_json = json_decode($result, true);

        if($result_json){// && $result_json["actions"][0] && $result_json["actions"][0]["status"] = "completed") {
            error_log($result_json);
        } else {
            error_log($result);
        }
    }
}