
var authorizeLogin = function (request, credentials) {
    var scope = 'user-read-playback-state';

    var queryStringObject = {
        response_type: 'code',
        client_id: credentials.client_id,
        scope: scope,
        redirect_uri: credentials.redirect_uri
    };

    var authOptions = {
        url: 'https://accounts.spotify.com/authorize',
        qs: queryStringObject
    };

    request(authOptions, function (error, response, body) {
        if (error) {
            console.log(error)
        }
    });

};

var getTokens = function (request, code, credentials, callback) {

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: credentials.redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(credentials.client_id + ':' + credentials.client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token,
                refresh_token = body.refresh_token;
            console.log("Tokens retrieved successfully");
            credentials.access_token = access_token;
            credentials.refresh_token = refresh_token;
            callback();
        } else {
            callback(error)
        }
    });

};

var getNewToken = function (request, credentials, callback) {

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(credentials.client_id + ':' + credentials.client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: credentials.refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            var refresh_token = body.refresh_token;

            console.log("Refresh Token retrieved successfully");
            credentials.access_token = access_token;
            credentials.refresh_token = refresh_token;
            callback();
        }
    });
};

module.exports = {
    getTokens: getTokens,
    getNewToken: getNewToken
};