'use strict'

const utils = require('./javascript/utils');
const logic = require('./javascript/model');
const {dialog} = require('electron').remote;
const remote = require('electron').remote;
const path = require('path');

//new progress bar


let forms = document.getElementsByClassName("btn btn-primary btn-sm");

//handler for FORMS button
for (var i = 0; i < 4; i++) {
   forms[i].addEventListener("click", (e) => {
     let target = e.target.parentElement.parentElement.lastElementChild;
     getPath(target);
    });
}

function getPath(target){
  let value = target.value;

  let dialogPathOption = {properties: ['openFile','openDirectory']};

  dialog.showOpenDialog(dialogPathOption, function(filename) {

  if(utils.isPathFilled(filename[0])) {
    target.value = filename[0];
  } else if(value !== ""){
    return;
  }else{
    alertShow("Your didn't choose any folder!");
  }

  });
}

//handler INIT button

let init = document.getElementById('init');

init.addEventListener("click", () => {

logic.model.arr = [];

let textInputs = document.getElementsByClassName('form-control');

let paths = utils.onlyFilledForms(textInputs);

if(!paths.length){
  alertShow("You must choose at least one folder!");
  return;
}

spinnerShow();

let counter = 0;

(function initDirectoryTree(){
  let path = paths[counter];
  //let key = "arr" + i;
  logic.model.getFolders(path, (err, dirs) => {
if (err) {
    process.exitCode = 1;
    spinnerHide();
    alertShow(err);
} else {
    Array.prototype.push.apply(logic.model.arr, dirs);
    spinnerHide();
}
});
  counter++;
  if (counter <  paths.length){
    setTimeout(initDirectoryTree,0);
  }
})();

  /*for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      let key = "arr" + i;
      logic.model.getFolders(path, (err, dirs) => {
    if (err) {
        process.exitCode = 1;
        spinnerHide();
        alertShow(err);
    } else {
        Array.prototype.push.apply(logic.model.arr, dirs);
        spinnerHide();
    }
});
}*/
  })

//handler ADD button

let add = document.getElementById('add');

add.addEventListener("click", ()=>{

  if(logic.model.taskArr.length == 10){
    alertShow("You reached max items in queue");
  }else{
    let destinationFolder = getDestinationFolder()
    let targetFolders = getTargetFolders();

    if (utils.isEmptyString(targetFolders[0])) {
      alertShow("You did't fill WHAT field!");
      return;
    }

    if (utils.isEmptyString(destinationFolder)) {
      alertShow("You did't fill WHERE field!");
      return;
    }


  let taskObject = {
    destinationFolder: destinationFolder,
    targetFolders: getTargetFolders()
  }
    logic.model.taskArr.push(taskObject);

    let taskName = path.basename(destinationFolder);
    addTask(taskName);
    clear(document.getElementById("fdlist"));
    clear(document.getElementById("destination"));
  }
})

//handler REMOVE button

let remove = document.getElementById('remove');

remove.addEventListener("click", () => {
  if(logic.model.taskArr.length == 0){
    alertShow("Nothing to remove");
  }else {
    logic.model.taskArr.pop();
    removeTask();
  }
})

//hadler GO button

let go = document.getElementById('go');

go.addEventListener("click", ()=>{

  // if no tasks in task queue, start task in fields
if(utils.isArrayFilled(logic.model.taskArr)){

  let taskCounter = 0;

  (function taskQueue() {
        console.log(taskCounter);
    //--------------------
        let targetFolders = logic.model.taskArr[taskCounter].targetFolders;
        console.log("targetFolders");
        console.log(targetFolders);
        let destinationFolder = logic.model.taskArr[taskCounter].destinationFolder;
        console.log("destinationFolder");
        console.log(destinationFolder);
        taskCounter++;
        progressValue(0);
        progressShow();

        let counter = 0;
        let counterNotFind = 0;

        (function doTask() {

          let folderToFind = targetFolders[counter];
          let targetPath = logic.model.find(folderToFind);

          if (targetPath === undefined) {

            counter++;
            counterNotFind ++;
            let percent = Math.round(counter*100/targetFolders.length);
            progressValue(percent, "...");
            logic.model.logger(destinationFolder, "Folder not found " + folderToFind);

            if (percent < 100){
              setTimeout(doTask, 0)
            }else{
              progressHide();
              if (counterNotFind > 0) {
                alertShow(counterNotFind + "file(s) didn't find, see more info in log");
              }
            }

          }else{

            logic.model.copy(targetPath,destinationFolder);
            counter++;
            let percent = Math.round(counter*100/targetFolders.length);
            progressValue(percent, targetPath);

            if (percent < 100){
              setTimeout(doTask, 0)
            }else{
              progressHide();
              if (counterNotFind > 0) {
                alertShow(counterNotFind + "file(s) didn't find, see more info in log");
              }
            }
          }
        })();
    //-------------------

      if (taskCounter < logic.model.taskArr.length) {
        setTimeout(taskQueue,0);
      } else {
        alertShow("done");
      }
  })();



}else{
  if( !utils.isArrayFilled(logic.model.arr)){
    alertShow("Initialize directories tree first!");
    return;
  }

  let targetFolders = getTargetFolders();

  if (utils.isEmptyString(targetFolders[0])) {
    alertShow("You did't fill WHAT field!");
    return;
  }

  let destinationFolder = getDestinationFolder();

  if (utils.isEmptyString(destinationFolder)) {
    alertShow("You did't fill WHERE field!");
    return;
  }

    progressValue(0);
    progressShow();

    let counter = 0;
    let counterNotFind = 0;

    (function doTask() {

      let folderToFind = targetFolders[counter];
      let targetPath = logic.model.find(folderToFind);

      if (targetPath === undefined) {

        counter++;
        counterNotFind ++;
        let percent = Math.round(counter*100/targetFolders.length);
        progressValue(percent, "...");
        logic.model.logger(destinationFolder, "Folder not found " + folderToFind);

        if (percent < 100){
          setTimeout(doTask, 0)
        }else{
          progressHide();
          if (counterNotFind > 0) {
            alertShow(counterNotFind + "file(s) didn't find, see more info in log");
          }
        }

      }else{

        logic.model.copy(targetPath,destinationFolder);
        counter++;
        let percent = Math.round(counter*100/targetFolders.length);
        progressValue(percent, targetPath);

        if (percent < 100){
          setTimeout(doTask, 0)
        }else{
          progressHide();
          if (counterNotFind > 0) {
            alertShow(counterNotFind + "file(s) didn't find, see more info in log");
          }
        }
      }
    })();
}
}
);

//copy folder function

function copyFolders(task) {

}

//get target folder function

function getTargetFolders() {
  let fdlist = document.getElementById('fdlist');
  return fdlist.value.split("\n");
}


function getDestinationFolder() {
  let dest = document.getElementById('destination');
  return dest.value;
}


//show-hide spinner

function spinnerHide() {
  document.getElementById('md').classList.remove("show");
}

function spinnerShow() {
  let spinner = document.getElementById('md');
  spinner.classList.add("show");
}

function spinnerInfo(path) {
  let spinnerInfo = document.getElementById('spinnerInfo')
  spinnerInfo.innerText = path;
}

//alert Utils

function alertShow(message) {
  let alert = document.getElementById("mdal");
  let alertText = document.getElementById('alert-text');
  let closeBtn = document.getElementById("alcl");
  closeBtn.addEventListener("click", ()=>{
    alert.classList.remove("show");
  });
  alertText.innerText = message;
  alert.classList.add("show");
}

//info utils

//task queue

function addTask(taskName) {
 let taskList = document.getElementById('tasks');
 let item = document.createElement('li');
 item.className = "list-group-item";
 item.innerText = taskName;
 taskList.append(item);
}

function clear(element) {
  element.value = "";
}

function removeTask() {
  let taskList = document.getElementById('tasks');
  taskList.lastElementChild.remove();
}

function colorise(number, result) {
  let taskList = document.getElementById('tasks');
  switch (result) {
    case true:
      taskList.children[number].classList.add("bg-warning");
      break;
    case false:
      taskList.children[number].classList.add("bg-success");
      break;
    default:
      taskList.children[number].classList.add("bg-light");
  }
}

//progressbar

function progressHide() {
  document.getElementById('mdpg').classList.remove("show");
}

function progressShow() {
  document.getElementById('mdpg').classList.add("show");
}

function progressValue(value, message) {
  let pg = document.getElementById("pg");
  let pgInfo = document.getElementById("progressInfo");
  pg.setAttribute("style", `width: ${value}%`);
  pg.innerText = `${value}%`;
  pgInfo.innerText = message;
}
