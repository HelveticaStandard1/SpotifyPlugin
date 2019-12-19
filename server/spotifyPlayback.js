var fs = require('fs'),
    config = require('./config');

var monitorPlayback = function (request, credentials, callback) {

    var options = {
        url: 'https://api.spotify.com/v1/me/player',
        headers: { 'Authorization': 'Bearer ' + credentials.access_token },
        json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
        if (error) {
            callback(error);
        }
        var artist = JSON.stringify(body.item.artists[0].name);
        var songName = JSON.stringify(body.item.name);
        var fileTotal = songName + " - " + artist;
        fs.readFile(config.fileLocation, 'utf8', function (err, data) {
            if (data !== fileTotal) {
                fs.writeFile(config.fileLocation, fileTotal, function (err) {
                    if (err) throw err;
                    console.log("File Updated: " + fileTotal);
                });
            }
        });
    });

};

module.exports = {
    monitorPlayback: monitorPlayback
};