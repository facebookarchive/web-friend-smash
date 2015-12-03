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
Friend Smash stores all inventory data (for coins and bombs) on the browser.
If you played on one device and then moved to another, your bombs and coins
would not be available there. If you had to reinstall the game because you
moved to a new computer, you wouldn't be able to pull in the bombs and coins
from your existing game.

Games released on multiple devices and platforms usually share some data to
provide a consistent experience between the different places people play.
It may be the player's inventory or progress in a game. The solution to
sharing this data is to store the data in the cloud where any device can
access it.

Parse is one of the many web services providing data persistence and cloud
storage. In this javascript, we are using Parse to take care of storing user
accounts and data for each player in the cloud. We will provide a brief overview
of these features and recommend reading more about other Parse products. Keep in
mind that Parse has help in case you run into any issues.

You may register at Parse.com to get an application ID and Javascript key:
*/
var parseAppID = 'N1lOGVWXpikgvPFJxkfkd4kRTvaPNuOWe83zRoRx';
var parseJSKey = 'nwIChKspaBSV0dFwQlKinrVD3XFXIRScCZiE1lIi';

/*
Parse has a specialized user class called Parse.User that automatically handles
much of the functionality required for user account management.

The Parse.FacebookUtils class has a logIn method which takes the Facebook user
ID along with information about the Facebook session.
*/
function parseLogin(authResponse) {
  return Parse.FacebookUtils.logIn({
    id: authResponse.userID,
    access_token: authResponse.accessToken,
    expiration_date: moment().add(authResponse.expiresIn, 's').format()
  }).then(function(user) {
    if( user.existed() ) {
      return userWithFBIDCheck(authResponse.userID);
    } else {
      return setDefaultUserValues();
    }
  }, function(error) {
    return Parse.Promise.error(error);
  });
}

/*
Check link between FB ID and Parse user.
*/
function userWithFBIDCheck(userID) {
  console.log('Existing Parse User, checking for FBID');
  if( Parse.User.current().get('fbid') ) {
    // FBID was added before, all is well
    return Parse.Promise.as(Parse.User.current());
  } else {
    return Parse.User.current().save('fbid', userID);
  }
}

/*
Create new Parse user with default values.
*/
function setDefaultUserValues() {
  console.log('New Parse User, setting defaults', defaults);
  Parse.User.current().set('coins', defaults.coins);
  Parse.User.current().set('bombs', defaults.bombs);
  Parse.User.current().set('fbid', friendCache.me.id);
  return Parse.User.current().save();
}

/*
Save player details into Parse.
*/
function saveParseUser(coins, bombs) {
  Parse.User.current().increment('coins', coins);
  Parse.User.current().increment('bombs', -1 * bombs);
  return Parse.User.current().save();
}

/*
Fetch and refresh player details from Parse.
*/
function refreshParseUser() {
  return Parse.User.current().fetch();
}
