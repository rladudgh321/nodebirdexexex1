const { Post, User, Image, Hashtag, Comment } = require('../models');

exports.addpost = async (req, res, next) => {
    try {
        const post = await Post.create({
            content:req.body.content,
            UserId:req.user.id,
        });
        const hashtag = req.body.content.match(/#[^\s#]+/g);
        if(hashtag) {
            const result = await Promise.all(hashtag.map((tag) => Hashtag.findOrCreate({
                where: { name: tag.slice(1).toLowerCase() }
            })));
            post.addHashtags(result.map((v)=>v[0]));
        }
        
        if(req.body.images) {
            if(Array.isArray(req.body.images)) {
                const images = await Promise.all(req.body.images.map((images) => Image.create({ src: images })));
                await post.addImages(images);                
            } else {
                const image = await Image.create({ src: req.body.images });
                await post.addImages(image);
            }
        }

        const fullPost = await Post.findOne({
            where : { id: post.id },
            order:[['createdAt', 'DESC']],
            include:[{
                model:Post,
                as:'Retweet',
                attributes:['id'],
                include:[{
                    model:Image,
                }],
            }, {
                model:Comment,
                attributes:['id', 'content'],
                include:[{
                    model:User,
                    attributes:['id','nickname'],
                }],
            }, {
                model: User,
                as:'Likers',
                attributes:['id'],
            },{
                model:User,
                attributes:['id', 'nickname']
            }, {
                model:Hashtag
            }, {
                model:Image
            }],
        });
        return res.status(201).json(fullPost);
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.addcomment = async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: parseInt(req.params.postId, 10) } });
            if(!post) {
                return res.status(404).send('게시글을 찾을 수 없습니다');
            } 
        const comment = await Comment.create({
            content: req.body.content,
            UserId: req.user.id,
            PostId: parseInt(req.params.postId, 10),           
        });
        const fullComment = await Comment.findOne({ 
            where: { id: comment.id },
            order:[['createdAt', 'DESC']],
            attributes:['id', 'content'],
            include:[{
                model:User,
                attributes:['id','nickname'],
            },{
                model:Post,
                attributes:['id']
            }],
        });
        return res.status(201).json(fullComment);
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.imagesUpload = (req, res, next) => {
    res.status(200).json(req.files.map((v) => v.filename));
}

exports.likePost = async (req, res, next) => {
    try {
        const post = await Post.findOne({ 
            where: { id: parseInt(req.params.postId, 10) },
            incldue:[{
                model:User,
                as:'Likers',
                attributes:['id']
            }, {
                model:Image,
            }]
     });
     if(!post) {
        return res.status(403).send('존재하지 않은 게시글 입니다');
     }
     await post.addLikers(req.user.id);
     return res.status(200).json({ UserId:req.user.id, PostId:parseInt(req.params.postId, 10) });
    } catch(err) {
        console.error(err);
        next(err);
    }
}

exports.unlikePost = async (req, res, next) => {
    try {
        if(req.user) {
            const post = await Post.findOne({ 
                where: { id: parseInt(req.params.postId, 10) },
                incldue:[{
                    model:User,
                    as:'Likers',
                    attributes:['id']
                }]
            });
            if(!post) {
                return res.status(403).send('존재하지 않은 게시글 입니다');
            }
            await post.removeLikers(req.user.id);
            return res.status(200).json({ UserId:req.user.id, PostId:parseInt(req.params.postId) });
        } else {
            return res.status(401).send('로그인이 되어 있지 않습니다');   
        }
    } catch(err) {
        console.error(err);
        next(err);
    }
}

exports.retweet = async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: { id: req.params.postId },
            include:[{
                model:Post,
                as:'Retweet',
                //attributes 건들여보자
            }],
        });
        if(!post) {
            return res.status(403).send('게시글이 존재하지 않습니다');
        }
        if(post.UserId === req.user.id || (post.Retweet && post.Retweet.UserId === req.user.id)) {
            return res.status(403).send('자신의 글을 리트윗 할 수 없습니다');
        }
        const retweetTargetId = post.RetweetId || post.id;
        const exPost = await Post.findOne({
            where: { 
                UserId: req.user.id,
                RetweetId: retweetTargetId
            },
        });
        if(exPost) {
            return res.status(403).send('이미 리트윗 했습니다');
        }

        const retweet = await Post.create({
            content:'retweet',
            UserId:req.user.id,
            RetweetId:retweetTargetId,
        });

        const fullRetweet = await Post.findOne({
            where: { id: retweet.id },
            include:[{
                model:Post,
                as:'Retweet',
                include:[{
                    model:User,
                    attributes:['id','nickname'],
                }, {
                    model:Image
                }]
            },{
                model:User,
                attributes:['id','nickname']
            },{
                model:User,
                as:'Likers',
                attributes:['id'],
            },{
                model:Image
            }, {
                model:Comment,
                include:[{
                    model:User,
                    attributes:['id','nickname'],
                }]
            }]
        });
        return res.status(201).json(fullRetweet);
    } catch (err) {
        console.error(err);
        next(err);
    }
}

exports.removePost = async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: { id: parseInt(req.params.postId) }
        });
        if(!post) {
            return res.status(403).send('존재하지 않는 게시글입니다');
        }
        await Post.destroy({
            where : { id: parseInt(req.params.postId) }
        })
        return res.status(200).json(parseInt(req.params.postId));
    } catch (err) {
        console.error(err);
        next(err);
    }
}  

exports.loadPost = async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: parseInt(req.params.postId) } });
        if(!post) {
            return res.status(403).send('존재하지 않은 게시글입니다');
        }
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include:[{
                model:Image,
            }, {
                model:Post,
                as:'Retweet',
                include:[{
                    model:Image,
                }]
            }, {
                model: User,
                as:'Likers',
                attributes:['id','nickname'],
            }, {
                model:Comment,
                include:[{
                    model:User,
                    attributes:['id','nickname'],
                }]
            }, {
                model:User,
                attributes:['id', 'nickname']
            }]
        });
        return res.status(200).json(fullPost);
    } catch (err) {
        console.error(err);
        next(err);
    }
}
