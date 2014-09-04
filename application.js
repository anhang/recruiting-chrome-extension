$(document).ready(function(){
  Parse.initialize("EyODBv03mdUNxFRcPhEKz0lWekFFqfIgmdCwudr1", "zu97AoDaKu74yJQRyUmrQSfnQDtlJZLLHVYCubsW");
  colorizeProfileRows();
});



function saveIframeToParse(path, frameRoot) {
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
          rawText: _getProfileText(frameRoot)
        });
      } else {
        // update it
        results[0].set("rawText", _getProfileText(frameRoot));
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
  	console.log('processing: ' + href);
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
    $("#background script").remove();
    bodyText = $("#background", root).text();
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

var KW_CODING = [
  "coding",
  "software development",
  "software engineer",
  "programmer",
  "programming",
  "developer",
  "java",
  "PHP",
  "Ruby",
  "python",
  "perl",
  "computer science",
  "algorithm",
  "functional",
  "object oriented"
];

var KW_SYSTEM = [
  "Load balancing",
  "apache",
  "DNS",
  "TCP/IP",
  "system administration",
  "linux administration",
  "unix administration",
  "debian",
  "ubuntu",
  "fedora",
  "gentoo",
  "slackware",
  "redhat",
  "openbsd",
  "freebsd",
  "cents",
  "linux user",
  "unix user",
  "distributed systems",
  "operating systems",
  "linux",
  "unix",
  "puppet",
  "chef",
  "deployment",
  "database administration",
  "MYSQL",
  "hadoop",
  "high availability",
  "scaleability",
  "infrastructure",
  "system architecture",
  "troubleshooting",
  "storage",
  "IPV6",
  "networking",
  "virtualization",
  "cluster",
  "network security",
  "cloud computing",
  "solaris",
  "configuration management",
  "data center",
  "system monitoring",
  "devops",
  "PostgreSQL",
  "GNU/Linux",
  "BSD",
  "high performance computing"
];

var KW_BAD = [
  "Windows",
  ".NET",
  "Microsoft",
  "clearcase",
  "websphere",
  "junit",
  "HTML",
  "CSS",
  "front end",
  "oracle",
  "IBM",
  "dell",
  "HP",
  "Cobbler",
  "Active Directory",
  "Cisco",
  "C#",
  "Business Analysis",
  "Mac",
  "Enterprise",
  "Certified",
  "photoshop",
  // "R",
  "matlab",
  "Business intelligence", 
  "ETL", 
  "analytics", 
  "data mining", 
  "data modeling",
  "netapp"
];

function scoreBucket(keywords, allWords) {
  var sum = 0;
  keywords.forEach(function(kw) {
    var match = allWords.match(new RegExp(kw, "ig"));
    if (match) {
      sum += 1;
    }
  });
  KW_BAD.forEach(function(bad_kw) {
    var match = allWords.match(new RegExp(bad_kw, "ig"));
    if (match) {
      sum -= 1;
    }
  });
  return Math.max(sum, 0);
}

function scoreCode(words) {
  return Math.min(scoreBucket(KW_CODING, words), CODING_MAX_SCORE);
}

function scoreSystem(words) {
  return Math.min(scoreBucket(KW_SYSTEM, words), SYSTEM_MAX_SCORE);
}

