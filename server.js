require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDBStore = require('connect-mongo')


//Database connection
//const url = 'mongodb://localhost/pizza';
mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true,useCreateIndex:true, useUnifiedTopology:true, useFindAndModify:true});
const connection = mongoose.connection;
connection.once('open',()=>{
    console.log('Database connected');
}).catch(err=>{
    console.log('Connection Failed')
});

const PORT = process.env.PORT || 3000



//Session store
// let mongoStore = new MongoDBStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })

//Session  config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDBStore.create({
        mongoUrl: process.env.MONGO_CONNECTION_URL
    }),
    saveUninitialized: false,
    cookie:{maxAge: 1000*60*60*24} //24hours

}))

app.use(flash())
app.use(express.json())


//Global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    next()

})


//Assests
app.use(express.static('public'))

//set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)





app.listen( PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})