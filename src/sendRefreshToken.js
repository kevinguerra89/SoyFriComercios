export const sendRefreshToken = (res, refreshToken) => {
    res.cookie("jid", refreshToken, {
        httpOnly: true
    });
};