import Sequelize from 'sequelize';
import sequelize from '../database/database'

const FriUser = sequelize.define('FriUsers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    lastname: {
        type: Sequelize.STRING
    },
    avatar: {
        type: Sequelize.STRING
    },
    countryCode: {
        type: Sequelize.STRING
    },
    phoneNumber: {
        type: Sequelize.INTEGER
    },
    emailAddress: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

export default FriUser;