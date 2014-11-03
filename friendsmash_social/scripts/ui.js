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
      bombs: 5
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
  showGameOver();
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
  var player = {
    bombs: 5
  };
  var challenger = {
    id: $(this).attr('data-id'),
    picture: $(this).find('img').attr('src'),
    name: $(this).find('.name').html()
  };
  showStage();
  updateChallenger(challenger);
  initGame(player, challenger, $('#canvas'), updateGameStats, onGameEnd);
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
  sendChallenge($(this).attr('data-id'), 'I just smashed you ' + $(this).attr('data-score') + 'times. Think you can beat me?', function(){
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
