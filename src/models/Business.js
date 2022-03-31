import Sequelize from 'sequelize';
import sequelize from '../database/database'

const Business = sequelize.define('Business', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    avatar: {
        type: Sequelize.STRING
    },
    userId: {
        type: Sequelize.INTEGER
    },
}, {
    tableName: 'Business',
    timestamps: false
});

export default Business;