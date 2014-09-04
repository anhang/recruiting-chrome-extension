

$(document).ready(function() {

  var peopleRows = [];
  peopleRows.forEach(function(row){
    var frame = document.createElement('iframe');
    frame.src = "https://www.linkedin.com/pub/steve-gao/37/678/b56";
    frame.setAttribute("style", "display:none");
    

    $(frame).load(function() {
      var bodyText = $("#profile-ugc", frame.contentDocument).text();
      if (!bodyText) {
        bodyText = $("#background", frame.contentDocument).text();
      }

      var totalScore = (scoreCode(bodyText) + scoreSystem(bodyText))/TOTAL_MAX_SCORE * 100;
      var scoreDiv = document.createElement('div');
      div.innerHTML = "Score: " + totalScore;
      row.appendChild(div);
    });

    row.appendChild(frame);
  })


  // var bodyText = $("#profile-ugc").text();
  // if (!bodyText) {
  //   bodyText = $("#background").text();
  // }

  // var totalScore = (scoreCode(bodyText) + scoreSystem(bodyText))/TOTAL_MAX_SCORE * 100;
  // console.log("TOTAL SCORE: " + totalScore);

  // alert("TOTAL SCORE: " + totalScore);

  // var canvas = document.createElement("canvas");
  // var context = canvas.getContext('2d');
  // // ...draw to the canvas...
  // context.fillStyle = "#FF0000";
  // context.fillRect(0,0,19,19);

  // var imageData = context.getImageData(0, 0, 19, 19);
  // chrome.browserAction.setIcon({
  //   imageData: imageData
  // });

});

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

