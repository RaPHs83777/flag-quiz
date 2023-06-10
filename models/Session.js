const Sequelize = require('sequelize')
const db = require('./db')

const Session = db.define('session', {
    Id:{
        type: Sequelize.INTEGER,
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

// Session.sync()

module.exports = Session