# Friend Smash sample Facebook app

## Authors

* Wayne Lu (waynelu)
* Connor Treacy (connortreacy)
* Jakub Pudełek (skoggkatt)
* Ali Parr (aliparr)
* Marco Alvarez (marcoa)

## Overview
To help better understand different products and services available to game developers, Facebook maintains a sample game called Friend Smash!

The game is implemented on different platforms:

* Web using [Facebook SDK for Javascript](https://developers.facebook.com/docs/javascript)
* Mobile using Facebook's native SDKs for [iOS](https://developers.facebook.com/docs/ios) and [Android](https://developers.facebook.com/docs/android)
* It is also available as a Unity cross platform build using the [Facebook SDK for Unity](https://developers.facebook.com/docs/unity).

There are minor differences between the four implementations, but overall the goal and structure of all is similar. This is the Web version of the game.

## What is “Friend Smash!”?
Friend Smash is a simple game which utilizes Facebook platform to enhance the gameplay by making it more fun and social. It uses variety of products and services, such as [Facebook Login](https://developers.facebook.com/docs/facebook-login), [Graph API](https://developers.facebook.com/docs/graph-api), [Game Requests](https://developers.facebook.com/docs/games/requests/) and [Sharing](https://developers.facebook.com/docs/games/sharing). The code examples serve as a guide of how they may be used in a games context. It also serves as an implementation guide - parts of source code relevant to Facebook integration are clearly separated from the pure gaming-logic and clearly documented with in code comments.

Please note that Friend Smash! was not designed as an example of how to design or code a game. The focus is on Facebook integration - other parts of the project may not be as clear and well designed and documented.

Friends Smash! is a game in which players are tasked with "smashing" (mouse-clicking or screen-tapping) pictures of a specific person while avoiding smashing pictures of anyone else. Player gets points for each correct picture smashed. Each miss or wrong smash causes the player to lose a heart. After losing 3 lives, the game is over. Player can also smash images of coins to collect them and later redeem these coins to buy bombs. In turn, bombs can be used in game to smash all correct pictures on the screen, helping to achieve a higher score. Additionally, the web version of the game allows players to purchase coins with Facebook Payments.

## Facebook integration
To make the experience more fun and social, players are asked to log in with Facebook and grant [user_friends](https://developers.facebook.com/docs/facebook-login/permissions/#reference-user_friends) permission. When granted, the game will have access to subset of player's friends data, specifically those who also logged in to Friend Smash! and granted user_friends permission. This means the game will use the profile picture of randomly selected friend as the picture the player is asked to smash. If user_friends permission hasn’t been granted or the player doesn't have friends who also logged in to Friend Smash! and granted user_friends permission, a picture of randomly selected celebrity is used instead.

At different points in the game player has an opportunity to share to Facebook. For example after the game is over, player can brag about the score achieved by posting a custom [Open Graph story](https://developers.facebook.com/docs/games/opengraph). The game also shows how to ask for [publish_actions](https://developers.facebook.com/docs/facebook-login/permissions/#reference-publish_actions) permission (which is required for API based sharing) and how to handle the case when publish_actions permission is not granted. If publish_actions permission is granted - the game uses [Scores API](https://developers.facebook.com/docs/games/scores) to publish and store the top score achieved by the player.

[Game Requests](https://developers.facebook.com/docs/games/requests/) are used in the game for two main purposes. First to let the player invite their friends who are not playing the game to try it. Second, to send a challenge to a friend who is already playing to bring them back to the game.
Additionally on the web version, the game uses [Facebook Payments](https://developers.facebook.com/docs/payments) to allow players to purchase in-game currency and [In-Game Gifting](https://developers.facebook.com/docs/payments/ingamegifting) to allow purchasing gifts for players’ friends. The web example also includes reference implementation of a payments server handling static pricing and payments verification.

Friend Smash! also logs [App Events](https://developers.facebook.com/docs/app-events), which enables Facebook [Analytics for Apps](https://developers.facebook.com/docs/analytics) - a free tool allowing developers to learn how people use their app across all platforms and devices, get insights about the people using the app, and improve marketing.

## How to use “Friend Smash!”?
All versions of Friend Smash! are available as part of [Facebook Platform Samples](https://github.com/fbsamples) on github:
[Web](https://github.com/fbsamples/web-friend-smash), [Android](https://github.com/fbsamples/android-friend-smash), [iOS](https://github.com/fbsamples/ios-friend-smash), [Unity](https://github.com/fbsamples/friendsmash-unity).

The recommended way to explore the projects is to begin with how Facebook products are integrated. To make it easier code responsible for Facebook integration is separated and well documented with in code comments for all versions. You can find it here for different versions: Web, Android, iOS, Unity. The reference implementation of a payments server is included in the Web repository.

To play Friend Smash! on Web, simply go to [apps.facebook.com/friendsmashsample](http://apps.facebook.com/friendsmashsample). To play it on mobile, download the Android, iOS or Unity project and build it from source and try on your device.

Please note it is likely that unless you have friends who also installed Friend Smash! you will not see any of your friends in the game. If this is the case, you can invite some of your friends to play Friend Smash! to fully explore how social integration works in Friend Smash!

## Installing
In order to run the sample, you need the following:
* A Web Server that supports HTTP POST
* A public URL for your game
* Parse account to persist your data
* Your favorite browser
* Update your server, app and parse configuration in config.php, core.js and persistence.js.

## Additional Resources
* Facebook SDK for Javascript [documentation](https://developers.facebook.com/docs/javascript/quickstart/)
* Facebook SDK for PHP [documentation](https://developers.facebook.com/docs/reference/php/)

## Contributing
All contributors must agree to and sign the [Facebook CLA](https://developers.facebook.com/opensource/cla) prior to submitting Pull Requests. We cannot accept Pull Requests until this document is signed and submitted.
