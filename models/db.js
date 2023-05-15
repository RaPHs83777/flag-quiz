const Sequelize = require('sequelize')

const conn = new Sequelize("flag_quiz", "root", "12345678", {
    host: 'localhost',
    dialect: 'mysql'
})

conn.authenticate().then(()=>{
    console.log('BD Connect')
}).catch((err)=>{
    console.log('BD Error: ' + err)
})

module.exports = conn