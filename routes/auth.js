const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const keys = require('../keys');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const router = Router();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USERNAME,
		pass: process.env.GMAIL_PASSWORD,
	},
});

router.get('/login', async (req, res) => {
	res.render('auth/login', {
		title: 'Авторизация',
		isLogin: true,
		loginError: req.flash('loginError'),
		registerError: req.flash('registerError'),
	});
});

router.get('/logout', async (req, res) => {
	req.session.destroy(() => {
		res.redirect('/auth/login#login');
	});
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const candidate = await User.findOne({ email });
		if (candidate) {
			const areSame = await bcrypt.compare(password, candidate.password);

			if (areSame) {
				req.session.user = candidate;
				req.session.isAuthenticated = true;
				req.session.save(err => {
					if (err) {
						throw err;
					}
					res.redirect('/');
				});
			} else {
				req.flash('loginError', 'Неверный пароль.');
				res.redirect('/auth/login#login');
			}
		} else {
			req.flash('loginError', 'Такого пользователя не существует.');
			res.redirect('/auth/login#login');
		}
	} catch (e) {
		console.log(e);
	}
});

router.post('/register', async (req, res) => {
	try {
		const { name, email, password, confirm } = req.body;
		const candidate = await User.findOne({ email });
		if (candidate) {
			req.flash('registerError', 'Пользователь с таким email уже существует.');
			res.redirect('/auth/login#register');
		} else if (password === confirm) {
			const hashPassword = await bcrypt.hash(password, 10);
			const newUser = new User({
				email,
				name,
				password: hashPassword,
				cart: { items: [] },
			});
			await newUser.save();
			res.redirect('/auth/login#login');
			await transporter.sendMail(regEmail(email));
		} else {
			req.flash('registerError', 'Пароли не совпадают, повторите попытку.');
			res.redirect('/auth/login#register');
		}
	} catch (e) {
		console.log(e);
	}
});

router.get('/reset', (req, res) => {
	res.render('auth/reset', {
		title: 'Забыли пароль?',
		error: req.flash('error'),
	});
});

router.get('/password/:token', async (req, res) => {
	if (!req.params.token) {
		return res.redirect('/auth/login');
	}

	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: { $gt: Date.now() },
		});

		if (!user) {
			res.redirect('auth/password', {
				title: 'Восстановление доступа',
				error: req.flash('error'),
				userId: user._id.toString(),
				token: req.params.token,
			});
		}

		res.render('auth/password', {
			title: 'Забыли пароль?',
			userId: user._id.toString(),
			token: req.params.token,
			error: req.flash('error'),
		});
	} catch (e) {
		console.log(e);
	}
});

router.post('/reset', (req, res) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if (err) {
				req.flash('error', 'Что-то пошло не так, повторите попытку позже.');
				return res.redirect('/auth/reset');
			}

			const token = buffer.toString('hex');
			const candidate = await User.findOne({ email: req.body.email });

			if (candidate) {
				candidate.resetToken = token;
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; // 1 час
				await candidate.save();
				await transporter.sendMail(resetEmail(candidate.email, token));
				res.redirect('/auth/login');
			} else {
				req.flash('error', "Такого email'а не существует.");
				res.redirect('/auth/reset');
			}
		});
	} catch (e) {
		console.log(e);
	}
});

router.post('/password', async (req, res) => {
	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: { $gt: Date.now() },
		});

		if (user) {
			user.password = await bcrypt.hash(req.body.password, 10);
			user.resetToken = undefined;
			user.resetTokenExp = undefined;
			await user.save();
			res.redirect('/auth/login');
		} else {
			req.flash('loginError', 'Время жизни токена истекло');
			res.redirect('/auth/login');
		}
	} catch (e) {
		console.log(e);
	}
});

module.exports = router;
