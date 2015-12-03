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
  Update the welcome screen with information from friendCache.
*/
function renderWelcome() {
  var welcome = $('#welcome');
  welcome.find('.first_name').html(friendCache.me.first_name);
  welcome.find('.profile').attr('src',friendCache.me.picture.data.url);
  welcome.find('.stats .coins').html(Parse.User.current().get('coins'));
  welcome.find('.stats .bombs').html(Parse.User.current().get('bombs'));
}

/*
  Update scores of friends
*/
function renderScores() {
  var list = $('#leaderboard .scrollable_list');
  list.children().remove('.item');
  var template = list.find('.template');
  for( var i = 0; i < friendCache.scores.length; i++ ) {
    var item = template.clone().removeClass('template').addClass('item');
    item.attr('data-id',friendCache.scores[i].user.id);
    item.attr('data-first-name',friendCache.scores[i].user.first_name);
    item.find('.rank').html(i+1);
    item.find('.score').html(friendCache.scores[i].score);
    item.find('.name').html(friendCache.scores[i].user.name);
    item.find('.profile').attr('src',friendCache.scores[i].user.picture.data.url);
    list.append(item);
  }
}

/*
  Update friends that you can invite
*/
function renderInvitableFriends() {
  var list = $('#friendselector .scrollable_list.invitable_friends');
  list.children().remove('.item');
  var template = list.find('.template');
  for( var i = 0; i < friendCache.invitable_friends.length; i++ ) {
    var item = template.clone().removeClass('template').addClass('item');
    item.attr('data-id',friendCache.invitable_friends[i].id);
    item.find('.name').html(friendCache.invitable_friends[i].name);
    item.find('.profile').attr('src',friendCache.invitable_friends[i].picture.data.url);
    list.append(item);
  }
}

/*
  Update friends
*/
function renderFriends() {
  var list = $('#friendselector .scrollable_list.friends');
  list.children().remove('.item');
  var template = list.find('.template');
  for( var i = 0; i < friendCache.friends.length; i++ ) {
    var item = template.clone().removeClass('template').addClass('item');
    item.attr('data-id',friendCache.friends[i].id);
    item.find('.name').html(friendCache.friends[i].name);
    item.find('.profile').attr('src',friendCache.friends[i].picture.data.url);
    list.append(item);
  }
}

/*
  Yes/No Confirmation popup
*/
var CONFIRM_YES = 1, CONFIRM_NO = 0;
function showConfirmationPopup(message,callback) {
  var c = confirm(message);
  if(c){
    callback(CONFIRM_YES);
  } else {
    callback(CONFIRM_NO);
  }
}

/*
  Play against a friend / celebrity
*/
function onPlay() {
  // Player hasn't granted user_friends and hasn't been re-asked this session
  if( !hasPermission('user_friends')
    && !friendCache.reRequests['user_friends'] ) {

    showConfirmationPopup('Wanna play with friends?', function(response){

      // Record that user has been re-asked this session
      friendCache.reRequests['user_friends'] = true;

      if( response == CONFIRM_YES ) {
        // Ask for permisisons again, check if granted,
        // refresh permissions, get friends,
        // try playing again
        reRequest('user_friends', function(){
          getPermissions(function(){
            getFriends(function(){
              onPlay();
            });
          });
        });
      } else {
        // User said no, try playing again
        onPlay();
      }
    });
  } else {

    // Player has friend permissions, or hasn't granted it
    // Either way, play against a friend if there are friends, otherwise play against a celebrity
    var challenger = {};
    var player = {
      bombs: Parse.User.current().get('bombs')
    };
    if( friendCache.friends.length > 0 ) {
      var randomFriend = Math.floor(getRandom(0, friendCache.friends.length));
      challenger = {
        id: friendCache.friends[randomFriend].id.toString(),
        picture: friendCache.friends[randomFriend].picture.data.url,
        name: friendCache.friends[randomFriend].first_name
      };
    } else {
      var nCelebToSpawn = Math.floor(getRandom(0, celebs.length));
      challenger = {
        picture: celebs[nCelebToSpawn].picture,
        name: celebs[nCelebToSpawn].name
      };
    }
    showStage();
    updateChallenger(challenger);
    initGame(player, challenger, $('#canvas'), updateGameStats, onGameEnd);
  }
}

/*
  Show Game Over screen
*/
function showGameOver() {
  $('section').addClass('hidden');
  $('#gameover').removeClass('hidden');
}

/*
  Game has ended:
    Update and persist player data in Parse.
    If publish_actions permission is granted, publish player's score to
    Facebook.
*/
function onGameEnd(gameState) {
  console.log('Game ended', gameState);
  logGamePlayedEvent(gameState.score);
  showGameOver();
  if( gameState.bombsUsed || gameState.coinsCollected ) {
    saveParseUser(gameState.coinsCollected, gameState.bombsUsed).then( function(user) {
      console.log('Parse User saved after game end');
      renderWelcome();
    }, function(error) {
      console.log('Error saving Parse User after game end', error);
    });
  }
  if( !hasPermission('publish_actions')
    && !friendCache.reRequests['publish_actions']) {
    showConfirmationPopup('Do you want to publish your scores to Facebook?', function(response) {
      friendCache.reRequests['user_friends'] = true;
      if( response == CONFIRM_YES ) {
        reRequest('publish_actions', function(){
          getPermissions(function(){
            sendScore(gameState.score, function(){});
          });
        });
      }
    });
  } else {
    sendScore(gameState.score, function(){});
  }
}

/*
  Show Game Stage
*/
function showStage() {
  $('section').addClass('hidden');
  $('#stage').removeClass('hidden');
}

/*
  Show the Home screen
*/
function showHome() {
  $('section').addClass('hidden');
  $('#home').removeClass('hidden');
}

/*
The Requests dialog has a simple friend selector built-in, but as a developer we
have no control over the look & feel. We can build our own friend selector that
shares the look and feel of Friend Smash, and fits more neatly into the interace
of the game.

To do this, we need to get lists of the player's friends who are playing the
game, as well as those who arent. There are two Graph API endpoints to achieve
this:
  /me/friends
  /me/invitable_friends - which returns a list of the player's friends who
    aren't yet using the app.

Both of these endpoints require the user_friends permission.
*/
function onChallenge() {
  if( !hasPermission('user_friends') ) {
    /*
    Invoke the sendChallenge method when the new Challenge button has been
    clicked.
    */
    sendChallenge();
  }
  else {
    getFriends(function(){
      /*
      show our new custom friend selector if the user_friends permission has
      been granted.
      */
      getInvitableFriends(function(){
        renderFriends();
        renderInvitableFriends();
        $('#home').find('.panel.right').addClass('hidden');
        $('#friendselector').removeClass('hidden');
      });
    });
  }
}

/*
Show friends that the player can challenge.
*/
function onChallengeShowFriends() {
  $('#friendselector').removeClass('invitable_friends').addClass('friends');
}

/*
Show invitable friends that the player can challenge.
*/
function onChallengeShowInvitableFriends() {
  $('#friendselector').removeClass('friends').addClass('invitable_friends');
}

function onChallengeItemClick() {
  $(this).toggleClass('selected');
  if( $('#friendselector .scrollable_list.friendselector li.item.selected').length > 0 ) {
    $('#friendselector button.send').removeAttr('disabled');
  } else {
    $('#friendselector button.send').attr('disabled', 'disabled');
  }
}

/*
We're creating a list of IDs in onChallengeSend and using that in the to
parameter of sendChallenge. When passing a list of IDs to the Request dialog,
we ask it to bypass its own friend selector and instead present a list of
intended recipients.

This time, we're using the callback function on sendChallenge to de-select any
of the selected friends after sending a request.
*/
function onChallengeSend() {
  var to = '';
  $('#friendselector .scrollable_list.friendselector li.item.selected').each(function(){
    if( to != '' ) to += ',';
    to += $(this).attr('data-id');
  });
  sendChallenge(to,'Friend Smash is great fun! Come and check it out!', function(){
    $('#friendselector .scrollable_list.friendselector li.item').removeClass('selected');
    $('#friendselector button.send').attr('disabled', 'disabled');
  })
}

function onLeaderboard() {
  getScores(function(){
    renderScores();
    $('#home').find('.panel.right').addClass('hidden');
    $('#leaderboard').removeClass('hidden');
  });
}

function onLeaderboardItemClick() {
  playAgainstSomeone($(this).attr('data-id'));
}

/*
 Play against a specific person.
*/
function playAgainstSomeone(id) {
  getOpponentInfo(id,function(response) {
    var challenger = {
      id: response.id,
      picture: response.picture.data.url,
      name: response.first_name
    }, player = {
      bombs: Parse.User.current().get('bombs')
    };
    showStage();
    updateChallenger(challenger);
    initGame(player, challenger, $('#canvas'), updateGameStats, onGameEnd);
  });
}

/*
  Buy a bomb
*/
function onBuyBomb() {
  console.log('buy bomb');
  if( Parse.User.current().get('coins') < bombCost ) {
    alert("You can't afford a bomb!");
    return;
  }
  saveParseUser(-1*bombCost, -1).then( function(user) {
    console.log('Bought bomb');
    renderWelcome();
  }, function(error) {
    console.log('Error buying bomb');
  });
}

/*
  Show the store
*/
function onStore() {
  $('#home').find('.panel.right').addClass('hidden');
  $('#store').removeClass('hidden');
}

/*
  Buy a store item for yourself
*/
function onStoreItemBuyClick() {
  var product= $(this).parent().attr('data-product');
  purchaseProduct(product, renderWelcome);
}

/*
  Buy a store item as a gift for a friend
*/
function onStoreItemGiftClick() {
  var product= $(this).parent().attr('data-product');
  giftProduct(product, renderWelcome);
}

function updatePlayerUI() {
  console.error('updatePlayerUI');
}

function displayMenu() {
  console.error('displayMenu');
}

function showPopUp() {
  console.error('showPopUp');
}

function updateChallenger(challenger) {
  var gameStats = $('#gamestats');
  gameStats.find('.profile').attr('src',challenger.picture);
  gameStats.find('.name').html(challenger.name);

  var gameOverScreen = $('#gameover');
  gameOverScreen.find('.profile').attr('src', challenger.picture );
  gameOverScreen.find('.name').html( challenger.name );
  gameOverScreen.find('button.challenge').attr( 'data-id', challenger.id );
  gameOverScreen.find('button.brag').attr( 'data-id', challenger.id );
  gameOverScreen.find('button.share_action').attr( 'data-id', challenger.id );
}

function updateGameStats(gameState) {
  var numberClasses = ['none','one','two','three'];
  var gameStats = $('#gamestats');
  gameStats.find('.score_value').html(gameState.score);
  gameStats.find('.bombs').removeClass('none one two three').addClass(numberClasses[gameState.bombsAvailable]);
  gameStats.find('.lives').removeClass('none one two three').addClass(numberClasses[gameState.lives]);

  var gameOverScreen = $('#gameover');
  gameOverScreen.find('.score').html(gameState.score );
  gameOverScreen.find('.coins').html(gameState.coinsCollected );
  gameOverScreen.find('.coins_plurality').html( gameState.coinsCollected == 1 ? 'coin' : 'coins' );
  gameOverScreen.find('button.challenge').attr( 'data-score', gameState.score );
  gameOverScreen.find('button.brag').attr( 'data-score', gameState.score );
  gameOverScreen.find('button.share_action').attr( 'data-score', gameState.score );
  gameOverScreen.find('button.share_action').attr( 'data-coins', gameState.coinsCollected );
}

function onGameOverChallenge() {
  sendChallenge($(this).attr('data-id'), 'I just smashed you ' + $(this).attr('data-score') + ' times. Think you can beat me?', function(){
    onGameOverClose();
  }, true);
}

/*
Share a Brag when the button is clicked.
*/
function onGameOverBrag() {
  sendBrag('I just scored ' + $(this).attr('data-score') + '! Think you can beat me?', function(){
    showHome();
  });
}

function onGameOverShareAction() {
  var params = {
    profile: $(this).attr('data-id'),
    score: $(this).attr('data-score'),
    coins: $(this).attr('data-coins'),
    message: $('.share_composer textarea').val()
  }
  publishOGSmashAction(params, function(){
    $('.share_composer textarea').val('');
    showHome();
  });
}

function onGameOverClose() {
  showHome();
}

function onShare() {
  share();
}

function getParameterByName(url, name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(url);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function urlHandler(data) {
  // Called from either setUrlHandler or using window.location on load, so normalise the path
  var path = data.path || data;
  console.log('urlHandler', path);

  var request_ids = getParameterByName(path, 'request_ids');
  var latest_request_id = request_ids.split(',')[0];
  var content = getParameterByName(path, 'content');

  if (content && content.startsWith('gift')) {
    // User was just gifted an object; refresh Parse user then update UI
    refreshParseUser().then(function(user){
      console.log('Refreshed current user from Parse', user);
      renderWelcome();
    }, function(error){
      console.error('Error refreshing user', error);
    });
  } else if (latest_request_id) {
    // Not a gift, but probably a challenge request. Play against sender
    getRequestInfo(latest_request_id, function(request) {
      playAgainstSomeone(request.from.id);
      deleteRequest(latest_request_id);
    });
  }
}
