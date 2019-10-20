'use strict'

const logic = require('./javascript/model');
const {dialog} = require('electron').remote;
const remote = require('electron').remote;



//test purpose

function pause(ms){
var date = new Date();
var curDate = null;
do { curDate = new Date(); }
while(curDate-date < ms);
}

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
  let dialogPathOption = {properties: ['openFile','openDirectory']};
  dialog.showOpenDialog(dialogPathOption, function(filename) {
  target.value = filename[0];
  });
}

//handler INIT button

let init = document.getElementById('init');

init.addEventListener("click", () => {

let textInputs = document.getElementsByClassName('form-control');

spinnerShow();



  for (let i = 0; i < 3; i++) {
      let path = textInputs[i].value;
      let key = "arr" + i;
      logic.model.getFolders(path, (err, dirs) => {
    if (err) {
        process.exitCode = 1;
        console.error(err);
        spinnerHide();
    } else {
        Array.prototype.push.apply(logic.model.arr, dirs);
        spinnerHide();
    }
});
    }
  })

//hadler GO button

let go = document.getElementById('go');

go.addEventListener("click", ()=>{
let targetFolders = getTargetFolders();
let destinationFolder = getDestinationFolder();
  progressValue(0);
  progressShow();

  let counter = 0;



  (function doTask() {
    let targetPath = logic.model.find(targetFolders[counter]);
    if (targetPath === undefined) {
      counter++;
      let percent = Math.round(counter*100/targetFolders.length);
      progressValue(percent);
      logic.model.logger(destinationFolder, "Folder not found");
      if (percent < 100){
        setTimeout(doTask, 0)
      }else{
        progressHide();
      }
    }else{
      logic.model.copy(targetPath,destinationFolder);
      counter++;
      let percent = Math.round(counter*100/targetFolders.length);
      progressValue(percent);
      if (percent < 100){
        setTimeout(doTask, 0)
      }else{
        progressHide();
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

function spinnerShow(path) {
  let spinner = document.getElementById('md');
  let spinnerTitle = document.getElementById('mdtitle');
  spinnerTitle.value = "Scanning " + path;
  spinner.classList.add("show");
}

//progressbar

function progressHide() {
  document.getElementById('mdpg').classList.remove("show");
}

function progressShow() {
  document.getElementById('mdpg').classList.add("show");
}

function progressValue(value) {
  let pg = document.getElementById("pg");
  pg.setAttribute("style", `width: ${value}%`);
  pg.innerText = `${value}%`;
}
