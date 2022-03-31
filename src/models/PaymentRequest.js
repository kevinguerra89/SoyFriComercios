import Sequelize from 'sequelize';
import sequelize from '../database/database'

const PaymentRequest = sequelize.define('PaymentRequests', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    friUserId: {
        type: Sequelize.INTEGER
    },
    reference: {
        type: Sequelize.INTEGER
    },
    format: {
        type: Sequelize.STRING
    },
    amount: {
        type: Sequelize.DECIMAL(10,2)
    },
    userIdCreated: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false
});

export default PaymentRequest;