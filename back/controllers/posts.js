const { Post, Image, Comment, User } = require('../models');
const { Op } = require('sequelize');

exports.loadPosts = async (req, res, next) => {
    try {
        const where = {};
        if(parseInt(req.query.lastId, 10)) {
            console.log('11111111111111111111111111',req.query.lastId)
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }
        }
        const posts =  await Post.findAll({
            where,
            limit:10,
            order: [['createdAt', 'DESC'], [Comment,'createdAt', 'DESC'] ],
            include:[{
                model:User,
                attributes:['id', 'nickname']
            },{
                model:Post,
                as:'Retweet',
                include:[{
                    model:User,
                    attributes:['id','nickname']
                }, {
                    model:Image
                }]
            }, {
                model:Image,
            }, {
                model: User,
                as:'Likers',
                attributes:['id'],
            }, {
                model: Comment,
                attributes:['id', 'content', 'PostId'],
                include:[{
                    model:User,
                    attributes:['id', 'nickname'],
                },{
                    model:Post,
                    attributes:['id']
                }]
            }]
        });
        return res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        next(err);
    }
}