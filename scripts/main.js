var model = {};
var data = comments;

var MAXLENGTH = 20;
var ANTICHAOSFACTOR = 1;

// Settings 
var settings = {
  allLower: true,
  seperateExc: true,
  useExtras: true,
  filterName: true,
};

var names = ["hannah", "noelle", "nicole", "lyd", "lydia", "noel", "marissa", "stewart","lizzy", "liz"];

function parseData(useCharacters = false, allLower = true, seperateExc = true, useExtras = true, filterName = true) {
  // Wipe model
  model = {};
  
  // Add extras if we have it
  if(useExtras) {
    data.concat(fullcomments);
  }

  for(var i = 0; i < data.length; i++) {
    var curMessage = data[i];

    // Lower case the message
    if(allLower) {
      curMessage = curMessage.toLowerCase();
    }

    // Seperate out exclamation points
    if(seperateExc) {
      curMessage = curMessage.replace(/!/g, " [EXC]");
    }

    // If we are doing by word...
    if(!useCharacters) {
      // Split up the message into spaces
      var splitMsg = curMessage.split(" ");

      // Loop through the words and train the model
      for(var o = 0; o < splitMsg.length; o++) {
        
        // Replace the names with name tags if the filter is on
        if(filterName) {
          if(names.includes( splitMsg[o].toLowerCase())) {
            splitMsg[o] = "[NAME]";
          }
        }

        // Train the model
        if(o == 0) {
          addToWord("[START]", splitMsg[o]);
        }
        else {
          addToWord(splitMsg[o-1], splitMsg[o]);
        }
      }

      // Add [END] to the last word
      addToWord(splitMsg[splitMsg.length-1], "[END]");
    }
  }

  console.log("Done training model!");

  console.log(model);
}

// Trains a word in the model
function addToWord(wordFrom, wordTo) {
  if(model[wordFrom]) {
    if(model[wordFrom][wordTo]) {
      model[wordFrom][wordTo] += 1;
    }
    else {
      model[wordFrom][wordTo] = 1;
    }
  }
  else {
    model[wordFrom] = {};
    model[wordFrom][wordTo] = 1;
  }
}

// Create a message
function generateMessage(passedInName = document.getElementById("genName").value) {
  var msg = "";
  var lastWord = "[START]";
  for( var i = 0; i < MAXLENGTH; i++){
    lastWord = grabWordFrom(lastWord);
    if(lastWord == "[END]") {
      break;
    }
    else if(lastWord == "[EXC]"){
      msg = msg.trim();
      msg += "! ";
    }
    else if(lastWord == "[NAME]") {
      msg += passedInName + " ";
    }
    else {
      msg += lastWord + " ";
    }
  }

  document.getElementById("msg").innerText = msg;

  return msg;
}

function grabWordFrom(word) {
  var masterGrab = [];
  for (var subWord in model[word]) {
    masterGrab.push([subWord,Math.pow(model[word][subWord],ANTICHAOSFACTOR)]);
  }

  return getItemFromWeightedArray(masterGrab);
}

var toggleStuff = {
  allLower: {
    color: "red",
    onText: "all data will be reduced to lowercase",
    offText: "casing will be preserved on all data",
  },
  seperateExc: {
    color: "green",
    onText: "seperate out exclaimation points",
    offText: "group exclaimation points with words",
  },
  useExtras: {
    color: "blue",
    onText: "use longer/weirder comments (more fun)",
    offText: "use only the short/standard comments",
  },
  filterName: {
    color: "cyan",
    onText: "filter out names",
    offText: "use names in orignal comments",
  },
}

function toggleSetting(thisDiv) {
  var thisID = thisDiv.id;

  settings[thisID] = !settings[thisID];

  renderToggles();
}

function renderToggles() {
  for(var settingName in settings) {
    var thisDiv = document.getElementById(settingName);

    thisDiv.style.borderColor = toggleStuff[settingName].color;

    if(settings[settingName]) {
      thisDiv.style.backgroundColor = toggleStuff[settingName].color;
      thisDiv.getElementsByClassName("mainText")[0].style.color = "white";
      thisDiv.getElementsByClassName("mainText")[0].innerText = toggleStuff[settingName].onText;
    }
    else if(!settings[settingName]) {
      thisDiv.style.backgroundColor = "white";
      thisDiv.getElementsByClassName("mainText")[0].style.color = toggleStuff[settingName].color;
      thisDiv.getElementsByClassName("mainText")[0].innerText = toggleStuff[settingName].offText;
    }
  }
}

function getItemFromWeightedArray(ary) {
  var total = 0;
  for(var o = 0; o < ary.length; o++) {
    total += ary[o][1];
  }

  var val = Math.random() * total;

  for(var i = 0; i < ary.length; i++) {
    val -= ary[i][1];

    if( val < 0) {
      return ary[i][0];
    }
  }

  return null;
}

function train() {
  parseData(false, settings.allLower, settings.seperateExc, settings.useExtras, settings.filterName);

  for(var settingName in settings) {
    var thisDiv = document.getElementById(settingName);

    thisDiv.style.opacity = 0;
  }

  setTimeout(function () {
    for(var settingName in settings) {
      var thisDiv = document.getElementById(settingName);
  
      thisDiv.style.display = "none";
    }

    document.getElementById("train").style.top = "200px";
    document.getElementById("train").getElementsByClassName("mainText")[0].innerText = "model trained! time to generate some comments...";
    document.getElementById("train").getElementsByClassName("tapToChange")[0].style.opacity = "0";

    setTimeout(function () {
      document.getElementById("train").style.opacity = 0;
      document.getElementById("gen").style.display = "block";
      document.getElementById("genName").style.display = "block";
      document.getElementById("wouldComment").style.display = "block";

      setTimeout(function () {
        document.getElementById("train").style.display = "none";
        document.getElementById("gen").style.opacity = "1";
        document.getElementById("genName").style.opacity = "1";
        document.getElementById("wouldComment").style.opacity = "1";

      }, 500);
    }, 1500);
  }, 500);

}

renderToggles();

function genName() {
  return String(getRandomInt(0,10)) + String(getRandomInt(0,10)) + String(getRandomInt(0,10)) + String(getRandomInt(0,10));
}

function getRandomInt(min,max) {
  return Math.floor(min+ ((max-min)*Math.random()));
}

