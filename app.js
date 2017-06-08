const Twig = require("twig")
const express = require('express')
const app = express()

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.send('Hello World!!')
})

app.get('/twig', function (req, res) {
  res.render('index.twig', {
    message : "Hello World"
  });
})

app.get('/test/:nbr', function (req, res) {
  var response = "Vous etes sur la page test numero " + req.params.nbr + "!"
  res.send(response)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable!');
});