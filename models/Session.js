const Sequelize = require('sequelize')
const db = require('./db')

const Session = db.define('Session', {
    Id:{
        type: Sequelize.STRING,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    UserId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    SessionId: {
        type: Sequelize.STRING,
        allowNull: false
    }
})