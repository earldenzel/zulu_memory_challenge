var url = "http://localhost:3000/post"; //you will run a server on your machine!
var difficulty;
var cards;
var timer = 1;
var theme;
var timerActive = false;
var currentTimerTimeout;

var nameSaved = false;

function response(data, status){

    var response = JSON.parse(data);

    switch(response['action']){
        case 'applySettings':
            alert(response['msg']); //intentional no break
        case 'retrieveServerVariables':
            difficulty = response['difficulty'];
            cards = response['cardCount'];
            theme = response['theme'];
            $("#difficulty").text(displayDifficulty(difficulty));
            $("#difficulty" + difficulty).prop("checked", true);
            $("#cardCount" + cards).prop("checked", true);
            $("#select_difficulty").val(difficulty);
            $("#select_card_count").val(cards);            
            $('#select_card_count').on('change', function()
            {
                showLeaderboards(false);
            });       
            $('#select_difficulty').on('change', function()
            {
                showLeaderboards(false);
            });
            showOpening();
            //TODO: handle theme here
            break;
        case 'generateGame':
            //TODO: start game music
            $("#nextbuttondiv").hide();
            $("#quitbuttondiv").show();
            timerToggle();
            nameSaved = false;
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
            $("#submitdiv").show();
            $("#newgamediv").hide();
            break;
        case 'submitToLeaderboard':
            nameSaved = true;
            $("#leaderboardName").val("");
            alert(response['msg']); 
            $("#submitdiv").hide();
            $("#newgamediv").show();
            break;
        case 'retrieveLeaderboards':
            $("#fastest p").remove();
            $("#fastest br").remove();
            $("#highest p").remove();
            $("#highest br").remove();
            for(i = 0; i < response['orderByTime'].length; i++) {
                var entryForFast = $("<p>").text(displayLeaderboardEntry(response['orderByTime'][i], true));
                var entryForHigh = $("<p>").text(displayLeaderboardEntry(response['orderByPoints'][i], false));
                $("#fastest").append(entryForFast);
                $("#highest").append(entryForHigh);
            }
            showScreen("#leaderboards");  
            break;
        default:
            break;
    }
}

function displayLeaderboardEntry(listEntry, byTime){
    if (byTime){
        return listEntry.name + " - " + displayTimer(listEntry.finishTime);
    }
    return listEntry.name + " - " + listEntry.score;
}

function submitToLeaderboard(){
    if (!nameSaved){
        if($("#leaderboardName").val().length == 0){
            alert("Please input a valid name!");
        }
        else{
            $.post(url+'?data='+JSON.stringify({
                'action':'submitToLeaderboard',
                'playerName':$("#leaderboardName").val()}),
            response);
        }
    }
}

function win(){
    clearTimeout(currentTimerTimeout);
    $("#quitbuttondiv").hide();
    $("#nextbuttondiv").show();
    alert("Well-played!");
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
    switch(""+difficulty){
        case "1":
            return 'EASY';
        case "2":
            return 'MEDIUM';
        case "3":
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

function showLeaderboards(checkSave){
    if (!checkSave || nameSaved || confirm("Name not provided for leaderboards. Really proceed to leaderboards?")){
        $.post(url+'?data='+JSON.stringify({
            'action':'retrieveLeaderboards',
            'difficulty': $("#select_difficulty").val(),
            'cardCount': $("#select_card_count").val()
        }),
        response);
    }
}

function discardGame(){
    if (nameSaved || confirm("Name not provided for leaderboards. Really go back to title screen?")){
        showOpening();
    }
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
    $.post(url+'?data='+JSON.stringify({
        'difficulty': $('input[name="difficulty_selected"]:checked').val(),
        'cardCount': $('input[name="card_count_selected"]:checked').val(),
        'action':'applySettings'}),
    response);
}

function resetSettings(){
    $("#difficulty" + difficulty).prop("checked", true);
    $("#cardCount" + cards).prop("checked", true);
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