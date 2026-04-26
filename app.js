var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');//added
const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const { setMaxIdleHTTPParsers } = require('http');
const { type } = require('os');
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
  competencyType: {
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

const CourseCompetency = sequelize.define('CourseCompetency', {
  type: { type: DataTypes.STRING, defaultValue: 'Primary' },
});

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
    await sequelize.sync({ force: true});
}

async function seedDB() {
  const count = await Competency.count();
  if (count > 0) return;

  await Competency.bulkCreate([
    { name: 'Community Collaboration', domain: 'Boundary Spanning', competencyType: 'Leadership' },
    { name: 'Organizational Awareness', domain: 'Boundary Spanning', competencyType: 'Leadership' },
    { name: 'Relationship & Network Development', domain: 'Boundary Spanning', competencyType: 'Leadership' },
    { name: 'Accountability', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Achievement Orientation', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Analytical Thinking', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Communication Skills 1–Writing', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Communication Skills 2–Speaking & Facilitating', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Performance Measurement', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Process & Quality Improvement', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Project Management', domain: 'Execution', competencyType: 'Leadership' },
    { name: 'Collaboration', domain: 'Relations', competencyType: 'Leadership' },
    { name: 'Impact & Influence', domain: 'Relations', competencyType: 'Leadership' },
    { name: 'Interpersonal Understanding', domain: 'Relations', competencyType: 'Leadership' },
    { name: 'Team Leadership', domain: 'Relations', competencyType: 'Leadership' },
    { name: 'Change Leadership', domain: 'Transformation', competencyType: 'Leadership' },
    { name: 'Information Seeking', domain: 'Transformation', competencyType: 'Leadership' },
    { name: 'Innovation', domain: 'Transformation', competencyType: 'Leadership' },
    { name: 'Strategic Orientation', domain: 'Transformation', competencyType: 'Leadership' },
    { name: 'Professional & Social Responsibility', domain: 'Values', competencyType: 'Leadership' },
    { name: 'Financial Skills', domain: 'Health System Awareness & Business Literacy', competencyType: 'Business' },
    { name: 'Human Resource Management', domain: 'Health System Awareness & Business Literacy', competencyType: 'Business' },
    { name: 'Information Technology Management', domain: 'Health System Awareness & Business Literacy', competencyType: 'Business' },
  ]);
  console.log('Competencies seeded.');
}

syncDB()
  .then(() => seedDB())
  .catch(console.error);

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