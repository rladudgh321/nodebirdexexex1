const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

const { addpost, addcomment, imagesUpload, likePost, unlikePost, retweet,
    removePost, loadPost
} = require('../controllers/post');

try {
    fs.accessSync('uploads');
} catch (err) {
    console.log('uploads폴더가 없어서 생성합니다');
    fs.mkdirSync('uploads');
}

const uploads = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, 'uploads')
        },
        filename(req,file,done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);            
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/images', isLoggedIn, uploads.array('images'), imagesUpload);
router.post('/addpost', isLoggedIn, addpost);

///post/${data.postId}/comment
router.post('/:postId/comment', isLoggedIn, addcomment);
router.post('/:postId/retweet', isLoggedIn, retweet);
router.patch(`/:postId/like`, isLoggedIn, likePost);
router.delete(`/:postId/like`, isLoggedIn, unlikePost);
router.delete('/:postId', isLoggedIn, removePost);
router.get('/:postId', loadPost);

module.exports = router;