var express = require('express');
var app = express();
var gameInfo = {}; // an empty JS object, later it's going to store the code for each end-user
var gameSettings = {};
var port = 3000; //the port we will be running our server on
var savedGames = new Array();

app.post('/post', (req, res) => {
    //print info to console
    console.log(JSON.parse(req.query['data']));

    //populate a header response
    res.header("Access-Control-Allow-Origin", "*");
    var queryInfo = JSON.parse(req.query['data']);

    switch(queryInfo['action']){
        case 'retrieveServerVariables':
            if(Object.keys(gameSettings).length === 0){
                systemStartVariables();
            }
            var gameJson = JSON.stringify({ 
                'action': 'retrieveServerVariables',
                'difficulty': gameSettings['difficulty'],
                'cardCount': gameSettings['cardCount'],
                'theme': gameSettings['theme'],
                'msg': 'Server up and running!!!' 
            });            
            res.send(gameJson);
            break;
        case 'applySettings':
            gameSettings['difficulty'] = queryInfo['difficulty'];
            gameSettings['cardCount'] = queryInfo['cardCount'];
            var gameJson = JSON.stringify({ 
                'action': 'applySettings',
                'difficulty': gameSettings['difficulty'],
                'cardCount': gameSettings['cardCount'],
                'theme': gameSettings['theme'],
                'msg': 'Settings changed successfully!' 
            });            
            res.send(gameJson);
            break;
        case 'generateGame':
            generateGame(queryInfo['cards'], queryInfo['difficulty']);
            var gameJson = JSON.stringify({ 
                'action': 'generateGame',
                'msg': 'New game generated!!!' 
            });            
            res.send(gameJson);
            break;
        case 'revealCard':
            let revelation = revealCard(queryInfo['cardNumber']);
            let concealTheCards = null;
            let timeSinceLastSuccess = queryInfo['pickTime'] - gameInfo['lastPickedTime'];
            if (queryInfo['pickNumber']){
                if (gameInfo['lastPicked'] === revelation){
                    gameInfo['cardsMatched']+=2;
                    gameInfo['streak']+=1;
                    concealTheCards = false;
                    gameInfo['lastPickedTime'] = queryInfo['pickTime'];
                }
                else{
                    gameInfo['streak']=0;
                    concealTheCards = true;
                }
                gameInfo['lastPicked'] = null;
            }
            else{
                gameInfo['lastPicked'] = revelation;
            }
            calculateScore(concealTheCards, timeSinceLastSuccess);
            var gameJson = JSON.stringify({ 
                'action': 'revealCard',
                'cardNumber': queryInfo['cardNumber'],
                'card': revelation,
                'concealTheCards': concealTheCards,
                'score': gameInfo['score'],
                'win': gameInfo['cardsMatched'] === gameInfo['cards'].length,
                'msg': 'Revealing card' 
            });
            console.log(gameJson);
            res.send(gameJson);
            break;
        case 'retrieveGameSummary':
            var gameJson = JSON.stringify({ 
                'action': 'retrieveGameSummary',
                'difficulty': gameInfo['difficulty'],
                'cardCount': gameInfo['cardCount'],
                'timeFinished': gameInfo['lastPickedTime'],
                'score': gameInfo['score'],
                'maximumStreak': gameInfo['streak'],
                'msg': 'Retrieving game summary' 
            });
            console.log(gameJson);
            res.send(gameJson);
            break;
        case 'submitToLeaderboard':            
            gameInfo['playerName'] = queryInfo['playerName'];
            var gameJson = JSON.stringify({ 
                'action': 'submitToLeaderboard',
                'msg': 'Leaderboard entry saved!' 
            });
            const saveGame = {
                'difficulty': gameInfo['difficulty'],
                'cardCount': gameInfo['cardCount'],
                'finishTime': gameInfo['lastPickedTime'],
                'score': gameInfo['score'],
                'name': gameInfo['playerName']
            };
            savedGames.push(saveGame);
            res.send(gameJson);
            break;
        case 'retrieveLeaderboards':
            var retrievedGames = savedGames.filter((savedGame) => (savedGame.difficulty == queryInfo['difficulty'] && savedGame.cardCount == queryInfo['cardCount']));
            console.log(retrievedGames);
            var gameJson = JSON.stringify({ 
                'action': 'retrieveLeaderboards',
                'msg': 'Retrieving leaderboard entries',
                'orderByTime': retrievedGames.sort((a, b) => a.finishTime - b.finishTime).slice(0, 5),
                'orderByPoints': retrievedGames.sort((a, b) => b.score - a.score).slice(0, 5)
            });
            res.send(gameJson);
            break;
        default:
            res.send(JSON.stringify({ 'msg': 'error!!!' }));
            break;
    }
}).listen(port);
console.log("Server is running!");

function revealCard(cardNumber){
    return gameInfo['cards'][cardNumber];
}

function calculateScore(concealCards, timeSinceLastSuccess){
    if(concealCards === null){
        return;
    }
    if (!concealCards){
        let accumulatedScore = 100*(Math.pow(2,gameInfo['streak']-1)); //score based on streak
        if (timeSinceLastSuccess < 10){
            accumulatedScore += (1000 - timeSinceLastSuccess*100); //score based on time of last match
        }
        else{
            accumulatedScore += 50;
        }
        gameInfo['score'] += accumulatedScore;
    }
}

//if difficulty = 1, make card types = 1/4 of card count
//if difficulty = 2, make card types = 1/3 of card count
//if difficulty = 3, make card types = 1/2 of card count
function generateGame(cardCount, difficulty){
    var nums = new Array();
    var cards = new Array();

    for( let i = 1 ; i <= cardCount ; i++ ){
         nums[i] = i; 
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

    //initialize game variables
    
    gameInfo['difficulty'] = difficulty;
    gameInfo['cardCount'] = cardCount;
    gameInfo['cards'] = cards;
    gameInfo['lastPicked'] = null;
    gameInfo['lastPickedTime'] = 0;
    gameInfo['cardsMatched'] = 1;
    gameInfo['streak'] = 0;
    gameInfo['score'] = 0;
    gameInfo['playerName'] = null;
}

function systemStartVariables(){
    gameSettings['difficulty'] = 1;
    gameSettings['cardCount'] = 10;
    gameSettings['theme'] = 'c';
}
