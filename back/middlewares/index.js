exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).send('로그인 해야 이용 하실 수 있습니다');
    }
};

exports.isNotLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).send('로그인 한 상태에서 할 수 없습니다');
    }
}