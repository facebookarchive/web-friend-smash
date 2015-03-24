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

function renderWelcome() {
  var welcome = $('#welcome');
  welcome.find('.first_name').html(friendCache.me.first_name);
  welcome.find('.profile').attr('src',friendCache.me.picture.data.url);
  welcome.find('.stats .coins').html(Parse.User.current().get('coins'));
  welcome.find('.stats .bombs').html(Parse.User.current().get('bombs'));
}

var CONFIRM_YES = 1, CONFIRM_NO = 0;

function showConfirmationPopup(message,callback) {
  var c = confirm(message);
  if(c){
    callback(CONFIRM_YES);
  } else {
    callback(CONFIRM_NO);
  }
}

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
      bombs: 3
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

function showGameOver() {
  $('section').addClass('hidden');
  $('#gameover').removeClass('hidden');
}

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

function showStage() {
  $('section').addClass('hidden');
  $('#stage').removeClass('hidden');
}

function showHome() {
  $('section').addClass('hidden');
  $('#home').removeClass('hidden');
}

function onChallenge() {
  if( !hasPermission('user_friends') ) {
    sendChallenge();
  } else {
    getFriends(function(){
      getInvitableFriends(function(){
        renderFriends();
        renderInvitableFriends();
        $('#home').find('.panel.right').addClass('hidden');
        $('#friendselector').removeClass('hidden');
      });
    });
  }
}

function onChallengeShowFriends() {
  $('#friendselector').removeClass('invitable_friends').addClass('friends');
}

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

function onBuyBomb() {
  console.log('buy bomb');
  var bombCost = 500;
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

function onStore() {
  $('#home').find('.panel.right').addClass('hidden');
  $('#store').removeClass('hidden');
}

function onStoreItemBuyClick() {
  var product= $(this).parent().attr('data-product');
  purchaseProduct(product, renderWelcome);
}

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
  gameStats.find('.bombs').removeClass('none one two three').addClass(numberClasses[gameState.bombs]);
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