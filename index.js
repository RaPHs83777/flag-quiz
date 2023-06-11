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
const Session = require('./models/Session')
const Sequelize = require('sequelize')

const bcrypt = require('bcrypt')

// Cookies
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')

const routes = require('./routes');


app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.use(async(req, res, next)=>{
    let sessionId = req.cookies.session
    let session = sessionId // undefined
    // if(sessionId){
    //     session = await Session.findOne({where: {SessionId: sessionId}})
    // }else{
    //     res.redirect('/login')
    // }
    if(session != undefined || urls.liberadas.includes(req.url)){
        next()
    }else{
        res.redirect('/login')
    }
})

function gerarCodigoSession(){
    let codigo = ''
    let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$#'

    for(let i = 0; i < 8; i++){
        let indice = Math.floor(Math.random() * caracteres.length)
        codigo += caracteres.charAt(indice)
    }
    return codigo
}

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
    res.redirect('/home')
})

app.get('/home', (req, res)=>{
    res.render('home')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/cadastrar', (req, res)=>{
    res.render('cadastrarse')
})

app.get('/')

app.get('/teste', (req, res)=>{
    encriptarSenha('123').then(hash=>{
        console.log(hash)
    })
})

app.get('/perfil', async (req, res)=>{
    let sessionId = req.cookies.session
    
    let session = await Session.findOne({
        attributes: ['UserId'],
        where: {
            SessionId: sessionId
        }
    })
    
    let user = await Users.findOne({
        where: {
            Id: session.UserId
        }
    })

    res.render('perfil', {User: user})
})

app.get('/sair', async (req, res)=>{
    let session = req.cookies.session
    Session.destroy({
        where: {
            SessionId: session
        }
    }).then(numRowsDeleted => {
        console.log(`${numRowsDeleted} Linhas Deletadas`)
    }).catch(err=>{
        console.error('Deu erro: ', err)
    })
    Object.keys(req.cookies).forEach((cookie)=>{
        res.clearCookie(cookie)
    })
    res.redirect('/')
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
                let codigoSession = gerarCodigoSession()
                let session = Session.findOne({Where: {SessionId: codigoSession}})
                if(!session){
                    return
                }
                res.cookie('session', codigoSession, {httpOnly: true})
                Session.create({
                    UserId: user.Id,
                    SessionId: codigoSession
                })
                res.redirect('/')
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