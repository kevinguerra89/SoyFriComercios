import Sequelize from 'sequelize';
import sequelize from '../database/database'

const Closing = sequelize.define('Closings', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    closingDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    completionDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    userId: {
        type: Sequelize.INTEGER
    },
    format: {
        type: Sequelize.STRING
    },
    amount: {
        type: Sequelize.DECIMAL
    },
    status: {
        type: Sequelize.STRING
    },
    transactions: {
        type: Sequelize.INTEGER
    },
    completions: {
        type: Sequelize.INTEGER
    },
    cancelations: {
        type: Sequelize.INTEGER
    },
    rejections: {
        type: Sequelize.INTEGER
    },
    refunds: {
        type: Sequelize.INTEGER
    },
}, {
    timestamps: false
});

export default Closing;