// -------- IMPORTING FILE SYSTEM
var fs = require("fs");

// --------IMPORTING DOTENV
require('dotenv').config()

// --------CONNECTION WITH keys.js
var keys = require("./keys.js");

// --------IMPORTING REQUEST FROM NPM
var request = require("request");

// --------IMPORTING MOMENT FROM NPM
var moment = require('moment')

// --------IMPORTING SPOTIFY
var Spotify = require('node-spotify-api');

// --------- APPEND INTO TEXT FILE
var text = "";

// --------CLI INPUT
var action = process.argv[2];

var nodeArgs = process.argv;
var item = "";

// ---------LOOP THROUGH ALL THE NODE ARGUMENTS
// ---------AND DO A LITTLE FOR LOOP MAGIC TO INCLUDE + SIGN
for (var i = 3; i < nodeArgs.length; i++) {
    if (i > 3 && i < nodeArgs.length) {
        item = item + "+" + nodeArgs[i];
    }
    else {
        item += nodeArgs[i];
    }
};

var queryUrl2 = "http://www.omdbapi.com/?t=" + item + "&y=&plot=short&apikey=trilogy";
var queryUrl = "https://rest.bandsintown.com/artists/" + item + "/events?app_id=codingbootcamp"

// -------- DEFINING FUNCTIONS!
// -------BANDS IN TOWN API FUNCTION

function concert() {

    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            content = JSON.parse(body);
            content.forEach(element => {
            
                text = "\n==================================================================="
                    + "\nBands/Artists: " + element.lineup + "\nName of the venue: " + element.venue.name
                    + "\nVenue location: " + element.venue.city + ", " + element.venue.country
                    + "\nDate of Event: " + moment(element.datetime).format("MM/DD/YYYY")
                    + "\n===================================================================";

                console.log(text);

                fs.appendFile("log.txt", text, function (err) {
                    if (err) { console.log(err); }
                    else { console.log("Content Added!"); }
                });

            });
        }
    });
};

// -------OMDB API FUNCTION

function movie() {
    request(queryUrl2, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var content = JSON.parse(body);
            var ratingsIndex = content.Ratings.findIndex(x => x.Source == "Rotten Tomatoes");
            var rottenTomato = "";

            if (ratingsIndex > -1) {
                rottenTomato = content.Ratings[ratingsIndex].Value;
            } else {
                rottenTomato = "N/A"
            }

            text = "\n==================================================================="
                + "\n" + content.Title
                + "\n\nYear of release: " + content.Year
                + "\nIMDB Rating: " + content.imdbRating
                + "\nRotten Tomatoes Rating: " + rottenTomato
                + "\nCountry: " + content.Country
                + "\nLanguage: " + content.Language
                + "\nPlot: " + content.Plot
                + "\nActors: " + content.Actors
                + "\n===================================================================";

            console.log(text);

            fs.appendFile("log.txt", text, function (err) {
                if (err) { console.log(err); }
                else { console.log("Content Added!"); }
            });
        }
    });
}

// --------SPOTIFY API FUNCTION

function spot(limit) {
    var spotify = new Spotify({
        id: keys.spotify.id,
        secret: keys.spotify.secret
    });

    spotify
        .search({ type: 'track', query: item, limit: limit }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            // var body = JSON.stringify(data);
            // console.log(body);
            var content = data.tracks.items;

            content.forEach(element => {

                text = "\n==================================================================="
                    + "\nArtist: " + element.artists[0].name
                    + "\nSong Name: " + element.name
                    + "\nSpotify Link: " + element.external_urls.spotify
                    + "\nAlbum Name: " + element.album.name
                    + "\n===================================================================";

                console.log(text);

                fs.appendFile("log.txt", text, function (err) {
                    if (err) { console.log(err); }
                    else { console.log("Content Added!"); }
                });

            })
        });
}



// --------BANDS IN TOWN API CALL 

if (action === "concert-this") {
    concert();
}

// --------OMDB API 

else if (action === "movie-this") {
    if (item != "") {
        movie();
    } else {

        // DEFAULT MOVIE

        item = "Mr. Nobody"
        queryUrl2 = "http://www.omdbapi.com/?t=" + item + "&y=&plot=short&apikey=trilogy"
        movie();
    }
}

// --------SPOTIFY API 

else if (action === "spotify-this-song") {

    if (item != "") {
        spot(3);
    } else {

        // DEFAULT SONG
        item = "The Sign"

        var spotify = new Spotify({
            id: keys.spotify.id,
            secret: keys.spotify.secret
        });

        spotify
            .search({ type: 'track', query: item, limit: 20 }, function (err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }

                var content = data.tracks.items;

                content.forEach(element => {

                    if (element.artists[0].name === "Ace of Base") {

                        text = "\n==================================================================="
                            + "\nArtist: " + element.artists[0].name
                            + "\nSong Name: " + element.name
                            + "\nSpotify Link: " + element.external_urls.spotify
                            + "\nAlbum Name: " + element.album.name
                            + "\n===================================================================";

                        console.log(text);

                        fs.appendFile("log.txt", text, function (err) {
                            if (err) { console.log(err); }
                            else { console.log("Content Added!"); }
                        });
                    }
                })
            });
    }
}

// --------READ FROM RANDOM.txt

else if (action === "do-what-it-says") {

    var randomAction = "";

    fs.readFile("random.txt", "utf8", function (error, data) {

        if (error) {
            return console.log(error);
        }
        // console.log(data);
        var dataArr = data.split(",");
        // console.log(dataArr);
        item = dataArr[1];

        randomAction = dataArr[0]

        if (randomAction === "concert-this") {

            queryUrl = "https://rest.bandsintown.com/artists/" + item + "/events?app_id=codingbootcamp"

            concert();
        }
        else if (randomAction === "movie-this") {
            queryUrl2 = "http://www.omdbapi.com/?t=" + item + "&y=&plot=short&apikey=trilogy";

            movie();
        }
        else if (randomAction === "spotify-this-song") {
            spot(1);
        }
    });

}
else {
    text = "\n---INVALID ACTION!! TRY AGAIN---";
    console.log(text);
    fs.appendFile("log.txt", text, function (err) {
        if (err) { console.log(err); }
        else { console.log("Content Added!"); }
    });
}
