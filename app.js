var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');//added
const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
var dotenv = require('dotenv').config();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage()});



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
      defaultValue: 'Pending' },
syllabusFile: { 
    type: DataTypes.BLOB('long'), 
    allowNull: true },
syllabusFileName: { 
    type: DataTypes.STRING, 
    allowNull: true },
rubricFile: { 
    type: DataTypes.BLOB('long'), 
    allowNull: true },
rubricFileName: { 
    type: DataTypes.STRING, 
    allowNull: true },
higherTeachingPct: { 
    type: DataTypes.INTEGER, 
    allowNull: false, defaultValue: 0 },
lowerTeachingPct: { 
    type: DataTypes.INTEGER, 
    allowNull: false, defaultValue: 0 },
higherAssessmentPct: { 
    type: DataTypes.INTEGER, 
    allowNull: false, defaultValue: 0 },
lowerAssessmentPct: { 
    type: DataTypes.INTEGER, 
    allowNull: false, defaultValue: 0 },

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
StudentScore.belongsTo(Competency);
Competency.hasMany(StudentScore);

async function syncDB(){
    await sequelize.sync({ alter: true});
}

async function seedDB() {
  const competencyCount = await Competency.count();
  if (competencyCount === 0) {
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

  const courseCount = await Course.count();
  if (courseCount === 0) {
    const allComps = await Competency.findAll();
    const c = {};
    allComps.forEach(comp => { c[comp.name] = comp.id; });

    const courseData = [
      // MHA Year 1: Fall 2025
      { code: 'HMP 601', program: 'MHA',
        primary: ['Information Seeking', 'Professional & Social Responsibility'],
        secondary: ['Analytical Thinking'] },
      { code: 'MAS 631', program: 'MHA',
        primary: ['Achievement Orientation'],
        secondary: ['Performance Measurement', 'Change Leadership', 'Information Technology Management'] },
      { code: 'MAS 633', program: 'MHA',
        primary: ['Achievement Orientation', 'Project Management', 'Change Leadership'],
        secondary: [] },
      { code: 'ACC 600', program: 'MHA',
        primary: ['Accountability', 'Achievement Orientation', 'Analytical Thinking', 'Communication Skills 1–Writing', 'Performance Measurement', 'Collaboration', 'Information Seeking', 'Professional & Social Responsibility', 'Financial Skills'],
        secondary: [] },
      { code: 'BUS 610', program: 'MHA',
        primary: ['Accountability', 'Achievement Orientation', 'Communication Skills 1–Writing', 'Information Seeking', 'Professional & Social Responsibility', 'Financial Skills'],
        secondary: ['Collaboration', 'Interpersonal Understanding', 'Change Leadership'] },
      { code: 'MAS 634', program: 'MHA',
        primary: ['Achievement Orientation', 'Project Management'],
        secondary: [] },
      { code: 'MGT 620', program: 'MHA',
        primary: ['Organizational Awareness', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration'],
        secondary: ['Achievement Orientation', 'Interpersonal Understanding', 'Professional & Social Responsibility'] },
      // MHA Year 1: Spring 2026
      { code: 'HMP 640', program: 'MHA',
        primary: ['Analytical Thinking', 'Communication Skills 2–Speaking & Facilitating', 'Impact & Influence'],
        secondary: ['Communication Skills 1–Writing', 'Collaboration', 'Interpersonal Understanding', 'Team Leadership', 'Change Leadership', 'Professional & Social Responsibility'] },
      { code: 'HMP 684', program: 'MHA',
        primary: ['Achievement Orientation', 'Analytical Thinking', 'Performance Measurement', 'Interpersonal Understanding'],
        secondary: [] },
      { code: 'MKT 640', program: 'MHA',
        primary: ['Analytical Thinking', 'Communication Skills 2–Speaking & Facilitating', 'Impact & Influence'],
        secondary: ['Communication Skills 1–Writing', 'Collaboration', 'Interpersonal Understanding', 'Team Leadership'] },
      { code: 'FIN 641', program: 'MHA',
        primary: ['Accountability', 'Analytical Thinking', 'Financial Skills'],
        secondary: ['Collaboration', 'Information Seeking'] },
      { code: 'HMP 655', program: 'MHA',
        primary: ['Relationship & Network Development', 'Accountability', 'Achievement Orientation', 'Analytical Thinking', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Performance Measurement', 'Collaboration', 'Impact & Influence', 'Team Leadership', 'Change Leadership', 'Innovation'],
        secondary: ['Organizational Awareness', 'Information Seeking'] },
      { code: 'HMP 683', program: 'MHA',
        primary: ['Community Collaboration', 'Organizational Awareness', 'Relationship & Network Development', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Impact & Influence', 'Change Leadership', 'Information Seeking', 'Innovation'],
        secondary: ['Achievement Orientation'] },
      // MHA Year 1: Summer
      { code: 'HMP 650', program: 'MHA',
        primary: ['Analytical Thinking', 'Performance Measurement', 'Project Management'],
        secondary: [] },
      // MHA Year 2: Fall 2026
      { code: 'BSL 685', program: 'Both',
        primary: ['Analytical Thinking', 'Professional & Social Responsibility'],
        secondary: ['Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Information Seeking'] },
      { code: 'BTE 610', program: 'MHA',
        primary: ['Project Management', 'Information Technology Management'],
        secondary: ['Achievement Orientation', 'Analytical Thinking', 'Communication Skills 1–Writing', 'Information Seeking'] },
      { code: 'MGT 623', program: 'MHA',
        primary: ['Financial Skills', 'Human Resource Management'],
        secondary: ['Analytical Thinking', 'Communication Skills 2–Speaking & Facilitating'] },
      { code: 'HMP 620', program: 'MHA',
        primary: ['Community Collaboration', 'Relationship & Network Development', 'Accountability', 'Achievement Orientation', 'Analytical Thinking', 'Collaboration', 'Impact & Influence', 'Interpersonal Understanding', 'Change Leadership', 'Information Seeking', 'Innovation'],
        secondary: ['Communication Skills 2–Speaking & Facilitating', 'Performance Measurement', 'Project Management', 'Team Leadership'] },
      { code: 'MKT 643', program: 'MHA',
        primary: ['Analytical Thinking'],
        secondary: ['Organizational Awareness', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration', 'Impact & Influence', 'Strategic Orientation'] },
      { code: 'MGT 677', program: 'MHA',
        primary: ['Community Collaboration', 'Relationship & Network Development', 'Accountability', 'Achievement Orientation', 'Analytical Thinking', 'Collaboration', 'Impact & Influence', 'Information Seeking', 'Innovation', 'Strategic Orientation'],
        secondary: ['Organizational Awareness', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Interpersonal Understanding', 'Team Leadership', 'Change Leadership', 'Professional & Social Responsibility'] },
      // HEMBA-only courses
      { code: 'MGT 651', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration', 'Team Leadership', 'Change Leadership'],
        secondary: [] },
      { code: 'BUS 601', program: 'HEMBA', primary: [], secondary: [] },
      { code: 'ACC 602', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Financial Skills'],
        secondary: ['Communication Skills 2–Speaking & Facilitating'] },
      { code: 'MAS 610', program: 'HEMBA',
        primary: ['Accountability', 'Analytical Thinking', 'Performance Measurement', 'Process & Quality Improvement', 'Project Management'],
        secondary: ['Community Collaboration', 'Collaboration'] },
      { code: 'FIN 602', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Financial Skills'],
        secondary: ['Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration'] },
      { code: 'MAS 641', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Performance Measurement', 'Project Management'],
        secondary: [] },
      { code: 'MKT 660', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Strategic Orientation'],
        secondary: ['Achievement Orientation', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration'] },
      { code: 'MGT 602', program: 'HEMBA', primary: [], secondary: [] },
      { code: 'MGT 653', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Project Management'],
        secondary: [] },
      { code: 'BTE 621', program: 'HEMBA',
        primary: ['Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration', 'Change Leadership', 'Information Seeking', 'Innovation'],
        secondary: ['Process & Quality Improvement', 'Project Management'] },
      { code: 'HMP 698', program: 'HEMBA',
        primary: ['Accountability', 'Change Leadership', 'Information Seeking'],
        secondary: ['Analytical Thinking', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Collaboration'] },
      { code: 'MGT 658', program: 'HEMBA',
        primary: ['Analytical Thinking', 'Communication Skills 1–Writing', 'Communication Skills 2–Speaking & Facilitating', 'Strategic Orientation', 'Human Resource Management'],
        secondary: ['Organizational Awareness', 'Relationship & Network Development', 'Collaboration', 'Interpersonal Understanding', 'Team Leadership', 'Change Leadership', 'Innovation', 'Professional & Social Responsibility'] },
    ];

    for (const cd of courseData) {
      const course = await Course.create({ name: cd.code, code: cd.code, program: cd.program });
      for (const name of cd.primary) {
        if (c[name]) await CourseCompetency.create({ CourseId: course.id, CompetencyId: c[name], type: 'Primary' });
      }
      for (const name of cd.secondary) {
        if (c[name]) await CourseCompetency.create({ CourseId: course.id, CompetencyId: c[name], type: 'Secondary' });
      }
    }
    console.log('Courses seeded.');
  }
}

syncDB().then(() => seedDB())
.catch(console.error);

/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Accreditation Compass' });
});

app.get('/seed-check', async function(req, res, next) {
  const courses = await Course.count();
  const competencies = await Competency.count();
  res.json({ courses, competencies });
});


app.get('/faculty',  async function(req, res, next) {
  try {
    const courses = await Course.findAll();
    res.render('faculty', { title: 'Faculty Submission', coursesJSON: JSON.stringify(courses) });
  } catch (err) {
    next(err);
  }
});

app.post('/faculty', upload.fields([{ name: 'syllabusFile', maxCount: 1 }, { name: 'rubricFile', maxCount: 1 }]), async function(req, res, next) {
  try {
    const { facultyName, facultyEmail, semester, courseId, higherTeachingPct, lowerTeachingPct, higherAssessmentPct, lowerAssessmentPct } = req.body;
    const syllabus = req.files['syllabusFile'] ? req.files['syllabusFile'][0] : null;
    const rubric = req.files['rubricFile'] ? req.files['rubricFile'][0] : null;
    const submission = await Submission.create({
      facultyName, facultyEmail, semester, CourseId: courseId,
      syllabusFile: syllabus ? syllabus.buffer : null,
      syllabusFileName: syllabus ? syllabus.originalname : null,
      rubricFile: rubric ? rubric.buffer : null,
      rubricFileName: rubric ? rubric.originalname : null
    });
    res.redirect('/faculty/' + submission.id + '/confirm');
  } catch (err) { next(err); }
});

app.get('/faculty/:id/confirm', async function(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: Course, include: [{ model: Competency, through: { where: { type: 'Primary' } } }] }]
    });
    if (!submission) return next(createError(404));
    const sub = submission.toJSON();
    sub.createdAt = new Date(submission.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    res.render('confirm', {
      title: 'Submission Confirmed',
      submission: sub,
      course: submission.Course,
      competencies: submission.Course.Competencies
    });
  } catch(err) { next(err); }
});

app.get('/faculty/:id/template', async function(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: Course, include: [{ model: Competency, through: { where: { type: 'Primary' } } }] }]
    });
    const headers = ['studentId', ...submission.Course.Competencies.map(c => c.name)];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="scores_${submission.Course.code}_${submission.semester}.csv"`);
    res.send(headers.join(',') + '\n');
  } catch(err) { next(err); }
});

app.post('/faculty/:id/scores', upload.single('csvFile'), async function(req, res, next) {
  try {
    const lines = req.file.buffer.toString().split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const competencyNames = headers.slice(1);
    const comps = await Competency.findAll({ where: { name: competencyNames } });
    console.log('Found comps:', comps.length, 'for names:', competencyNames);
    const compMap = {};
    comps.forEach(c => { compMap[c.name] = c.id; });

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const studentId = values[0];
      if (!studentId) continue;
      for (let j = 1; j < values.length; j++) {
        const score = parseInt(values[j]);
        const compName = headers[j];
        console.log(studentId, compName, score, !!compMap[compName]);
        if (!score || !compMap[compName]) continue;
        await StudentScore.create({ studentID:studentId, score, SubmissionId: req.params.id, CompetencyId: compMap[compName] });
      }
    }
    await Submission.update({ status: 'Submitted' }, { where: { id: req.params.id } });
    res.redirect('/faculty/' + req.params.id + '/confirm');
  } catch(err) { next(err); }
});


app.get('/faculty/:id/syllabus', async function(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission || !submission.syllabusFile) return next(createError(404));
    res.setHeader('Content-Disposition', `attachment; filename="${submission.syllabusFileName}"`);
    res.send(submission.syllabusFile);
  } catch(err) { next(err); }
});

app.get('/faculty/:id/rubric', async function(req, res, next) {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission || !submission.rubricFile) return next(createError(404));
    res.setHeader('Content-Disposition', `attachment; filename="${submission.rubricFileName}"`);
    res.send(submission.rubricFile);
  } catch(err) { next(err); }
});

app.get('/admin', async function(req, res, next) {
  try {
    const totalSubmissions = await Submission.count();
    const pendingCount = await Submission.count({ where: { status: 'Pending' } });
    const completeCount = await Submission.count({ where: { status: 'Complete' } });
    const totalScores = await StudentScore.count();

    const scoresByCompetency = await StudentScore.findAll({
      attributes: [
        'CompetencyId',
        [sequelize.fn('AVG', sequelize.col('score')), 'avgScore']
      ],
      include: [{ model: Competency, attributes: ['name', 'domain'] }],
      group: ['CompetencyId', 'Competency.id'],
      order: [[sequelize.fn('AVG', sequelize.col('score')), 'DESC']],
      raw: true,
      nest: true
    });

    const teachingStats = await Submission.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('higherTeachingPct')), 'avgHigherTeaching'],
        [sequelize.fn('AVG', sequelize.col('lowerTeachingPct')), 'avgLowerTeaching'],
        [sequelize.fn('AVG', sequelize.col('higherAssessmentPct')), 'avgHigherAssessment'],
        [sequelize.fn('AVG', sequelize.col('lowerAssessmentPct')), 'avgLowerAssessment']
      ],
      raw: true
    });

    res.render('admin', {
      title: 'Admin Dashboard',
      totalSubmissions,
      pendingCount,
      completeCount,
      totalScores,
      scoresJSON: JSON.stringify(scoresByCompetency),
      teachingJSON: JSON.stringify(teachingStats[0])
    });
  } catch(err) { next(err); }
});

app.get('/tracker', async function(req, res, next) {
  try {
    const submissions = await Submission.findAll({
      include: [Course],
      order: [['semester', 'ASC'], ['createdAt', 'DESC']]
    });

    const semesterMap = {};
    submissions.forEach(s => {
      const sub = s.toJSON();
      sub.hasDocuments = !!sub.syllabusFileName;
      sub.hasScores = sub.status === 'Submitted';
      sub.isCompleted = sub.hasDocuments && sub.hasScores;
      sub.isAttention = !sub.hasDocuments;
      sub.isPending = sub.hasDocuments && !sub.hasScores;

      if (!semesterMap[sub.semester]) {
        semesterMap[sub.semester] = { semester: sub.semester, submissions: [] };
      }
      semesterMap[sub.semester].submissions.push(sub);
    });

    res.render('tracker', {
      title: 'Submission Tracker',
      semesters: Object.values(semesterMap)
    });
  } catch(err) { next(err); }
});

app.get('/:name', function (req, res, next) {
  res.render('index', { title: req.params.name });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

