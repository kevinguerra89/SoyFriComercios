import { verify } from 'jsonwebtoken';
import User from '../models/User';

export const verifyToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(403).json({ message: "No token provided" });
        }

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: "No token provided" });
        }

        const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.userId = decoded.id;
        const user = await User.findOne({ where: { id: req.userId }, attributes: ['id', 'username'] });
        
        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

export const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.jid;

        if (!refreshToken) {
            return res.status(403).json({ message: "User not authenticated" });
        }

        const decoded = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        req.userId = decoded.id;
        const user = await User.findOne({ where: { id: req.userId }, attributes: ['id', 'username'] });
        
        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Unauthorized" })
    }
};

export const isOperator = async (req, res, next) => {
    const user = await User.findOne({ where: { id: req.userId }, attributes: ['id', 'username', 'type'] });
    
    if (user && user.type.toLowerCase() === "operator") {
        next();
        return;
    }

    return res.status(403).json({ message: "Require Operator role" })
};

export const isAdministrator = async (req, res, next) => {
    const user = await User.findOne({ where: { id: req.userId }, attributes: ['id', 'username', 'type'] });
    if (user && user.type.toLowerCase() === "admin") {
        next();
        return;
    }

    return res.status(403).json({ message: "Require Administrator role" })
};