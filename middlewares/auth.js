const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');//handles autentication
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models').User;

function passwordsMatch(passwordSubmitted, storedPassword) {
  return bcrypt.compareSync(passwordSubmitted, storedPassword);
}

passport.use(new LocalStrategy({
    usernameField: 'email',
  },
  (email, password, done) => {
    User.findOne({
      where: { email },
    }).then((user) => {
      if(!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      if (passwordsMatch(password, user.password) === false) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, user, { message: 'Successfully Logged In!' });
    });
  })
);

//to remember that user is logged in
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  });
});

passport.redirectIfLoggedIn = (route) =>
  (req, res, next) => (req.user ? res.redirect(route) : next());

passport.redirectIfNotLoggedIn = (route) =>
  (req, res, next) => (req.user ? next() : res.redirect(route));

module.exports = passport;