var parseAppID = 'N1lOGVWXpikgvPFJxkfkd4kRTvaPNuOWe83zRoRx';
var parseJSKey = 'nwIChKspaBSV0dFwQlKinrVD3XFXIRScCZiE1lIi';

function parseLogin(authResponse) {
  return Parse.FacebookUtils.logIn({
    id: authResponse.userID,
    access_token: authResponse.accessToken,
    expiration_date: moment().add('s', authResponse.expiresIn).format()
  });
}

function saveParseUser(coins, bombs) {
  Parse.User.current().increment('coins', coins);
  Parse.User.current().increment('bombs', -1 * bombs);
  return Parse.User.current().save();
}