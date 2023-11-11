const { User, Post } = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');

exports.signup = async (req, res, next) => { // POST /user/signup
    try { 
        const { email, password, nick } = req.body;
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            password:hash,
            nickname:nick,
        });
        return res.status(201).json({data:'ok'});
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.error(err);
            return next(err);
        }
        if(info) {
            return res.status(404).send(info.message);
        }
        return req.login(user, async (err) => {
            if(err) {
                console.error(err);
                return next(err);
            }
            try {
                const fullUser = await User.findOne({ 
                    where: { id: user.id },
                    include: [{
                        model:User,
                        as:'Followings',
                        attributes:['id','nickname'],
                    }, {
                        model:User,
                        as:'Followers',
                        attributes:['id','nickname'],
                    }, {
                        model:Post,
                        attributes:['id']
                    }]
                });
                res.status(200).json(fullUser);
            } catch (err) {
                console.error(err);
            }
        });
    })(req,res,next);
}

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            console.error(err);
            next(err);
        }
        req.session.destroy();
        return res.send('ok');
    });
}

exports.loadMyInfo = async (req, res, next) => {
    try {
        if(req.user) {
            const user = await User.findOne({ 
                where : { id: req.user.id },
                attributes:{
                    exclude:['password'],
                },
                include:[{
                    model:Post,
                    attributes:['id'],
                }, {
                    model:User,
                    as:'Followings',
                    attributes:['id','nickname']
                }, {
                    model:User,
                    as:'Followers',
                    attributes:['id','nickname']
                }]
            });
            res.status(200).json(user);
        } else {
            res.status(200).json(null);
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.follow = async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { id: parseInt(req.params.userId, 10)},
            include:[{
                model:User,
                as:'Followers',
                attributes:['id', 'nickname'],
            }, {
                model:User,
                as:'Followings',
                attributes:['id','nickname'],
            }]
        });
        if(!user) {
            return res.status(403).send('존재하지 않은 사용자입니다');
        }
        await user.addFollowers(req.user.id);
        return res.status(200).json({id: parseInt(req.params.userId, 10), nickname: user.nickname});
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.unfollow = async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { id: parseInt(req.params.userId, 10)},
            include:[{
                model:User,
                as:'Followers'
            }]
        });
        if(!user) {
            return res.status(403).send('존재하지 않은 사용자입니다');
        }
        await user.removeFollowers(req.user.id);
        return res.status(200).json(parseInt(req.params.userId, 10));
    } catch (err) {
        console.error(err);
        next(err);
    }
}


exports.removefollower = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: parseInt(req.params.userId, 10) }
        });
        if(!user) {
            return res.status(200).send('존재하지 않은 사용자입니다');
        }
        await user.removeFollowings(req.user.id);
        return res.status(200).json(parseInt(req.params.userId, 10));
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.changeNickname = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if(!user) {
            return res.status(403).send('존재하지 않은 사용자의 이름을 바꿀 수 없습니다');
        }
        await User.update({ 
            nickname: req.body.nickname,
        }, {
            where: { id: req.user.id }
        });
        return res.status(200).json(req.body.nickname);
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.loadUser = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: parseInt(req.params.userId, 10) },
            include:[{
                model:Post
            }, {
                model: User,
                as: 'Followings',
                attributes:['id'],
            }, {
                model:User,
                as:'Followers',
                attributes:['id'],
            }]
        })
        if(!user) {
            return res.status(403).send('없는 사용자입니다');
        }
        const data = user.toJSON();
        data.Posts = data.Posts.length;
        data.Followings = data.Followings.length;
        data.Followers = data.Followers.length;
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        next(err);
    }
}