/**
* Copyright 2013 Facebook, Inc.
*
* You are hereby granted a non-exclusive, worldwide, royalty-free license to
* use, copy, modify, and distribute this software in source code or binary
* form for use in connection with the web services and APIs provided by
* Facebook.
*
* As with any software that integrates with the Facebook platform, your use
* of this software is subject to the Facebook Developer Principles and
* Policies [http://developers.facebook.com/policy/]. This copyright notice
* shall be included in all copies or substantial portions of the software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

var gContext;
var gCanvasElement;
var gSpawnTimer;
var gTickSpeed;
var gEntities = Array();
var gDoingGameover;
var gGameOverEntity;
var gTickGameInterval;
var gExplosionParticles = Array();
var gExplosionTimerLength = 100;
var gExplosionTimer;

var gGameOverCallback;
var gUpdateUICallback;

var gCanvasWidth;
var gCanvasHeight
var gCanvasOffsetX;
var gCanvasOffsetY;

var TO_RADIANS = Math.PI/180;

var gPlayer;
var gChallenger;
var gGameState;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

//Starts the game so the user can start playing
function initGame(player, challenger, canvas, updateUICallback, gameOverCallback) {

  gGameState = {
    bombsAvailable: 3,
    bombsUsed: 0,
    lives: 3,
    coinsCollected: 0,
    score: 0
  };

  gUpdateUICallback = updateUICallback;
  gGameOverCallback = gameOverCallback;

  gTickSpeed = (1.0 / 15.0);

  gPlayer = player;
  gChallenger = challenger;

  gGameState.bombsAvailable = Math.min(gGameState.bombsAvailable, player.bombs);

  gCanvasElement = canvas[0];

  gContext = gCanvasElement.getContext('2d');

  gCanvasWidth = $(canvas).width();
  gCanvasHeight = $(canvas).height();

  gCanvasOffsetX = $(canvas).offset().left;
  gCanvasOffsetY = $(canvas).offset().top;

  gContext.canvas.width = gCanvasWidth;
  gContext.canvas.height = gCanvasHeight;

  // Bind our keyboard bomb handler
  $(document).keypress(function(e){
    if (e.which == 98 || e.which == 66) {
      dropTheBomb();
    }
  });

  gUpdateUICallback(gGameState);

  gSpawnTimer = 0.7;
  gDoingGameover = false;
  gGameOverEntity = null;

  //Start the loop to draw the game to the screen
  gTickGameInterval = setInterval(tick, 15);
}

function onGameCanvasMousedown(e) {

  e.stopPropagation();
  
  e = e || window.event;
  
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft +
     document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop +
     document.documentElement.scrollTop;
  }
  x -= $(this).offset().left;
  y -= $(this).offset().top;

  // Did we click on an image?
  var clickScore = 0;

  for (var i=0; i<gEntities.length; i++) {
    if (gEntities[i].isPointInside(x, y, 30)) {
      if (gEntities[i].isFriend) {
        gEntities.remove(i);
        clickScore++; 
        i--;
      } else if(gEntities[i].isCoin) {
        gEntities.remove(i);
        gGameState.coinsCollected++; 
        for (var p=0; p<3; ++p) {
        var newParticle = new Particle();
          newParticle.init(true);
          newParticle.spawn(x, y);
          gExplosionParticles.push(newParticle);
        }
        i--;
      } else {
        gGameOverEntity = gEntities[i];
        gDoingGameover = true;
        return;
      }
    }
  }

  if (clickScore > 0) {
    if (clickScore >= 3) {
      sendAchievement(kAchievements.kACHIEVEMENT_SCOREx3);
    }

    if (clickScore > 1) {
      for (var p=0; p<30; ++p) {
        var newParticle = new Particle;
        newParticle.init();
        newParticle.spawn(x, y);
        gExplosionParticles.push(newParticle);
      }
    } else if (clickScore > 0) {
      for (var p=0; p<3; ++p) {
        var newParticle = new Particle;
        newParticle.init();
        newParticle.spawn(x, y);
        gExplosionParticles.push(newParticle);
      }
    }

    var oldScore = gGameState.score;
    gGameState.score += (clickScore * clickScore);

    if (oldScore < 50 && gGameState.score >= 50) {
      sendAchievement(kAchievements.kACHIEVEMENT_SCORE50);
    } else if (oldScore < 100 && gGameState.score >= 100) {
      sendAchievement(kAchievements.kACHIEVEMENT_SCORE100);
    } else if (oldScore < 150 && gGameState.score >= 150) {
      sendAchievement(kAchievements.kACHIEVEMENT_SCORE150);
    } else if (oldScore < 200 && gGameState.score >= 200) {
      sendAchievement(kAchievements.kACHIEVEMENT_SCORE200);
    }

    // Frenzy?
    if (!(gGameState.score % 10)) {
      for (var i=0; i<Math.floor((gGameState.score/20)); ++i) {
        spawnEntity(true);
      }
    }
    gUpdateUICallback(gGameState);
  }
}

//Main game loop, which is executed on a fast loop so we can animate
function tick() {

  //First, clear the canvas in preparation for the next draw
  gContext.clearRect(0, 0, gCanvasWidth, gCanvasHeight);
  
  if (!gDoingGameover) {
    gSpawnTimer -= gTickSpeed;
                
    if (gSpawnTimer < 0) {
        spawnEntity(false);
        gSpawnTimer = 2.8;
    }

    for (var i=0; i<gEntities.length; i++) {
      gEntities[i].tick();
      gEntities[i].draw();
    }

    for (var i=0; i<gEntities.length; i++) {

      if( gEntities[i].positionY > gCanvasHeight + 30
        || gEntities[i].positionX < -30
        || gEntities[i].positionX > gCanvasWidth + 30 ) {
        if( gEntities[i].isFriend ) {
          gGameState.lives--;
          gUpdateUICallback(gGameState);
          if (gGameState.lives <= 0) {
            gContext.clearRect(0, 0, gCanvasWidth, gCanvasHeight);
            endGame();
          }
        }
        gEntities.remove(i);
      }
    } 
    // Particles      
    gContext.globalCompositeOperation = "lighter";

    for (var i=0; i<gExplosionParticles.length; i++) {
      gExplosionParticles[i].tick();
      gExplosionParticles[i].draw();
    }
    for (var i=0; i<gExplosionParticles.length; i++) {
      if (gExplosionParticles[i].positionY > (gCanvasHeight + 10)) {
        gExplosionParticles.remove(i);
      }
    }

    // Bomb
    if (gExplosionTimer > 0) {
      gContext.fillStyle = "rgba(255, 180, 148, " + gExplosionTimer/gExplosionTimerLength + " )";
      gContext.fillRect (0, 0, gCanvasWidth, gCanvasHeight);
      gExplosionTimer--;
    }
 
    gContext.globalCompositeOperation = "source-over";
  } else {
    if (gGameOverEntity.explode()) {
      endGame();
    }
  }
}

function dropTheBomb(event) {
  if (!gDoingGameover) {
    if (gGameState.bombsAvailable > 0) {

      var particlesToSpawn = 100;
      var sideMargin = 40;

      gExplosionTimer = gExplosionTimerLength;
      
      for (var p=0; p<particlesToSpawn; ++p) {
        var newParticle = new Particle;
        newParticle.init();
        newParticle.spawn(getRandom(sideMargin, gCanvasWidth - sideMargin), 0);
        gExplosionParticles.push(newParticle);
      }    

      for (var i=0; i<gEntities.length; i++) {
        // Detect a fail
        if (gEntities[i].isFriend) {
          gGameState.score++;
        }
        
        if (gEntities[i].isCoin) {
          gGameState.coinsCollected++;
        }
      }

      gEntities.length = 0;

      gGameState.bombsAvailable--;
      gGameState.bombsUsed++;

      gUpdateUICallback(gGameState);
    }
  }
}
 
function spawnEntity(forceFriendsOnly) {
  var entityType = forceFriendsOnly ? 0 : getRandom(0, 1);
  var newEntity = new Entity();
  
  if (entityType < 0.6) {
     newEntity.init(gChallenger.picture, true);
  } else if(entityType < 0.7 ) {
    newEntity.init('images/coin64.png', false);
    newEntity.isCoin = true;
  } else {
    var nCelebToSpawn = Math.floor(getRandom(0, 10));
    // Don't spawn an enemy that matches the celeb being smashed
    while ( gChallenger.id == null && celebs[nCelebToSpawn].picture == gChallenger.picture) {
      nCelebToSpawn = Math.floor(getRandom(0, 10));
    }
    newEntity.init(celebs[nCelebToSpawn].picture, false);       
  }
  newEntity.spawn();
  gEntities.push(newEntity);
}


function endGame() {
  clearInterval(gTickGameInterval);
  $(document).unbind("keypress");

  gEntities.length = 0;
  gExplosionParticles.length = 0;
  
  var welcomeSubMsg = document.getElementById('welcome_submsg');
  if (welcomeSubMsg) {
    welcomeSubMsg.innerHTML = 'You scored ' + gGameState.score + ' !';
  }

  gGameOverCallback(gGameState,gChallenger);
}

function getRandom(min, max) {
  var range = max-min;
  return Math.random() * range + min;
}

function Particle() {
  this.init = function(coin) {
    this.positionX = 0;
    this.positionY = 0;
    this.velocityX = 0;
    this.velocityY = 0;

    if( coin ) {
      this.colourFull = 'rgba(227,76,70,1)';
      this.colourEmpty = 'rgba(227,76,70,0)';
    } else {
      this.colourFull = 'rgba(241,223,204,1)';
      this.colourEmpty = 'rgba(241,223,204,0)';
    }

    //Random size
    this.radius = Math.random()*14+6;
  }

  this.spawn = function(x, y) {
    this.positionX = x;
    this.positionY = y;

    this.velocityX = (Math.random()-0.5) * 12;
    var sign = this.velocityX && this.velocityX / Math.abs(this.velocityX);
    this.velocityX += (sign * 2);

    this.velocityY = (Math.random()-0.5) * 12;
    sign = this.velocityY && this.velocityY / Math.abs(this.velocityY);
    this.velocityY += (sign * 2);
  }

  this.tick = function() {
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
    this.velocityY += 0.15;
  }

  this.draw = function() {
    gContext.beginPath();
    
    //Time for some colors
    var gradient = gContext.createRadialGradient(this.positionX, this.positionY, 0, this.positionX, this.positionY, this.radius);
    gradient.addColorStop(0, this.colourFull);
    gradient.addColorStop(1, this.colourEmpty);
    
    gContext.fillStyle = gradient;
    gContext.arc(this.positionX, this.positionY, this.radius, Math.PI*2, false);
    gContext.fill();
  }
}

function Entity() {
  this.init = function(src, isFriend) {
    this.positionX = 0;
    this.positionY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotationalVelocity = 0;
    this.rotationAngle = 0;
    this.isFriend = isFriend;
    this.image = new Image();
    this.image.src = src;
    this.isCoin = false;
  }

  this.spawn = function() {
    
    var sideMargin = 40;
    this.positionX = getRandom(-sideMargin, gCanvasWidth + sideMargin);
    this.positionY = gCanvasHeight + 30;

    this.rotationalVelocity = getRandom(-2, 2);

    var distanceToMiddle = getRandom((gCanvasWidth/2)-150, (gCanvasWidth/2)+150) - this.positionX;

    this.velocityX = distanceToMiddle * getRandom(0.019, 0.021);
    this.velocityY = getRandom(-12.5, -10);
  }

  this.tick = function() {
    this.scaleX = this.scaleY = this.isCoin ? 50 : 100;
    this.positionX += this.velocityX;
    this.positionY += this.velocityY;
    this.rotationAngle += this.rotationalVelocity;
    this.velocityY += 0.15;
  }

  this.draw = function() {
    // save the current co-ordinate system 
    // before we screw with it
    gContext.save(); 

    // move to the middle of where we want to draw our image
    gContext.translate(this.positionX, this.positionY);

    // rotate around that point, converting our 
    // angle from degrees to radians 
    gContext.rotate(this.rotationAngle * TO_RADIANS);

    // draw it up and to the left by half the width
    // and height of the image 
    gContext.drawImage(this.image, -(this.scaleX/2), -(this.scaleY/2), this.scaleX, this.scaleY);

    // and restore the co-ords to how they were when we began
    gContext.restore(); 
  }

  this.isPointInside = function(x, y, padding) {
    // Not going to take into account rotation here because lots of dot products will kill perf

    var tlx = this.positionX - (this.scaleX / 2) - padding;
    var tly = this.positionY - (this.scaleY / 2) - padding;

    var brx = this.positionX + (this.scaleX / 2) + padding;
    var bry = this.positionY + (this.scaleY / 2) + padding;

    if (x > tlx && x < brx && y > tly && y < bry) {
      return true;
    }

    return false;
  }

  this.explode = function() {
    if (this.scaleX < this.image.width * 30) {
      this.rotationAngle += this.rotationalVelocity;
      this.rotationalVelocity *= 1.05;
    
      this.scaleX *= 1.05;
      this.scaleY *= 1.05;

      var diffX = (gCanvasWidth/2) - this.positionX;
      var diffY = (gCanvasHeight/2) - this.positionY;

      this.positionX += diffX / 20;
      this.positionY += diffY / 20;

      this.draw();
      return false;
    } else {
      return true;
    }
  }
}