<!DOCTYPE html>
<html>
  <head>
    <title>Friend Smash!</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta property="og:image" content="http://www.friendsmash.com/images/logo_large.jpg"/>

    <link href="style/reset.css" rel="stylesheet" type="text/css">
    <link href="style/style.css" rel="stylesheet" type="text/css">

    <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
    <script src="//connect.facebook.net/en_US/sdk.js"></script>
    <script src="//www.parsecdn.com/js/parse-1.2.18.min.js"></script>

    <script src="scripts/moment.js"></script>

    <script src="scripts/persistence.js"></script>
    <script src="scripts/social.js"></script>
    <script src="scripts/ui.js"></script>
    <script src="scripts/game.js"></script>
    <script src="scripts/core.js"></script>

    <!--[if IE]><script src="scripts/excanvas.js"></script><![endif]-->
  </head>

  <body>
    <div id="fb-root"></div>

    <header>
      <div class="container">
        <img class="logo" src="images/logo.png" />
        <button class="image share"></button>
      </div>
    </header>

    <section id="home" class="hidden">
      <div class="panel left">
        <div id="welcome">
          <h1>Welcome <span class="first_name">...</span></h1>
          <img class="profile" src="images/profile.png" />
          <ul class="stats">
            <li>Coins <span class="me coins">...</span></li>
            <li>Bombs <span class="me bombs">...</span></li>
          </ul>
        </div>
        <div id="menu">
          <button class="image play"></button>
          <button class="image challenge"></button>
          <button class="image leaderboard"></button>
          <button class="image gifting"></button>
        </div>
      </div>
      <div class="panel right hidden" id="leaderboard">
        <div class="nofriends">
          <p>Friend Smash! is better with friends! Click here to see your friends' scores</p>
          <button class"friendPermissions">Grant user_friends</button>
        </div>
        <div class="friends">
          <h1>Leaderboard</h1>
          <ul class="scrollable_list leaderboard">
            <li class="loading">Loading...</li>
            <li class="template">
              <img src="images/profile.png" class="profile small" />
              <div class="namecontainer">
                <span class="rank">1</span>. <span class="name">Ali</span>
              </div>
              <div class="scorecontainer">
                Score <span class="score">99</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="panel right hidden friends" id="friendselector">
        <div class="nofriends">
          <p>Friend Smash! is better with friends! Click here to see a list of friends to challenge.</p>
          <button class"friendPermissions">Grant user_friends</button>
        </div>
        <div class="friends">
          <h1>Challenge friends</h1>
          <div class="tabs">
            <button class="friends">Request</button>
            <button class="invitable_friends">Invite</button>
          </div>
          <ul class="scrollable_list friendselector friends">
            <li class="loading">Loading...</li>
            <li class="template">
              <img src="images/profile.png" class="profile small" />
              <span class="name">...</span>
            </li>
          </ul>
          <ul class="scrollable_list friendselector invitable_friends">
            <li class="loading">Loading...</li>
            <li class="template">
              <img src="images/profile.png" class="profile small" />
              <span class="name">...</span>
            </li>
          </ul>
          <div class="buttons">
            <button class="image challenge send" disabled="disabled"></button>
          </div>
        </div>
      </div>
    </section>

    <section id="stage" class="hidden">
      <div id="gameboard">
        <canvas id="canvas"></canvas>
      </div>
      <div id="gamestats">
        <div class="message">
          <img class="profile" src="images/profile.png" />
          <p>Smash <span class="name">...</span></p>
        </div>
        <div class="score">
          <p>Score <span class="score_value">...</span></p>
        </div>
        <div class="bombs"></div>
        <div class="lives"></div>
      </div>
    </section>

    <section id="gameover" class="hidden">
      <h1>Game Over!</h1>
      <img src="images/profile.png" class="profile" />
      <div class="stats">
        <p>You smashed <span class="name">...</span> <span class="score">...</span> times and collected <span class="coins">...</span> <span class="coins_plurality">coins</span>!</p>
      </div>
      <div class="buttons">
        <button class="image challenge"></button>
      </div>
      <div class="share_composer">
        <textarea placeholder="Say something about your game"></textarea>
        <div class="buttons">
          <button class="image close"></button>
          <button class="image share_action"></button>
        </div>
      </div>
    </section>

    <footer>
      <div class="container">
        <p><a href="https://www.facebook.com/appcenter/friendsmashsample">View Friend Smash! on App Center</a></p>
      </div>
    </footer>

  </body>
</html>
