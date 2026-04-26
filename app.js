var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');//added
const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const { setMaxIdleHTTPParsers } = require('http');
var dotenv = require('dotenv').config();



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
const dbUrl = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_LOCAL;

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

const Competency = sequelize.define('Competency', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  competencyTyle: {
    type: DataTypes.STRING,
    allowNull: false
  },
 
});

const Course = sequelize.define('Course', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: { type: DataTypes.STRING, allowNull: false },
  program : { type: DataTypes.STRING, allowNull: false },
});

const CourseCompetency = sequelize.define('CourseCompetency', {});

const Submission = sequelize.define('Submission', {
  facultyName: {
    type: DataTypes.STRING,
    allowNull: false },
  facultyEmail: {
      type: DataTypes.STRING,
      allowNull: false },
  semester: {
      type: DataTypes.STRING,
      allowNull: false },
 status: {
      type: DataTypes.STRING,
      allowNull: false },
});

const StudentScore = sequelize.define('StudentScore', {
  studentID: {
    type: DataTypes.STRING,
    allowNull: false },
  score: {
      type: DataTypes.FLOAT,
      allowNull: false },
});

Course.belongsToMany(Competency, { through: CourseCompetency });
Competency.belongsToMany(Course, { through: CourseCompetency });

Submission.belongsTo(Course);
Course.hasMany(Submission);

StudentScore.belongsTo(Submission);
Submission.hasMany(StudentScore); 

async function syncDB(){
    await sequelize.sync();
}

syncDB().catch(console.error);

/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Miami' });
});



app.get('/:name', function (req, res, next) {
  console.log(req);
  res.render('index', { title: req.params.name });
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