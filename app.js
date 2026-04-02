var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');//added
const fs = require('fs');
const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');
const { ppid } = require('process');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

//Registering Partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))
hbs.registerPartial('partial_name', 'partial value');


//Setup out database
const storage = path.join(_dirname,'..','data','database.sqlite')

const sequelize = new Sequelize({
  dialect:'sqlite',
  dialectModule:require('better-sqlite3'),
  storage,
  logging:false
});

const task = sequelize.define('Task',{
  name:{type: DataTypes.STRING,allowNull:false},
  description:{type:DataTypes.TEXT}
});

/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'XID Program' });
});

app.get('/page2', function (req, res, next) {
  res.render('index', { title: 'Page 2' });
});

app.get('/form', function (req, res, next) {
  res.render('form', { title: 'Form' });
});

app.post('/form', function(res, res, next) {
  console.log(req.body.firstname);
  res.render('formresponse',req.body);
});

app.get('/page2', function (req, res, next) {
  res.render('index', { title: 'Page 2' });
});

app.get('/guess', function (req, res, next) {
  res.render('guess', { title: 'Guess' });
});

app.post('/guess', function (req, res, next) {
  console.log(req.body.guess);
  let randomnumber = Math.floor(Math.random() * 10);
  console.log(randomnumber);
  if(randomnumber == Number)req.body.guess)){
    console.log("you guessed correctly");
    response = "you guessed correctly";
  }else{
    console.log("you guessed poorly");
    response = "your guessed poorly";
  }

  let templateResponse = 
});

app.get('/:name', function (req, res, next) {
  console.log(req)
  res.render('index', { title: req.params.name });
});

app.get('/addtask', function (req, res) {
  res.render('addtask', { title: 'Add Task' });
});

app.post('/addtask', async function (req, res, next) {
  try {
    const created = await Task.create({ name:req.body.name, description: req.body.description });
    // render a clearer confirmation page for the saved task
   res.json(req.body);
  } catch (err) {
    next(err);
     }
});

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
  res.render('error');
});

module.exports = app;