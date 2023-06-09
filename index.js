const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
// const fetch = require('node-fetch')
// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const urls = require('./urls')

const port = 80, ipv4 = '192.168.0.10'

const apiAll = 'https://restcountries.com/v3.1/all'

// DB
const Users = require('./models/User')

const bcrypt = require('bcrypt')

// Cookies
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')

const routes = require('./routes');
const { match } = require('assert');

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.use(async(req, res, next)=>{
    let session = req.cookies.session
    if(session != undefined || urls.liberadas.includes(req.url)){
        next()
    }else{
        res.redirect('/login')
    }
})


async function encriptarSenha(senha){
    try{
        const saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const hash = await bcrypt.hash(senha, salt)
        return hash
    }catch(err){
        console.error('Erro ao encriptar senha: ', err)
        throw err
    }
}

async function verificarSenha(senha, dbSenha){
    console.log(senha, dbSenha)
    try{
        const match = await bcrypt.compare(senha, dbSenha)
        return match
    }catch(err){
        console.log('Erro: ', err)
        throw err
    }
}

// app.use('/', routes)

// gets
app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/cadastrar', (req, res)=>{
    res.render('cadastrarse')
})

app.get('/teste', (req, res)=>{
    encriptarSenha('123').then(hash=>{
        console.log(hash)
    })
})

// posts
app.post('/verificarlogin', async (req, res)=>{
    let email = req.body.email
    let senha = req.body.senha
    console.log(email, senha)
    let user = await Users.findOne({Where: {Email: email}})
    if(user){
        verificarSenha(senha, user.Senha).then(match => {
            if(match){
                console.log('Senha tá igual po')
            }else{
                res.redirect('/login')
            }
        })
    }else{
        res.redirect('/login')
    }
})

app.post('/verificarcadastro', async (req, res)=>{
    let nome = req.body.nome
    let email = req.body.email
    let senha = req.body.senha
    let confsenha = req.body.confsenha
    let user = await Users.findOne({Where: {Email: email}})
    if(!user){
        if(senha != confsenha){
            res.redirect('/cadastrar')
        }else{
            encriptarSenha(senha).then(hash=>{
                try{
                    Users.create({
                        Nome: nome,
                        Email: email,
                        Senha: hash
                    }).then(()=>{
                        res.redirect('/login')
                    })
                }catch(err){
                    console.log(err)
                    throw err
                }
            })
            
            
            
        }
    }
})

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