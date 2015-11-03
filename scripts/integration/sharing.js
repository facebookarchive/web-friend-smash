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
The Share Dialog allows someone using a page to post a link to their timeline,
or create an Open Graph story. Dialogs displayed using the JavaScript SDK are
automatically formatted for the context in which they are loaded - mobile web,
or desktop web.

Unlike the API-based sharing in the methods publishOGSmashAction() and
sendScore(), using this method to call the Share Dialog does not require
extra publish_actions permissions.

https://developers.facebook.com/docs/javascript/examples#dialogs
*/
function share(callback) {
  FB.ui({
    method: 'share',
    href: 'http://apps.facebook.com/' + appNamespace + '/share.php'
  }, function(response){
    console.log('share', response);
    if(callback) callback(response);
  });
}

/*
This is a sharing flow that allows players to brag about their success in the
game. By letting players share content, your game becomes visible to their
friends in their newsfeeds, which is an important source of new traffic to your
game.
*/
function sendBrag(caption, callback) {
  FB.ui({ method: 'feed',
    caption: caption,
    picture: server_url + '/images/logo_large.jpg',
    name: 'Checkout my Friend Smash greatness!'
  }, callback);
}

/*
People use stories to share the things they're doing, the people they're doing
them with and the places where they happen. Let people share stories about your
game on Facebook through OpenGraph - a structured, strongly typed API.

Publish OpenGraph smash story:
https://developers.facebook.com/docs/sharing/opengraph/custom
*/
function publishOGSmashAction(params, callback) {
 var action_type = appNamespace + ':smash';

 // Can we publish via the API?
 if( !hasPermission('publish_actions') ) {
   // Have we asked the player for publish_actions already this game?
   if( !friendCache.reRequests['publish_actions'] ) {
     // Ask for the permission
     reRequest('publish_actions', function(response) {
       // Check permission was granted, recurse the method
       friendCache.reRequests['publish_actions'] = true;
       getPermissions(function() {
         publishOGSmashAction(params);
       });
     });
   } else {
     // They said no to publish_actions, use the dialog
     FB.ui({
       method: 'share_open_graph',
       action_type: action_type,
       action_properties: {
         profile: params.profile,
         score: params.score,
         coins: params.coins
       }
     }, function(response){
       console.log('share_open_graph', action_type, response);
       if(callback) callback(response);
     });
   }
 } else {
   // We can publish via the API
   FB.api('/me/' + action_type, 'post', {
     profile: params.profile,
     score: params.score,
     coins: params.coins,
     message: params.message,
     'fb:explicitly_shared': true
   }, function(response) {
     console.log('Open graph action via API', action_type, response);
     if(callback) callback(response);
   });
 }
}

/*
The Graph API for scores lets game developers build social leaderboards and
game-matching by storing players' scores as they play. To publish a score, we
need send a HTTP POST to the /me/scores endpoint with a numeric score value.
We can do this when the Game Over screen is shown.

Note that the player needs to grant the app an extra permission,
publish_actions, in order to publish scores.

This means we need to ask for the extra permission, as well as handling the
scenario where that permission wasn't previously granted.
*/
function sendScore(score, callback) {
 // Check current score, post new one only if it's higher
 FB.api('/me/scores', function(response) {
   // Score will be returned in a JSON array with 1 element. Refer to the Graph
   // API documentation below for more information:
   // https://developers.facebook.com/docs/graph-api/reference/app/scores
   if( response.data &&
     response.data[0] &&
     response.data[0].score >= score ) {
     console.log('Lower score not posted to Facebook', score, response);
   }
   else {
     FB.api('/me/scores', 'post', { score: score }, function(response) {
       if( response.error ) {
         console.error('sendScore failed', score, response);
       } else {
         console.log('Score posted to Facebook', score, response);
       }
       callback();
     });
   }
 });
}
