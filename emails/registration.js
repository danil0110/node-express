const keys = require('../keys');

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Регистрация аккаунта',
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Аккаунт был успешно зарегистрирован на email - ${email}</p>
            <hr />
            <a href="${keys.BASE_URL}">Перейти к магазину</a>
        `
    }
}