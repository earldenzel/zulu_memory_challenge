var url = "http://localhost:3000/post"; //you will run a server on your machine!
var difficulty;
var cards;
var timer = 1;
var timerActive = false;
var currentTimerTimeout;

function response(data, status){

    var response = JSON.parse(data);

    switch(response['action']){
        case 'retrieveServerVariables':
            difficulty = response['difficulty'];
            cards = response['cardCount'];
            showOpening();
            $("#difficulty").text(displayDifficulty(difficulty));
            break;
        case 'generateGame':
            //TODO: start game music
            $("#nextbuttondiv").hide();
            $("#quitbuttondiv").show();
            timerToggle();
            break;
        case 'revealCard':
            $("#card-"+response['cardNumber']).addClass("faceUp").text(response['card']); //TODO: replace with image
            $("#score").text(response['score']);
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
            $("#difficultyText").text('Difficulty: ' + displayDifficulty(response['difficulty']));
            $("#cardNumText").text('Cards Matched: ' + response['cardCount']);
            $("#timeFinishText").text('Time Finished: ' + displayTimer(response['timeFinished']));
            $("#scoreText").text('Score: ' + response['score']);
            $("#maxMatchesText").text('Maximum matches in a row: ' + response['maximumStreak']);
            break;
        default:
            break;
    }
}

function submitToLeaderboard(){
    //TODO
}

function win(){
    clearTimeout(currentTimerTimeout);
    $("#quitbuttondiv").hide();
    $("#nextbuttondiv").show();
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
    $.post(url+'?data='+JSON.stringify({
        'action':'retrieveServerVariables'}),
    response);
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
        $("#timer").text(displayTimer(timer));
        timer++;
        currentTimerTimeout = setTimeout(incrementASecond, 1000, activeTimer);
    }    
}

function displayTimer(timer){
    return Math.floor(timer/60) + ":" + (timer%60).toString().padStart(2,'0');
}


function displayDifficulty(difficulty){
    switch(difficulty){
        case 1:
            return 'EASY';
        case 2:
            return 'MEDIUM';
        case 3:
            return 'HARD';
        default:
            break;
    }
}

function timerToggle(){
    timerActive = !timerActive;
    if(timerActive){
        currentTimerTimeout = setTimeout(incrementASecond, 1000, timerActive);
    }
    else{
        clearTimeout(currentTimerTimeout);
        timer = 1;
        $("#timer").text("0:00");
        $("#score").text("0");
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

/* HTML VOLUME SLIDER */

document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById("volumeSlider");
    const volumeValue = document.getElementById("volumeValue");
    const audio = document.getElementById("backgroundMusic");
    const muteButton = document.getElementById("muteButton");
    let isMuted = false;
  
    // Set initial volume value
    volumeValue.textContent = slider.value;
  
    // Update volume and display value on slider change
    slider.addEventListener("input", function() {
      const volume = slider.value;
      audio.volume = volume / 100;
      volumeValue.textContent = volume;
      isMuted = false;
      updateMuteIcon();
    });

    muteButton.addEventListener("click", () =>{
        isMuted = !isMuted;
        audio.muted = isMuted;
        updateMuteIcon()
    });

    function updateMuteIcon(){
        if(isMuted){
            muteButton.innerHTML = '<i class="fas fa-volume-mute">'
        } else {
            muteButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
        }
    }
   /* To ensure that audio is unmuted in the start */

   audio.muted = false;
   updateMuteIcon();
  });   