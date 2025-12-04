const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', profile);
      
      // Check if user exists
      let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if email already exists
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.oauthId = profile.id;
        user.oauthProvider = 'google';
        user.isEmailVerified = true; // Google emails are verified
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        oauthId: profile.id,
        oauthProvider: 'google',
        isEmailVerified: true,
        role: 'customer'
      });
      
      done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      done(error, null);
    }
  }
));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Facebook OAuth Profile:', profile);
      
      // Check if user exists
      let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'facebook' });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if email already exists
      if (profile.emails && profile.emails[0]) {
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Link Facebook account to existing user
          user.oauthId = profile.id;
          user.oauthProvider = 'facebook';
          user.isEmailVerified = true;
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : `fb_${profile.id}@dhpharmacy.com`,
        oauthId: profile.id,
        oauthProvider: 'facebook',
        isEmailVerified: true,
        role: 'customer'
      });
      
      done(null, user);
    } catch (error) {
      console.error('Facebook OAuth Error:', error);
      done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
