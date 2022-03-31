import User from '../models/User';
import { Op } from 'sequelize';
import { getFieldExpressionWhere } from '../libs/helpers';
import Business from '../models/Business';

/* METHOD GET */

export const getActiveUsers = async (req, res) => {
    const users = await User.findAll(
        {
            where: {
                status: "active",
                type: "operator"
            },
            attributes: ['id','name','username','emailAddress','type','status'],
        }
    );
    const queryResults = {
        entities: users,
        totalCount: users.length,
        errorMessage: ""
      };
    res.json(queryResults);
};

export const getUser = async (req , res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.id }, attributes: ['id','name','username','emailAddress','type','status']});

        res.json(user.dataValues);
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get User");
    }
};


/* METHOD POST */

export const getUsers = async (req, res) => {
    try {
        let  where = {}, order = [], limit = 10, offset = 1;
        /*const { page, pageSize, sortField, sortOrder, filter, columns } = req.body.requestContent;
        if (pageSize) limit = pageSize;
        if (page) offset = page;
        
        if (filter) {
            const { status } = filter;
            where = Object.fromEntries(
                Object.entries(filter)
                .map(([key, value]) => ([key, getFieldExpressionWhere(value, Op.like)]))
                .filter(([key, value]) => !!value && key !== "status" )
            );

            where = Object.keys(where).length !== 0 ? {[Op.or]: where } : {};
            if (status) {
                where = {
                    [Op.and]: { status },
                    ...where
                }
            }
        }
        if (sortOrder && sortOrder != "" && sortField && sortField != "") {
            order = [[ sortField, sortOrder.toUpperCase() ]];
        }
        console.log("where ", where)*/
        const users = await User.findAll(
            {
                where: {
                    type: "operator",
                    status: {
                        [Op.not]: "deleted"
                    },
                    ...where
                },
                order,
                //attributes: columns,
                //limit,
                //offset: ((offset - 1) * limit),
                attributes: ["id",'name','username','emailAddress',['createdDate', 'creationDate'],'type','status'],
            }
        );

        const amount = await User.count({ where: { type: "operator", status: { [Op.not]: "deleted" }, ...where}});
        
        res.json({
            "info": {},
            "responseContent": {
                users,
                totalCount: amount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get users");
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, username, emailAddress } = req.body.requestContent;

        const encryptedPassword = await User.encryptPassword(username);
        const userCreated = await User.create({
            name,
            username,
            emailAddress,
            password: encryptedPassword,
            type: "operator",
            status: "active"
        });

        let businessCreated = {};

        if (userCreated && userCreated.id) {
            businessCreated = await Business.create({
                name: "Nombre del comercio",
                avatar: "",
                userId: userCreated.id
            });
        } else {
            throw "Fail";
        }

        if (businessCreated && businessCreated.id) {
            return res.json({
                "info": {
                    "type": "success"
                },
                "responseContent": {
                    "userId": userCreated.id
                }
            });
        } else {
            throw "Fail";
        }
    } catch(error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "fail"
            }
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body.requestContent;
        const result = await User.update({ status: "deleted" }, { where: { id: userId }});
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

export const updateUser = async (req, res) => {
    try {
        const { userId, name, emailAddress } = req.body.requestContent;

        const result = await User.update({ name, emailAddress }, { where: { id: userId }});
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

export const blockUser = async (req,res) => {
    try {
        const { requestContent: { userId } } = req.body;
        const result = await User.update({ status: "blocked" }, { where: { id: userId }});
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

export const unBlockUser = async (req,res) => {
    try {
        const { requestContent: { userId } } = req.body;
        const result = await User.update({ status: "active" }, { where: { id: userId }});
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

export const deleteUsers = async (req, res) => {
    try {
        if (req.body && req.body.ids && req.body.ids.length > 0) {
            await User.update({ status: "deleted" }, {
                where: {
                    id: req.body.ids
                }
            });
            res.json(true)
        } else {
            res.status(401).json("No data");
        }
    } catch (error) {
        console.error(error);
        res.status(401).json("Error delete Users");
    }
};

export const updateStatusUsers = async (req, res) => {
    try {
        if (req.body && req.body.ids && req.body.ids.length > 0 && req.body.status) {
            await User.update({
                status: req.body.status,
            }, {
                where: {
                    id: req.body.ids
                }
            });
            res.json(true)
        } else {
            res.status(401).json("No data");
        }
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Update Status Users");
    }
};