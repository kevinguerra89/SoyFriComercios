import User from '../models/User';
import Business from '../models/Business';
import { createAccessToken, createRefreshToken, createResetToken } from '../auth';
import { sendRefreshToken } from '../sendRefreshToken';
import { verify } from 'jsonwebtoken';
import { transporter } from "../libs/nodeMailerLib"

export const signUp = async (req, res) => {
    try {
        const { name, username, emailAddress, password } = req.body.requestContent;
        const encryptedPassword = await User.encryptPassword(password);

        const userCreated = await User.create({
            name,
            username,
            emailAddress,
            password: encryptedPassword,
            type: "operator",
            status: "active"
        });

        const accessToken = createAccessToken(userCreated);

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error interno" });
    }
};

export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username }});
        if (!user) {
            throw "User not found";
        }

        const result = await User.comparePassword(password, user.password);
        if (!result) {
            throw "Invalid password";
        }
        
        const accessToken = createAccessToken(user);

        const business = await Business.findOne({ where: { userId: user.id }});

        if (!business) {
            throw "No user business";
        }

        return res.status(200).json({
            "info": {
                "type": "success",
            },
            "responseContent": {
                "data": {
                    "user": {
                        "username": user.username,
                        "name": user.name,
                        "emailAddress": user.emailAddress,
                        "type": user.type
                    },
                    "business": {
                        "name": business.name,
                        //"avatar": 'http://localhost:8080/api/public/uploads/' + business.avatar
                        "avatar": 'http://18.191.130.22/api/public/uploads/' + business.avatar
                    }
                },
                "sessionId": accessToken
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "fail"
            }
        });
    }
};

export const logOut = (req, res) => {
    try {
        res.json({
            "info": {
                "type": "success"
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error interno" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const emailAddress = req.body.emailAddress;
        if (!emailAddress) {
            return res.status(400).json({message: 'Email is required'});
        }

        const message = 'Check your emailAddress for a link to reset your password.'
        const user = await User.findOne({ where: { emailAddress }});
        if (!user) {
            return res.status(400).json({message});
        }

        const resetToken = createResetToken(user);
        const verificationLink = process.env.origin + "/api/auth/forgot-password/" + resetToken;

        // Send emailAddress
        var mailOptions = {
            from: process.env.MAIL_AUTH_USER,
            to: emailAddress,
            subject: "Forgot password",
            html: "<b>Please click on the following link, or paste this into your browser to complete the process:</b><a href=\"" + verificationLink + "\">" + verificationLink + "</a>"
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).send(error.message);
            } else {
                res.status(200).jsonp(req.body);
            }
        });

        await User.update({ resetPasswordToken: resetToken }, { where: { id: user.id }});
        res.json(true);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error interno" });
    }
};

export const forgotPasswordUser = async (req, res) => {
    try {
        const token = String(req.params.token);
        const newPass = req.body.newPassword;
        const decoded = verify(token, process.env.RESET_TOKEN_SECRET);

        if (!newPass) {
            return res.status(400).json({message: "All the fields are required"});
        }
        
        let user = await User.findOne({ where: { resetPasswordToken: token }});
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }
        
        const encryptedPassword = await User.encryptPassword(newPass);
        await User.update({ password: encryptedPassword, resetPasswordToken: "" }, { where: { id: user.id }});

        res.json(true);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error interno" });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.userId }});
        const token = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        sendRefreshToken(res, refreshToken);
        res.json({ accessToken: token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error interno" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, password  } = req.body.requestContent;
        if (!password) {
            throw "All the fields are required";
        }
        
        let user = await User.findOne({ where: { id: req.userId }});
        
        const result = await User.comparePassword(currentPassword, user.password);
        if (!result) {
            throw "Invalid password";
        } else {
            const encryptedPassword = await User.encryptPassword(password);
            await User.update({ password: encryptedPassword }, { where: { id: user.id }});
            res.json({
                "info": {
                    "type": "success"
                }
            })
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "error",
                "title": "Invalid password",
                "message": error,
                "errorCode": "100",
            }
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, emailAddress, phone } = req.body.requestContent;

        const result = await User.update({ name, emailAddress, phone }, { where: { id: req.userId }});
        if (result) {
            res.json({
                "info": {
                    "type": "success"
                }
            });
        } else {
            throw "Fail";
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "fail"
            }
        });
    }
};

export const changeAvatar = async (req, res) => {
    try {
        const result = await Business.update({ avatar: req.file.filename }, { where: { userId: req.userId }});
        if (result) {
            res.json({
                "responseContent": {
                    //"url": 'http://localhost:8080/api/public/uploads/' + req.file.filename
                    "url": 'http://18.191.130.22/api/public/uploads/' + req.file.filename
                }
            });
        } else {
            throw "Fail";
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "fail"
            }
        });
    }
};