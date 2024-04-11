var url = "http://localhost:3000/post"; //you will run a server on your machine!
var difficulty;
var cards;
var timer = 0;
var timerActive = false;
var currentTimerTimeout;

function response(data, status){

    var response = JSON.parse(data);

    switch(response['action']){
        case 'generateGame':
            //TODO: start game music
            $("#quitbuttondiv").show();
            var timerDiv = $("<div>").attr("id", "timer").text(timer);
            $("#game").append(timerDiv);
            timerToggle();
            break;
        case 'revealCard':
            $("#card-"+response['cardNumber']).addClass("faceUp").text(response['card']);
            let concealTheCards = response['concealTheCards'];
            if (concealTheCards != null){
                $(".gamecard").prop('disabled', true);
                if(!concealTheCards){
                    $(".faceUp").addClass("revealed").off();
                }
                setTimeout(concealCards, 500, concealTheCards, response['win']);
            }
            break;
        case 'retrieveGameSummary':
            break;
        default:
            break;
    }
}

function win(){
    clearTimeout(currentTimerTimeout);
    $("#quitbuttondiv").hide();
    $("#timer").text("Board completed!");    
    var button = $("<button />").text("Next");
    button.on("click", function(event) {
        showGameOver();
    });
    $("#timer").append(button);
}

function concealCards(concealCards, winCondition){    
    if(concealCards){
        $(".faceUp").text("Card");
    }
    $(".faceUp").removeClass("faceUp");
    $(".gamecard").prop('disabled', false);
    if (winCondition){
        win();
    }
}

function init(){
    //consider using cookies so app remembers last settings chosen
    difficulty = 1;
    cards = 10;
    showOpening();
}

function showOpening(){
    showScreen("#opening");    
}

//TODO: change difficulty and cards with proper value from settings instead of random
function showGame(){
    clearGameTable();
    for(i = 1; i <=cards; i++) {
        var button = $("<button />").text("Card").addClass("gamecard").attr("id","card-" + i);
        button.on("click", {index: i}, function(event) {
            selectCard(event.data.index);
        });
        $("#game").append(button);
        if (i%10 == 0){
            $("#game").append("<br />")
        }
    }
    $.post(url+'?data='+JSON.stringify({
        'difficulty': difficulty, 
        'cards': cards,
        'action':'generateGame'}),
    response);

    showScreen("#playgame");
}

function incrementASecond(activeTimer){
    if(activeTimer){
        $("#timer").text(timer);
        timer++;
        currentTimerTimeout = setTimeout(incrementASecond, 1000, activeTimer);
    }    
}

function timerToggle(){
    timerActive = !timerActive;
    if(timerActive){
        currentTimerTimeout = setTimeout(incrementASecond, 1000, timerActive);
    }
    else{
        clearTimeout(currentTimerTimeout);
        timer = 0;
    }
}


function selectCard(cardNumber){
    $.post(url+'?data='+JSON.stringify({
        'cardNumber': cardNumber, 
        'action':'revealCard',
        'pickNumber': $(".faceUp").length,
        'pickTime': timer}),
    response);
}

function showSettings(){
    showScreen("#settings");
}

function showInstructions(){
    showScreen("#instructions");
}

function showLeaderboards(){
    showScreen("#leaderboards");
}

function showGameOver(){
    timerToggle();
    showScreen("#gameover");
    $.post(url+'?data='+JSON.stringify({
        'action':'retrieveGameSummary'}),
    response);
}

function quitGame(){
    if (confirm("Are you sure you want to quit?") == true) {
        timerToggle();
        showScreen("#opening");
    } 
}

function clearGameTable(){
    $(".gamecard").remove();
    $("#game br").remove();
    $("#timer").remove();
}

function applySettings(){
    alert("Settings changed successfully!");
    showOpening();
}

function showScreen(className){
    $(className).show();
    $(".content").not(className).each(function(){
        $(this).hide();
    })
}