var WORDS = {
	coding: null,
	system: null,
	bad: null
};

var MY_WORD_SET = null;

$(document).ready(function() {
	$("#save_button").click(saveWords);
  Parse.initialize("EyODBv03mdUNxFRcPhEKz0lWekFFqfIgmdCwudr1", "zu97AoDaKu74yJQRyUmrQSfnQDtlJZLLHVYCubsW");
  
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
      	MY_WORD_SET = user;
      }
      initialize();
    },
    error: function(error) {}
  });
});

function initialize() {
	$("#kw_coding").val(WORDS.coding);
	$("#kw_system").val(WORDS.system);
	$("#kw_bad").val(WORDS.bad);
}

function saveWords(evt) {
	MY_WORD_SET.set("kw_coding", $("#kw_coding").val());
	MY_WORD_SET.set("kw_system", $("#kw_system").val());
	MY_WORD_SET.set("kw_bad", $("#kw_bad").val());

	MY_WORD_SET.save();

	evt.preventDefault();
	return false;
}