const express = require('express');
const router = express();

const { loadPosts } = require('../controllers/posts');

router.get('/', loadPosts);

module.exports = router;