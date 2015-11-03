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
It's not always necessary to fetch the latest information from the Graph API in
order to make a UI update. For example, a player's name and profile picture are
unlikely to change during play, but there may be several points where this
information is updated on the user interface.

To streamline this process, we'll write the responses from Graph API calls into
a local variable which we can use as a temporary store for information returned
from Graph API calls.

This will create the global object friendCache which we can then populate when
we call the Graph API. We'll retrieve information from here when we want to
update UI elements, rather than calling the APIs directly and handling the
response.
*/
var friendCache = {
  me: {},
  user: {},
  permissions: [],
  friends: [],
  invitable_friends: [],
  apprequests: [],
  scores: [],
  games: [],
  reRequests: {}
};

/*
When we get a valid response from the Graph API, we'll store the results in the
friendCache object.
*/
function getFriendCacheData(endpoint, callback, options) {
  if(endpoint) {
    var url = '/';
    if(endpoint == 'me') {
      url += endpoint;
    } else if(endpoint == 'scores') {
      url += appId + '/' + endpoint;
    } else {
      url += 'me/' + endpoint;
    }
    FB.api(url, options, function(response) {
      if( !response.error ) {
        console.log('getFriendCacheData',endpoint, response);
        friendCache[endpoint] = response.data ? response.data : response;
        if(callback) callback();
      } else {
        console.error('getFriendCacheData',endpoint, response)
      }
    });
  } else {
    getMe(function() {
      getPermissions(function() {
        getFriends(function() {
          getInvitableFriends(function() {
            getScores(callback);
          });
        });
      });
    });
  }
}

/*
Once a player successfully logs in, we can welcome them by showing their name
and profile picture on the home screen of the game. This information is returned
via the /me endpoint for the current player. We'll call this endpoint via the
SDK and use the results to personalize the home screen.
*/
function getMe(callback) {
  getFriendCacheData('me', callback,
    {fields: 'id,name,first_name,picture.width(120).height(120)'});
}

/*
We can fetch information about a player's friends via the Graph API user edge
/me/friends. This endpoint returns an array of friends who are also playing the
same game.

We can use this data to provide a set of real people to play against, showing
names and pictures of the player's friends to make the experience feel even more
personal to them.

As with the /me edge, we'll store the response data in the friendCache object
before retrieving it for the game interface.

The /me/friends edge requires an additional permission, user_friends. Without
this permission, the response from the endpoint will be empty. We need to ask
for this permission on first login, then check it exists before calling the
endpoint.

If we know the user has granted user_friends but we see an empty list of friends
returned, then we know that the user has no friends currently playing the game.
*/
function getFriends(callback) {
  getFriendCacheData('friends', callback,
    {fields: 'id,name,first_name,picture.width(120).height(120)',limit: 8});
}

/*
Calling FB.login() prompts the user to authenticate your app using the Login
Dialog.

By default, calling FB.login() will attempt to authenticate the user with only
the basic permissions. If you want one or more additional permissions, call
FB.login() with an option object, and set the scope parameter with a
comma-separated list of the permissions you wish to request from the user.

In this code, we are requesting for the user_friends and publish_actions
permissions.

https://developers.facebook.com/docs/reference/javascript/FB.login/
*/
function login(callback) {
  FB.login(callback, {scope: 'user_friends,publish_actions', return_scopes: true});
}

/*
When login is successful, force a reload of the webpage to refresh the UI.
*/
function loginCallback(response) {
  console.log('loginCallback',response);
  if(response.status != 'connected') {
    top.location.href = appCenterURL;
  }
}

/*
In our game, we need the user_friends permission when a player clicks 'Play',
so that we can pick one of their friends to smash. If a player hasn't granted
the permission before pressing 'Play', we can up-sell them the additional
permission by explaining how their gameplay experience will be enhanced by
granting it.

To respect the player's decision, we will only up-sell this permission once per
session, so we'll need to track whether we asked for the permission in a local
variable.

Re-request supports this functionality.
*/
function reRequest(scope, callback) {
  FB.login(callback, { scope: scope, auth_type:'rerequest'});
}

/*
Retrieve list of granted Facebook permissions.
*/
function getPermissions(callback) {
    getFriendCacheData('permissions', callback);
}

/*
Check if a permission has been granted.
*/
function hasPermission(permission) {
  for( var i in friendCache.permissions ) {
    if(
      friendCache.permissions[i].permission == permission
      && friendCache.permissions[i].status == 'granted' )
      return true;
  }
  return false;
}

/*
Invitable Friends
---------------------------
Get a list of the player's friends who aren't yet using the app via:
https://developers.facebook.com/docs/graph-api/reference/user/invitable_friends

Nodes returned are of the type:
https://developers.facebook.com/docs/graph-api/reference/user-invitable-friend/

These nodes have the following fields: profile picture, name and ID, which can
be used in a custom Request dialog.
---------------------------
Note! This is different from the following Graph API:
https://developers.facebook.com/docs/graph-api/reference/user/friends

Which returns the following nodes:
https://developers.facebook.com/docs/graph-api/reference/user/
*/
function getInvitableFriends(callback) {
  getFriendCacheData('invitable_friends', callback,
    {fields: 'name,first_name,picture',limit: 8});
}

/*
With player scores being written to the Graph API, we now have a data set on
which to build a social leaderboard. By calling the /app/scores endpoint for
your app, with a user access token, you get back a list of the current player's
friends' scores, ordered by score. We can turn this data into a list and use it
for launching challenges to high-scoring friends.
*/
function getScores(callback) {
  getFriendCacheData('scores', callback,
    {fields: 'score,user.fields(first_name,name,picture.width(120).height(120))'});
}

/*
Handle the login flow for non-authenticated players.
Update the UI for authenticated players.
*/
function onStatusChange(response) {
  console.log('onStatusChange', response);
  if( response.status != 'connected' ) {
    login(loginCallback);
  } else {
    parseLogin(response.authResponse).then(function(user){
      console.log('Parse login success', user);
      getMe(function(){
        getPermissions(function(){
          if(hasPermission('user_friends')) {
            getFriends(function(){
              renderWelcome();
              onLeaderboard();
              showHome();
              urlHandler(window.location.search);
            });
          } else {
            renderWelcome();
            showHome();
            urlHandler(window.location.search);
          }
        });
      });
    },function(error){
      console.log('Parse login failed', error);
    });
  }
}

/*
Handle authentication response and retrieve FB permissions.
*/
function onAuthResponseChange(response) {
  console.log('onAuthResponseChange', response);
  if( response.status == 'connected' ) {
    getPermissions();
  }
}

/*
Retrieve information on a specific player from the Graph API.
*/
function getOpponentInfo(id, callback) {
  FB.api(String(id), {fields: 'id,first_name,name,picture.width(120).height(120)' }, function(response){
    if( response.error ) {
      console.error('getOpponentInfo', response.error);
      return;
    }
    if(callback) callback(response);
  });
}
