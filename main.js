'use strict';
function TrackerApp() {
  const version = "1.0";
  const ME = "akavangop";
  var timer, $tasks = $("#tasks");

  function roundForMe(i){
    return Math.round(i*precision)/precision;
  }

  function timerClicked(e){
    var $timerLabel = e.find(".task-timer-label"),
        $taskName = e.find("input"), taskName = $taskName.val();
    if(!taskName){
      $taskName.parent().fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
      return;
    }
    if(!e.hasClass("active")){ // not active, we need to start timer
      var taskID = e.data("tracker-id");
      if(!taskID){ // generate data-tracker-id if needed for localStorage
        taskID = new Date().getTime();
        e.data("tracker-id", taskID);
      }
      if(timer){ // stop currently running timer (if any), deactivate current task
        clearInterval(timer);
        $tasks["current"].toggleClass("active");
      }
      $tasks["id"] = taskID; // save current task details in global
      $tasks["current"] = e;
      timer = setInterval(timerWork, 1000, $timerLabel, taskName);
    }else{ // task was active, need to stop it
      clearInterval(timer);
      timer = "";
    }
    e.toggleClass("active");
  }
  function parseLabel($timerLabel) {
    var times = $timerLabel.text().split(":");
    var timerMins = parseInt(times[1]), timerHrs = parseInt(times[0]);
    return {hrs:timerHrs,mins: timerMins};
  }
  function timerWork($timerLabel, taskName){
    var minText, hrsText;
    var time = parseLabel($timerLabel);
    time.mins++;
    if (time.mins<10) {
      minText = "0" + time.mins;
    }else if( time.mins == 60){
      minText = "00";
      time.hrs++;
    }else{
      minText = time.mins;
    }

    if(time.hrs<10){
      hrsText = "0" + time.hrs;
    }else{
      hrsText = time.hrs;
    }
    var timerText = hrsText + ":" + minText;
    localStorage[$tasks["id"]] = JSON.stringify({"name":taskName, "time":timerText});
    $timerLabel.text(timerText);
  }

  this.start = function () {
    $("#top-header").append(version);
    //prevent page close or reload by mistake
    $(window).on("beforeunload", ()=> {
      // return false;
    });
    //load the list of saves
    $.each(localStorage, (k,v)=>{
      var $newTask = this.addTask(), savedTask=JSON.parse(v);
      $newTask.find(".task-title>input").val(savedTask.name).toggleClass("hidden");
      $newTask.find(".task-title>label").text(savedTask.name).toggleClass("hidden");
      $newTask.find(".task-timer-label").text(savedTask.time);
      $newTask.data("tracker-id",k);
      $tasks.append($newTask);
      console.log(k+":"+v);
    });
    //close the task
    $("button.inactivate").click((e)=> {
      var $currentTask = $(e.target).closest(".task");
      var key = $currentTask.data("tracker-id");
      localStorage.removeItem(key);
      $currentTask.remove();

    }); //end inactivate click

    //task-timer handler
    $(".task-timer").click((e)=>{
      var $thisTask = $(e.target).closest(".task");
      timerClicked($thisTask);
    });// end task-timer handler

//input "enter key" handler
    $(".task-title>input").on("keyup", (e)=>{
      if(e.keyCode == 13){
        var $input = $(e.target);
        var taskName = $input.val(), $nameLabel = $input.next();
        $input.toggleClass("hidden");
        $nameLabel.text(taskName).toggleClass("hidden");
      }
    }); // end "enter" key handler in task name input

// label doubleclick handler
  $(".task-title").on("dblclick",(e)=>{
    var $thisLabel = $(e.target).find("label");
    $thisLabel.toggleClass("hidden");
    $thisLabel.prev().toggleClass("hidden").trigger("focus");
  });
  };//end start

  this.addTask = function () {
    var $newTask = $("#templates").find(".task").clone(true);
    $tasks.append($newTask);
    $newTask.find("input").trigger("focus");
    return $newTask;
  };
}
//end of app object definition
$(function () {
  window.app = new TrackerApp();
  window.app.start();
});

//todo:
// swap currencies
//save stats, the rates sent
//save intactive tasks
//log timestamp on server
// replace buttons with span or whatever
//spawn a currency pair next to existing offer