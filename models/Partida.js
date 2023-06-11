const Sequelize = require('sequelize')
const db = require('./db')

const Partida = db.define('partida', {
    Id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    PartidaId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    CreateBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    UserLimite: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});