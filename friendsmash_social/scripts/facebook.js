var appId = '771769079514414';
var appNamespace = 'fs_simp_testing';
var appCenterURL = '//www.facebook.com/appcenter/' + appNamespace;

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

function getMe(callback) {
  getFriendCacheData('me', callback, {fields: 'id,name,first_name,picture.width(120).height(120)'});
}

function getPermissions(callback) {
  getFriendCacheData('permissions', callback);
}

function getFriends(callback) {
  getFriendCacheData('friends', callback, {fields: 'id,name,first_name,picture.width(120).height(120)',limit: 8});
}

function getInvitableFriends(callback) {
  getFriendCacheData('invitable_friends', callback, {fields: 'name,first_name,picture',limit: 8});
}

function getScores(callback) {
  getFriendCacheData('scores', callback, {fields: 'score,user.fields(first_name,name,picture.width(120).height(120))'});
}

function hasPermission(permission) {
  for( var i in friendCache.permissions ) {
    if( 
      friendCache.permissions[i].permission == permission 
      && friendCache.permissions[i].status == 'granted' ) 
      return true;
  }
  return false;
}

function loginCallback(response) {
  console.log('loginCallback',response);
  if(response.status != 'connected') {
    top.location.href = appCenterURL;
  }
}

function login(callback) {
  FB.login(callback, {scope: 'user_friends,publish_actions', return_scopes: true});
}

function reRequest(scope, callback) {
  FB.login(callback, { scope: scope, auth_type:'rerequest'});
}

function onStatusChange(response) {
  if( response.status != 'connected' ) {
    login(loginCallback);
  } else {
    getMe(function(){
      getPermissions(function(){
        if(hasPermission('user_friends')) {
          getFriends(function(){
            renderWelcome();
            onLeaderboard();
            showHome();    
          });
        } else {
          renderWelcome();
          showHome();
        }
      });
    });
  }
}

function onAuthResponseChange(response) {
  console.log('onAuthResponseChange', response);
  if( response.status == 'connected' ) {
    getPermissions();
  }
}

function sendChallenge(to, message, callback) {
  var options = {
    method: 'apprequests'
  };
  if(to) options.to = to;
  if(message) options.message = message;
  FB.ui(options, function(response) {
    if(callback) callback(response);
  });
}

function sendBrag(caption, callback) {
  FB.ui({ method: 'feed',
    caption: caption,
    picture: 'http://www.friendsmash.com/images/logo_large.jpg',
    name: 'Checkout my Friend Smash greatness!'
  }, callback);
}

function sendScore(score, callback) {
  // Check current score, post new one only if it's higher
  FB.api('/me/scores', function(response) {
    if( response.data && response.data.score < score ) {
      FB.api('/me/scores', 'post', { score: score }, function(response) {
        if( response.error ) {
          console.error('sendScore failed',response);
        } else {
          console.log('Score posted to Facebook', response);
        }
        callback();
      });
    }
  });
}