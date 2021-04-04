const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const path = require('path');

const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const addRoutes = require('./routes/add');

const User = require('./models/user');

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');


app.use(async (req, res, next) => {
    try {
        const user = await User.findById('606a041ff4d5b57e6b6aa0f8');
        req.user = user;
        next();
    } catch (e) {
        console.log(e);
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);


const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const url = 'mongodb+srv://danil0110:oEADX8zLPqBYFiRF@cluster0.8iyiy.mongodb.net/shop';
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: 'test@gmail.com',
                name: 'John Week',
                cart: {items: []}
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}...`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();