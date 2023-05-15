const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
// const fetch = require('node-fetch')
// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const port = 80, ipv4 = '192.168.0.10'

const apiAll = 'https://restcountries.com/v3.1/all'

// Cookies
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')

const routes = require('./routes')

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.use(async(req, res, next)=>{
    next()
})


app.use('/', routes)


let i = 1

io.on('connection', socket => {
    socket.emit('ServerConnection', 'Hello From The Server')
    
    socket.on('flags', (msg)=>{
        i++
        console.log(msg)
        fetch(apiAll).then(
            response => response.json()
        ).then(data=>{
            // Brasil = 115
            socket.emit('flags', data[i])
        })
    })
})



http.listen(port, ipv4, ()=>{
    console.log(`Servidor iniciado: http://${ipv4}:${port}`)
})