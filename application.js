var WORDS = {
  coding: null,
  system: null,
  bad: null
};

$(document).ready(function() {
  Parse.initialize("EyODBv03mdUNxFRcPhEKz0lWekFFqfIgmdCwudr1", "zu97AoDaKu74yJQRyUmrQSfnQDtlJZLLHVYCubsW");
  
  // Load words from Parse, then initialize

  var WordSet = Parse.Object.extend("WordSet");
  var query = new Parse.Query(WordSet);
  query.equalTo("userName", "test-user-1");
  query.find({
    success: function(results) {      
      if (!(results && results.length !== 0)) {
        // create it
        var p = new WordSet();
        p.save({
          userName: "test-user-1"
        });
      } else {
        var user = results[0];
        WORDS.coding = user.get('kw_coding');
        WORDS.system = user.get('kw_system');
        WORDS.bad = user.get('kw_bad');
      }
      initialize();
    },
    error: function(error) {
      alert('LI extension is broken!')
    }
  });

});

function initialize() {
  $("body").bind("DOMSubtreeModified", function() {
    colorizeProfileRows();
  });
  colorizeProfileRows();
}

function saveIframeToParse(path, frameRoot) {
  var rawText = _getProfileText(frameRoot);
  if (!rawText) {
    return;
  }
  var LIRecruiterProfile = Parse.Object.extend("LIRecruiterProfile");
  var query = new Parse.Query(LIRecruiterProfile);
  query.equalTo("linkedinPath", path);
  query.find({
    success: function(results) {      
      if (!(results && results.length !== 0)) {
        // create it
        var p = new LIRecruiterProfile();
        p.save({
          linkedinPath: path,
          rawText: rawText
        });
      } else {
        // update it
        results[0].set("rawText", rawText);
        results[0].save();
      }
    },
    error: function(error) {}
  });
}

function loadFromParse(profilePath, callback) {
  var LIRecruiterProfile = Parse.Object.extend("LIRecruiterProfile");
  var query = new Parse.Query(LIRecruiterProfile);
  query.equalTo("linkedinPath", profilePath);
  query.find({
    success: function(results) {      
      if (!(results && results.length > 0)) {
        callback(null);
      } else {
        callback(results[0]);
      }
    },
    error: function(error) {
      callback(null);
    }
  });
}

var profilesByHref = {};
function colorizeProfileRows() {
	var peopleRows = $(".profile");
  peopleRows.each(function(ii, row) {
  	var anchor = $(".name a", row);
  	if (!anchor) {
  		return;
  	}
  	var href = anchor[0].href;
  	if (profilesByHref[href]) {
  		return;
  	}
  	profilesByHref[href] = true;

    loadFromParse(href, function(profileObj) {
      if (!profileObj) {
        var bodyText = loadIframeAndColorize(href, row);
      } else {
        var bodyText = profileObj.get('rawText');
        scoreProfile(href, row, bodyText);
      }
    });
  });
}

function loadIframeAndColorize(href, row) {
  var frame = document.createElement('iframe');
  frame.src = href;
  frame.setAttribute("style", "display:none");
  
  $(frame).load(function() {
    saveIframeToParse(href, frame.contentDocument);

    var bodyText = _getProfileText(frame.contentDocument);
    var score = scoreBodyText(bodyText);
    colorizeRow(score, row);
  });

  row.appendChild(frame);
}

function scoreProfile(href, row, bodyText) {
  var score = scoreBodyText(bodyText);
  colorizeRow(score, row);
}

function _getProfileText(root) {
  var bodyText = $("#profile-ugc", root).text();
  if (!bodyText) {
    $("#background script", root).remove();
    var htmlStr = $("#background", root).html();
    bodyText = (htmlStr || "").replace(/<[^>]*>/g, " ").trim();
  }
  return bodyText;
}

function scoreBodyText(bodyText) {
  return (scoreCode(bodyText) + scoreSystem(bodyText))/TOTAL_MAX_SCORE * 100;
}

function colorizeRow(totalScore, row) {
  if (totalScore >= 80) {
    $(row).css("background-color", "#D0F0C0");
  } else if (totalScore >= 50) {
    $(row).css("background-color", "#FFB347");
  } else {
    $(row).css("background-color", "#FFD1DC");
  }
}

// score LI profiles

var CODING_MAX_SCORE = 5.0;
var SYSTEM_MAX_SCORE = 5.0;
var TOTAL_MAX_SCORE = CODING_MAX_SCORE + SYSTEM_MAX_SCORE;

function scoreBucket(keywords, allWords) {
  if (!keywords) {
    return 0;
  }

  keywords = keywords.split(", ");

  var sum = 0;
  keywords.forEach(function(kw) {
    var match = allWords.match(new RegExp(kw, "ig"));
    if (match) {
      sum += 1;
    }
  });
  var badWords = WORDS.bad;
  if (badWords) {
    badWords = badWords.split(", ");
    badWords.forEach(function(bad_kw) {
      var match = allWords.match(new RegExp(bad_kw, "ig"));
      if (match) {
        sum -= 1;
      }
    });
  }
  return Math.max(sum, 0);
}

function scoreCode(words) {
  return Math.min(scoreBucket(WORDS.coding, words), CODING_MAX_SCORE);
}

function scoreSystem(words) {
  return Math.min(scoreBucket(WORDS.system, words), SYSTEM_MAX_SCORE);
}

