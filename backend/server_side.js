var express = require('express');
var app = express();

var gameInfo = {}; // an empty JS object, later it's going to store the code for each end-user

var port = 3000; //the port we will be running our server on

app.post('/post', (req, res) => {
    //print info to console
    console.log(JSON.parse(req.query['data']));

    //populate a header response
    res.header("Access-Control-Allow-Origin", "*");
    var queryInfo = JSON.parse(req.query['data']);

    switch(queryInfo['action']){
        case 'generateGame':
            generateGame(queryInfo['cards'], queryInfo['difficulty']);
            var gameJson = JSON.stringify({ 
                'action': 'generateGame',
                'msg': 'New game generated!!!' 
            });            
            res.send(gameJson);
            break;
        default:
            res.send(JSON.stringify({ 'msg': 'error!!!' }));
            break;
    }
}).listen(port);
console.log("Server is running!");

//if difficulty = 1, make card types = 1/4 of card count
//if difficulty = 2, make card types = 1/3 of card count
//if difficulty = 3, make card types = 1/2 of card count
function generateGame(cardCount, difficulty){
    var nums = new Array();
    var cards = new Array();
    for( let i = 1 ; i <= cardCount ; i++ ){
         nums[i] = i ; 
    }

    //Fisher-Yates Algorithm (for lottery randomization) ref. https://stackoverflow.com/questions/31899645/lottery-in-javascript-sort-algorithm
    for (let i = cardCount ; i >= 1 ; i--) {
        let rand = Math.floor(Math.random() * i) + 1;
        nums[0] = nums[i];
        nums[i] = nums[rand];
        nums[rand] = nums[0];
    }
    nums[0] = 0;
    cards[0] = 0;

    var cardTypes = Math.floor(cardCount / (5 - difficulty));
    var minimumPairs = Math.floor(cardCount/(2*cardTypes));
    var extraPairs = (cardCount-2*minimumPairs*cardTypes)/2;

    //from shuffled numbers, derive card types and propagate to cards array.
    for (let j = 1; j <= cardCount; j++){
        var endOfExtraPair = cardCount - 2*extraPairs;
        if (nums[j] > endOfExtraPair){
            cards[j] = Math.ceil((nums[j] - endOfExtraPair)/(2*minimumPairs));
        } 
        else{
            cards[j] = Math.ceil(nums[j]/(2*minimumPairs));
        }
    }
    
    //display all information to console for this run
    console.log("There will be " + cardTypes + " card types. ");
    console.log("Every card type has a minimum of " + minimumPairs + " pair/s");
    console.log("There are " + extraPairs + " extra pair/s");
    console.log(...nums);
    console.log(...cards);
    gameInfo[cards] = cards;    
}