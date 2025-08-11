var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: __dirname + '/.env'});
var cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { CronJob } = require('cron');
var conn = require('./db');

const stats = require('./helpers/stats');

var engine  = require('./helpers/engine');
var engine_20quest  = require('./helpers/engine_20quest');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tablesRouter = require('./routes/tables');
var mailingRouter = require('./routes/mailing');
var verifyRouter = require('./routes/verify');
var stripeRouter = require('./routes/stripe');
var questionsRouter = require('./routes/questions');
var uploaderRouter = require('./routes/uploader');
var blobRouter = require('./routes/blob');
var apisRouter = require('./routes/apis');

var app = express();

//cors options
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
}

//app.options('*', cors(corsOptions)) // include before other routes
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(passport.initialize());

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    //console.log('local strategy =============================');
    var sqlstr = 'SELECT * FROM users WHERE email=\'' + email + '\'';
    conn.query(sqlstr, function (err,rows){
      if(err) {
        done(err);
      }
      else if (rows.length == 0) {
        //console.log('user not found');
        return done(null, false, { 
          //status: 'error',
          message: 'User not found' });
      }
      else if (rows[0].email == email && rows[0].password != password) {
        //console.log('password is incorrect');
        return done(null, false, { 
          //status: 'error',
          message: 'Password is incorrect' });
      }
      /*
      else if (rows[0].email == email && rows[0].password == password && rows[0].has_been_approved != true) {
        //console.log('password is incorrect');
        return done(null, false, { message: 'Account not approved.' });
      }
      */
      else if (rows[0].email == email && rows[0].password == password) {
        //console.log('everything ok');
        var user = rows[0];
        
        // Create token
        /*
        const token = jwt.sign(
          { user_id: user.id, email: user.email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        user.token = token;
        */
        return done(null, user);
      }
      conn.getConnection( function(err, connection){
        connection.release();
      });
    });
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
  //console.log('passport.deserialize id=',id);
  var sqlstr = 'SELECT * FROM users WHERE user_id=' + id;
    conn.query(sqlstr, function (err,rows){
      if(err) {
        console.log('err', err);
        done(err, false);
      }
      else done(null, rows[0]);
      conn.getConnection( function(err, connection){
        connection.release();
      });
    });
});

app.post('/login', (req, res, next) => {
  //console.log('app.post /login');
  passport.authenticate('local', (err, user, info) => {

    if (info) {return res.status(201).send(info)}
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    
    req.login(user, (err) => {
      if (err) { return next(err); }
      res.status(200).send(user);
    })
  
  })(req, res, next);
})


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tables', tablesRouter);
app.use('/mailing', mailingRouter);
app.use('/verify',verifyRouter);
app.use('/stripe',stripeRouter);
app.use('/questions',questionsRouter);
app.use('/uploader',uploaderRouter);
app.use('/blob', blobRouter);
app.use('/apis', apisRouter);

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

app.get('/', function(req, res) {
  res.send('Hello World from Sportz-Battle Server! We are alive and well!');
});

// Schedule a task at midnight Pacific Time
/*
cron.schedule('0 0 * * *', () => {
  //check daily winner
  stats.checkDailyWinner();

}, {
  timezone: "America/Los_Angeles" // Set the timezone to Pacific Time
});
*/

const job1 = new CronJob('0 0 * * *', () => {
  if (process.env.ENVIRONMENT == 'production') stats.checkDailyWinner();
}, {
  timezone: "America/Los_Angeles" // Set the timezone to Pacific Time
});



//start a quest20 game every 30 minutes
const job2 = new CronJob('*/30 * * * *', () => {
  if (true || process.env.ENVIRONMENT == 'production') engine_20quest.start();
}, {
  timezone: "America/Los_Angeles" // Set the timezone to Pacific Time
});


job1.start();
job2.start();

engine.start();
/*
setTimeout(() => {
engine_20quest.start();
},1000);
*/

//stats.checkDailyWinner();
module.exports = app;
