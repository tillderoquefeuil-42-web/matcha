var express = require('express');

var app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

//INDEX
app.get('/', function(req, res) {

  var drinks = [
      { name: 'Bloody Mary', drunkness: 3 },
      { name: 'Martini', drunkness: 5 },
      { name: 'Scotch', drunkness: 10 }
  ];

  var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

  res.render('pages/index', {
    drinks: drinks,
    tagline: tagline
  });

});

//404 NOT FOUND
app.use(function(req, res, next){
  res.status(404)
    .render('pages/error');
});

app.listen(8080);