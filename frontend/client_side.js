var url = "http://localhost:3000/post"; //you will run a server on your machine!

function response(data, status){

    var response = JSON.parse(data);

    switch(response['action']){
        case 'generateGame':
            //TODO: start timer to be displayed for user, start game music
            break;
        //TODO: add more cases to handle how clientside reacts on game loop
        default:
            break;
    }
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
    for(i = 1; i <=cards; i++) {
        var button = $("<button />").text("Card").addClass("gamecard");
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
    alert(cardNumber + " is selected");
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

function quitGame(){
    if (confirm("Are you sure you want to quit?") == true) {
        $(".gamecard").remove();
        $("#game br").remove();
        showScreen("#opening");
    } 
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