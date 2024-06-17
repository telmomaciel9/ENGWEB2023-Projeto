var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jsonwebtoken')

// Configuração com a BD
var mongoose = require('mongoose')
var mongoDB = process.env.MONGODB_URL
mongoose.connect(mongoDB, {
  useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error...'))
db.on('open', function(){
  console.log("Conexão com MongoDB realizada com sucesso!")
})

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de proteção (nega pedidos não autenticados)
app.use(function(req, res, next){
  var myToken
  if(req.query && req.query.token)
    myToken = req.query.token
  else if(req.body && req.body.token)
    myToken = req.body.token
  else 
    myToken = false

  // Se não tiver nem num, nem noutro este if dá falso
  if(myToken){
    jwt.verify(myToken, "PGDRE2023", function(e, payload){
      if(e){
        // Erro na verificação do token
        res.status(401).jsonp({error: e})
      }
      else{
        // Sucesso na verificação do token
        req.user = payload // Informação do user (username, level e active) fica em req.user
        console.log("Sucesso na autenticação!")
        next()
      }
    })
  }
  else{
    // Não existe token
    res.status(401).jsonp({error: "Token inexistente!"})
  }
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(404).json({erro: err, message: "Pedido não suportado!"});
});

module.exports = app;
