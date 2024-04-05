var url = "http://localhost:3000/post"; //you will run a server on your machine!

function response(data, status){

    var response = JSON.parse(data);

    switch(response['action']){
        case 'generateGame':
            //TODO: start timer to be displayed for user, start game music
            break;
        case 'revealCard':
            $("#card-"+response['cardNumber']).addClass("faceUp").text(response['card']);
            if ($(".faceUp").length > 1){
                var concealTheCard = false;
                $(".gamecard").prop('disabled', true);
                if($(".faceUp:first").text() === $(".faceUp:last").text()){
                    $(".faceUp").addClass("revealed").off();
                }
                else{
                    concealTheCard = true;               
                }
                setTimeout(concealCards, 500, concealTheCard);
                checkWinCondition();
            }
            break;
        default:
            break;
    }
}

function checkWinCondition(){
    if ($(".revealed").length === $(".gamecard").length){
        alert("Bravo!");
        setTimeout(showGameOver, 1000);
    }
}

function concealCards(concealCards){    
    if(concealCards){
        $(".faceUp").text("Card");
    }
    $(".faceUp").removeClass("faceUp");
    $(".gamecard").prop('disabled', false);
}

function init(){
    showOpening();
}

function showOpening(){
    showScreen("#opening");    
}

//TODO: change difficulty and cards with proper value from settings instead of random
function showGame(){
    var cards = 10*Math.floor(1+3*Math.random());
    var difficulty = Math.floor(1+3*Math.random());
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

//TODO: handle display of card and if second click, determine match, and if all match complete, then end game
function selectCard(cardNumber){
    $.post(url+'?data='+JSON.stringify({
        'cardNumber': cardNumber, 
        'action':'revealCard'}),
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
    showScreen("#gameover");
}

function quitGame(){
    if (confirm("Are you sure you want to quit?") == true) {
        showScreen("#opening");
    } 
}

function clearGameTable(){
    $(".gamecard").remove();
    $("#game br").remove();
}

function applySettings(){
    alert("Settings changed!");
    showOpening();
}

function showScreen(className){
    $(className).show();
    $(".content").not(className).each(function(){
        $(this).hide();
    })

}