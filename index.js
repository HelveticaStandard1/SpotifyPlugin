var open = require('opn');
var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var spotifyPlayback = require('./server/spotifyPlayback');
var spotifyAuth = require('./server/spotifyAuth');
var intervals = {};
var config = require('./server/config');

/**
 * Global permissions
 */
var spotifyAuthCredentials = require('./server/spotifyAuthCredentials');

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


var app = express();

app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser());

app.get('/login', function (req, res) {

    var scope = 'user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: spotifyAuthCredentials.client_id,
            scope: scope,
            redirect_uri: spotifyAuthCredentials.redirect_uri
        }));
});

var resetToken = function () {
    clearInterval(intervals.refreshTokenInterval);
    clearInterval(intervals.retrieveTrackInfoInterval);
    tokenCallback();
};

var handleError = function (err, data) {

};

var retrieveTrackInfo = function () {
    spotifyPlayback.monitorPlayback(request, spotifyAuthCredentials, handleError);
};

var refreshToken = function () {
    spotifyAuth.getNewToken(request, spotifyAuthCredentials, resetToken);
};

var tokenCallback = function () {
    intervals.refreshTokenInterval = setInterval(retrieveTrackInfo, 1000);
    intervals.retrieveTrackInfoInterval = setInterval(refreshToken, 600000);
};

app.get('/callback', function (req, res) {

    res.write('<script>window.close()</script>');
    var code = req.query.code || null;
    spotifyAuth.getTokens(request, code, spotifyAuthCredentials, tokenCallback);

});

console.log("You're tracks are being updated at: " + config.fileLocation);
app.listen(8888);

open('http:localhost:8888/login');
