var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: __dirname + '/.env'});
var cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var cron = require('node-cron');
var conn = require('./db');

var engine  = require('./helpers/engine');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tablesRouter = require('./routes/tables');
var sendgridRouter = require('./routes/sendgrid');
var verifyRouter = require('./routes/verify');
var stripeRouter = require('./routes/stripe');
var questionsRouter = require('./routes/questions');
var uploaderRouter = require('./routes/uploader');

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
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //console.log('passport.deserialize id=',id);
  var sqlstr = 'SELECT * FROM users WHERE id=' + id;
    conn.query(sqlstr, function (err,rows){
      if(err) done(err, false)
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
app.use('/sendgrid', sendgridRouter);
app.use('/verify',verifyRouter);
app.use('/stripe',stripeRouter);
app.use('/questions',questionsRouter);
app.use('/uploader',uploaderRouter);

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

cron.schedule('0 8 * * *', () => {
  //renewals.sendRenewalNotices();
});

engine.start();


module.exports = app;
