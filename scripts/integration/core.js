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
  App-specific configuration for your game.

  You will need to configure:
    - the URL to the server where you are hosting the game source code.
    - create a new App and retrieve the app ID and namespace from Facebook
    Developer site at https://developers.facebook.com/apps
*/
var server_url = "https://friendsmashsample.herokuapp.com";
var appId = '480369938658210';
var appNamespace = 'friendsmashsample';
var appCenterURL = '//www.facebook.com/appcenter/' + appNamespace;

var g_useFacebook = true;
var bombCost = 5; // coins

var defaults = {
  coins: 100,
  bombs: 3
}

var celebs = [{
  name: 'Einstein',
  picture: 'images/celebs/einstein.png'
},{
  name: 'Xzibit',
  picture: 'images/celebs/xzibit.png'
},{
  name: 'Goldsmith',
  picture: 'images/celebs/goldsmith.png'
},{
  name: 'Sinatra',
  picture: 'images/celebs/sinatra.png'
},{
  name: 'George',
  picture: 'images/celebs/george.png'
},{
  name: 'Jacko',
  picture: 'images/celebs/jacko.png'
},{
  name: 'Rick',
  picture: 'images/celebs/rick.png'
},{
  name: 'Keanu',
  picture: 'images/celebs/keanu.png'
},{
  name: 'Arnie',
  picture: 'images/celebs/arnie.png'
},{
  name: 'Jean-Luc',
  picture: 'images/celebs/jeanluc.png'
}];

/*
  Code initialization
*/
$( document ).ready(function() {

  // Register input event listeners
  $( document ).on( 'click', '#welcome .buybomb', onBuyBomb );

  $( document ).on( 'click', '#gamestats .bombs', dropTheBomb );

  $( document ).on( 'click', '#menu button.play', onPlay );
  $( document ).on( 'click', '#menu button.challenge', onChallenge );
  $( document ).on( 'click', '#menu button.leaderboard', onLeaderboard );
  $( document ).on( 'click', '#menu button.store', onStore );

  $( document ).on( 'click', '.leaderboard .item', onLeaderboardItemClick );
  $( document ).on( 'click', '.store .item .buy', onStoreItemBuyClick );
  $( document ).on( 'click', '.store .item .gift', onStoreItemGiftClick );

  $( document ).on( 'click', '.friendselector .item', onChallengeItemClick );
  $( document ).on( 'click', '#friendselector button.challenge.send', onChallengeSend );
  $( document ).on( 'click', '#friendselector button.invitable_friends', onChallengeShowInvitableFriends );
  $( document ).on( 'click', '#friendselector button.friends', onChallengeShowFriends );

  $( document ).on( 'click', '#gameover button.challenge', onGameOverChallenge );
  $( document ).on( 'click', '#gameover button.brag', onGameOverBrag );
  $( document ).on( 'click', '#gameover button.share_action', onGameOverShareAction );
  $( document ).on( 'click', '#gameover button.close', onGameOverClose );

  $( document ).on( 'click', 'header button.share', onShare );

  $( document ).on( 'mousedown', '#canvas', onGameCanvasMousedown );

  /*
  FB initialization code.
  https://developers.facebook.com/docs/javascript/reference/FB.init/

  The method FB.init() is used to initialize and setup the SDK.

  @status   informs the SDK that it should check the player's
  authentication status as part of the initialization process.

  @frictionlessRequests   lets players send requests to friends from an app
  without having to click on a pop-up confirmation dialog. When sending a
  request to a friend, a player can authorize the app to send subsequent
  requests to the same friend without another dialog. This streamlines the
  process of sharing with friends.
  */
  FB.init({
    appId: appId,
    frictionlessRequests: true,
    status: true,
    version: 'v2.5'
  });

  /*
  Reports that the page is now usable by the user, for collecting performance
  metrics.
  https://developers.facebook.com/docs/reference/javascript/FB.Canvas.setDoneLoading
  */
  FB.Canvas.setDoneLoading();

  /*
  Registers the callback for inline processing of user actions
  https://developers.facebook.com/docs/reference/javascript/FB.Canvas.setUrlHandler
  */
  FB.Canvas.setUrlHandler( urlHandler );

  // initialize Parse
  Parse.initialize(parseAppID, parseJSKey);

  /*
  Checking the authentication status is an asynchronous process which will
  start as soon as the SDK has been initialized and will fire the two events
  auth.authResponseChange and auth.statusChange upon completion.

  By subscribing to these events, we can control what happens next in the
  initialization process.
  */
  FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
  FB.Event.subscribe('auth.statusChange', onStatusChange);
});
