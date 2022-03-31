import Sequelize from 'sequelize';
import sequelize from '../database/database'

const Transaction = sequelize.define('Transactions', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    businessId: {
        type: Sequelize.INTEGER
    },
    businessUserId: {
        type: Sequelize.INTEGER
    },
    paymentRequestId: {
        type: Sequelize.INTEGER
    },
    creationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    status: {
        type: Sequelize.STRING
    },
    closingId: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false
});

export default Transaction;