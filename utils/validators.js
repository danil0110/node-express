const { body } = require('express-validator/check');
const User = require('../models/user');

exports.registerValidators = [
	body('email')
		.isEmail()
		.withMessage('Введите корректный email')
		.custom(async (value, { req }) => {
			try {
				const candidate = await User.findOne({ email: value });
				if (candidate) {
					return Promise.reject('Пользователь с таким email уже зарегистрирован');
				}
			} catch (e) {
				console.log(e);
			}
		}),
	body('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6, max: 56 }).isAlphanumeric(),
	body('confirm').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Пароли должны совпадать');
		}

		return true;
	}),
	body('name').isLength({ min: 3 }).withMessage('Минимальная длина имени 3 символа'),
];
