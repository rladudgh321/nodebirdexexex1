const passport = require('passport');
const bcrypt = require('bcrypt');
const {Strategy : LocalStrategy} = require('passport-local');
const { User } = require('../models');

module.exports = () => {
    passport.use('local', new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:false,
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ where : { email } });
            if(user) {
                const result = await bcrypt.compare(password, user.password);
                if(result) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: '비밀번호가 틀렸습니다' });
                }
            } else {
                return done(null, false, { message: '이메일이 유효하지 않습니다' })
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    }))
}