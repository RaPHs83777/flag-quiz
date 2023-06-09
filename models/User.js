const Sequelize = require('sequelize')
const db = require('./db')

const Users = db.define('users', {
    Id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    Nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Senha: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Users.sync()

module.exports = Users