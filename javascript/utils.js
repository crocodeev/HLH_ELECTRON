'use strict'

exports.isPathFilled = function (path) {
  if (path === undefined) {
      return false;
  }
  return true;
}

exports.onlyFilledForms = function(forms){

  let pathArray = [];

  for (var i = 0; i < 3; i++) {
    if (forms[i].value !== "") pathArray.push(forms[i].value);
  }
  return pathArray;
}

exports.isArrayFilled = function (arr) {
  let result;
  arr.length > 0 ? result = true : result = false;
  return result;
}

exports.isEmptyString = function (string) {
  let result;
  string === "" ? result = true : result = false;
  return result;
}
