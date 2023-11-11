const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const cors = require('cors');
dotenv.config();

const app = express();

app.set('port', process.env.NODE_ENV || 3065);
app.use('/images', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors({
   origin:true,
   credentials:true, 
}))

app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));

const passport = require('passport');
const passportConfig = require('./passport');
app.use(passport.initialize());
app.use(passport.session());
passportConfig();

sequelize.sync({force:false})
    .then(()=>{
        console.log('DB Connecting Success')
    })
    .catch ((err)=>{
        console.error(err);
    });

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 대기 중입니다');
});