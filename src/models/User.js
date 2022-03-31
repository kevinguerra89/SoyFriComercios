import Sequelize from 'sequelize';
import sequelize from '../database/database'
import bcrypt from 'bcryptjs';

const User = sequelize.define('Users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    emailAddress: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING
    },
    createdDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedDate: {
        type: Sequelize.DATE
    },
    phone: {
        type: Sequelize.INTEGER
    },
    pic: {
        type: Sequelize.STRING
    },
    resetPasswordToken: {
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

User.encryptPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            resolve(hash);
        } catch (error) {
            reject(error);
        }
    });
};

User.comparePassword = async (password, receivedPassowrd) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await bcrypt.compare(password, receivedPassowrd);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

export default User;