var g_useFacebook = true;

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

$( document ).ready(function() {

  $( document ).on( 'click', '#menu button.play', onPlay );
  $( document ).on( 'click', '#menu button.challenge', onChallenge );
  $( document ).on( 'click', '#menu button.leaderboard', onLeaderboard );

  $( document ).on( 'click', '.friendselector .item', onChallengeItemClick );
  $( document ).on( 'click', '.leaderboard .item', onLeaderboardItemClick );

  $( document ).on( 'click', '#friendselector button.challenge.send', onChallengeSend );
  $( document ).on( 'click', '#friendselector button.invitable_friends', onChallengeShowInvitableFriends );
  $( document ).on( 'click', '#friendselector button.friends', onChallengeShowFriends );

  $( document ).on( 'click', '#gameover button.challenge', onGameOverChallenge );
  $( document ).on( 'click', '#gameover button.brag', onGameOverBrag );
  $( document ).on( 'click', '#gameover button.share_action', onGameOverShareAction );
  $( document ).on( 'click', '#gameover button.close', onGameOverClose );

  $( document ).on( 'click', 'header button.share', onShare );

  $( document ).on( 'mousedown', '#canvas', onGameCanvasMousedown );

  FB.init({
    appId: appId,
    frictionlessRequests: true,
    status: true,
    version: 'v2.0'
  });

  FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
  FB.Event.subscribe('auth.statusChange', onStatusChange);
});
