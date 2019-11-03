'use strict'

const utils = require('./javascript/utils');
const logic = require('./javascript/model');
const {dialog} = require('electron').remote;
const remote = require('electron').remote;


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

//hadler GO button

let go = document.getElementById('go');

go.addEventListener("click", ()=>{

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
);

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
