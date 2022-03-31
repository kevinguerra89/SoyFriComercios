import User from '../models/User';

const checkIfDuplicateEmail = async (emailAddress) => {
    const user = await User.findOne({ where: { emailAddress }, attributes: [ 'emailAddress' ]});
    return user;
};

const checkIfDuplicateUsername = async (username) => {
    const user = await User.findOne({ where: { username }, attributes: [ 'username' ]});
    return user;
};

export const checkDuplicateEmail = async (req, res, next) => {
    try {
        const { emailAddress } = req.body.requestContent;
        const result = await checkIfDuplicateEmail(emailAddress);
        if (result) {
            return res.status(400).json({ message: "The emailAddress already use" });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check username and emailAddress process" });
    }
};

export const checkDuplicateUsername = async (req, res, next) => {
    try {
        const { username } = req.body.requestContent;
        const result = await checkIfDuplicateUsername(username);
        if (result) {
            return res.status(400).json({ message: "The user name already exists" });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check username" });
    }
};

export const checkDataLoguedUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.userId }, attributes: [ 'username', 'emailAddress' ]});
        const { username, emailAddress } = req.body.requestContent;
        const result = await checkIfDuplicateUsername(username);
        if (user && user.username !== username && result) {
            return res.status(400).json({ message: "The user name already exists" });
        }
        if (user && user.emailAddress !== emailAddress && checkIfDuplicateEmail(emailAddress)) {
            return res.status(400).json({ message: "The emailAddress already use" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error in check data" });
    }
};