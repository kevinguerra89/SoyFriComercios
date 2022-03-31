import { sign } from 'jsonwebtoken';

export const createAccessToken = (user) => {
    return sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 604800 // 7 days
    });
};

export const createRefreshToken = (user) => {
    return sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: 604800 // 7 days
    });
};

export const createResetToken = (user) => {
    return sign({ id: user.id }, process.env.RESET_TOKEN_SECRET, {
        expiresIn: 600 // 10 minutes
    });
};