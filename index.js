const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');

const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const addRoutes = require('./routes/add');

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);


const PORT = process.env.PORT || 3000;

async function start() {
    try {
        const url = 'mongodb+srv://danil0110:oEADX8zLPqBYFiRF@cluster0.8iyiy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
        await mongoose.connect(url, {useNewUrlParser: true});
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}...`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();