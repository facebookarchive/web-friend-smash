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
As Friend Smash is a social game that you play with friends, we need a way for
players to invite their friends to play.

With Requests, we can build a gameplay loop that allows players to challenge
their friends to beat high scores, as well as sending invites to friends who
aren't yet playing the game.
*/
function sendChallenge(to, message, callback, turn) {
  var options = {
    method: 'apprequests'
  };
  if(to) options.to = to;
  if(message) options.message = message;
  if(turn) options.action_type = 'turn';
  FB.ui(options, function(response) {
    if(callback) callback(response);
  });
}

/*
Retrieve challenge request.

Player has launched game upon receiving and accepting a challenge request. Try
to retrieve more information on the challenge.
*/
function getRequestInfo(id, callback) {
  FB.api(String(id), {fields: 'from{id,name,picture}' }, function(response){
    if( response.error ) {
      console.error('getRequestSenderInfo', response.error);
      return;
    }
    if(callback) callback(response);
  });
}

/*
Remove challenge request.

After accepting a challenge from friend, the request should be deleted.
*/
function deleteRequest(id, callback) {
  FB.api(String(id), 'delete', function(response){
    if( response.error ) {
      console.error('deleteRequest', response.error);
      return;
    }
    if(callback) callback(response);
  });
}
