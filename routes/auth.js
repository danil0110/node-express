const {Router} = require('express');
const User = require('../models/user');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true
    });
});

router.post('/login', async (req, res) => {
    const user = await User.findById('606a041ff4d5b57e6b6aa0f8');
    req.session.user = user;
    req.session.isAuthenticated = true;
    req.session.save((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

module.exports = router;