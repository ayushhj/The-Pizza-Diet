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
const passport = require('passport')
const Emitter = require('events')

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


// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

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

//Passport config
const passportInit = require('./app/config/passport')
//const { Passport } = require('passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())






app.use(flash())
app.use(express.urlencoded({extended:false}))
app.use(express.json())


//Global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()

})


//Assests
app.use(express.static('public'))

//set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)





const server  = app.listen( PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
          //console.log(orderId)
        socket.join(orderId)
      })
}) 

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})