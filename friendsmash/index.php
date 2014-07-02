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

    <script src="scripts/core.js"></script>
    <script src="scripts/ui.js"></script>
    <script src="scripts/game.js"></script>

    <!--[if IE]><script src="scripts/excanvas.js"></script><![endif]-->
  </head>

  <body>
    <div id="fb-root"></div>

    <header>
      <div class="container">
        <img class="logo" src="images/logo.png" />
      </div>
    </header>

    <section id="home" class="hidden">
      <div class="panel left">
        <div id="welcome">
          <h1>Welcome <span class="first_name">Player</span></h1>
          <img class="profile" src="images/profile.png" />
        </div>
        <div id="menu">
          <button class="image play"></button>
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
        <button class="image close"></button>
      </div>
    </section>

    <footer>
      <div class="container">
        <p><a href="https://www.facebook.com/appcenter/friendsmashsample">View Friend Smash! on App Center</a></p>
      </div>
    </footer>

  </body>
</html>
