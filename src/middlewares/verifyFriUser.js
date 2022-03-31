import FriUser from '../models/FriUser';
import { Op } from 'sequelize';

export const checkPhone = async (req, res, next) => {
    try {
        const { friPhoneNumber } = req.body.requestContent;

        const user = await FriUser.findOne({ where: { phoneNumber: friPhoneNumber }, attributes: [ 'phoneNumber' ]});
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check Fri User phone number" });
    }
};

export const checkUsername = async (req, res, next) => {
    try {
        const { friUsername } = req.body.requestContent;

        const user = await FriUser.findOne({ where: { username: friUsername }, attributes: [ 'username' ]});
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check Fri User username" });
    }
};

export const checkFriUser = async (req, res, next) => {
    try {
        const { friUser } = req.body.requestContent;
        
        const user = await FriUser.findOne({ where: { [Op.or]: [{ username: friUser }, { phoneNumber: friUser }] }, attributes: [ 'id' ]});
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check Fri User username" });
    }
};