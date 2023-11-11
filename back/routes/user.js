const express = require('express');
const router = express.Router();

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

const { signup, login, logout, loadMyInfo, follow, unfollow, removefollower,
    changeNickname, loadUser
} = require('../controllers/user');

router.post('/signup', isNotLoggedIn, signup);
router.post('/login', isNotLoggedIn, login);
router.post('/logout', isLoggedIn, logout);
router.post('/changeNickname', isLoggedIn, changeNickname);
router.get('/', loadMyInfo);
router.get('/:userId', loadUser);
router.post('/:userId/follow', isLoggedIn, follow);
router.delete('/:userId/removefollower', isLoggedIn, removefollower);
router.delete('/:userId/follow', isLoggedIn, unfollow);

module.exports = router;