"use strict";

const express = require('express'),
      oauth = require('oauth'),
      http = require('http'),
      config = require('./config.js'),
      app = express();

app.set('port', process.env.PORT || 3030);

const tumblrConsumerKey = config.key['consumerKey'],
      tumblrConsumerSecret = config.key['consumerSecret'];
let tumblrOauthAccessToken = undefined,
    tumblrOauthAccessTokenSecret = undefined,
    oauthRequestToken,
    oauthRequestTokenSecret;

// OAuth object
let consumer = new oauth.OAuth(
    "https://www.tumblr.com/oauth/request_token",
    "https://www.tumblr.com/oauth/access_token",
    tumblrConsumerKey,
    tumblrConsumerSecret,
    "1.0A",
    "http://localhost:3030/auth/callback",
    "HMAC-SHA1"
)

// create request token
app.get('/', (req, res) => {
    consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
        if (error) {
            res.status(500).send("Error getting OAuth request token: " + error);
        } else {
            oauthRequestToken = oauthToken;
            oauthRequestTokenSecret = oauthTokenSecret;

            res.redirect("https://www.tumblr.com/oauth/authorize?oauth_token=" + oauthRequestToken);
        }
    });
});

// get access token
app.get('/auth/callback', (req, res) => {
    consumer.getOAuthAccessToken(oauthRequestToken, oauthRequestTokenSecret, req.query.oauth_verifier, (error, _oauthAccessToken, _oauthAccessTokenSecret) => {
        if (error) {
            res.status(500).send("Error create access token: " + error);
        } else {
            tumblrOauthAccessToken = _oauthAccessToken;
            tumblrOauthAccessTokenSecret = _oauthAccessTokenSecret;
            res.status(200).send('Access Token:' + tumblrOauthAccessToken +'<br/>Access Token Secret:'+tumblrOauthAccessTokenSecret);
        }
    });
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
})
