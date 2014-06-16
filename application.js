var timer;
function hideSeenProfiles() {
  $('.quick-info').parents('.profile').hide();
}

$("body").bind("DOMSubtreeModified", function() {
  if (!timer) {
    timer = setTimeout(function(){
      hideSeenProfiles();
      timer = null;
    }, 500);
  }
});
hideSeenProfiles();
