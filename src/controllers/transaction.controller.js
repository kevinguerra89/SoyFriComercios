import Transaction from '../models/Transaction';
import FriUser from '../models/FriUser';
import User from '../models/User';
import PaymentRequest from '../models/PaymentRequest';
import { Op } from 'sequelize';
import { getFieldExpressionWhere } from '../libs/helpers';


export const getTransaction = async (req , res) => {
    try {
        const transaction = await Transaction.findOne({ raw: true, where: { id: req.params.id }});

        const paymentRequest = await PaymentRequest.findOne({
            raw: true,
            where: {
                id: transaction.paymentRequestId
            },
            attributes: ['id','friUserId','reference','format','amount'],
        });
        
        transaction.reference = paymentRequest.reference;
        transaction.amount = paymentRequest.amount;
        const friUser = await FriUser.findOne({
            raw: true,
            where: {
                id: paymentRequest.friUserId
            },
            attributes: ['id','username','name','lastname','avatar','countryCode', 'phoneNumber', 'emailAddress']
        });
        transaction.friUser = friUser.username;

        const date = new Date(transaction.creationDate);
        transaction.creationDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Transaction");
    }
};

export const createTransaction = async (req, res) => {
    try {
        const { friUsername, friPhoneNumber, amount, reference, user } = req.body.requestContent;

        let friUser = {};

        if (friUsername) {
            friUser = await FriUser.findOne({ where: { username: friUsername }, attributes: [ 'id','username' ]});
        } else if (friPhoneNumber) {
            friUser = await FriUser.findOne({ where: { phoneNumber: friPhoneNumber }, attributes: [ 'id','phoneNumber' ]});
        } else {
            throw "No data";
        }

        if (!friUser) {
            throw "Fri User not found";
        }

        const paymentRequestCreated = await PaymentRequest.create({
            friUserId: friUser.id,
            reference,
            format: "GTQ",
            amount,
            userIdCreated: user ? user.id : req.userId
        });

        const creationDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
        const transactionCreated = await Transaction.create({
            buisnessId: 1,
            businessUserId: user ? user.id : req.userId,
            paymentRequestId: paymentRequestCreated.id,
            creationDate,
            status: "pending"
        });

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "transaction": {
                    "id": transactionCreated.id,
                    "businessId": transactionCreated.businessId,
                    "businessUserId": transactionCreated.businessUserId,
                    "reference": paymentRequestCreated.reference,
                    "paymentRequestId": paymentRequestCreated.paymentRequestId,
                    "formattedAmount": paymentRequestCreated.format + " " + paymentRequestCreated.amouot,
                    "creationDate": transactionCreated.creationDate,
                    "status": transactionCreated.status,
                    "friUser": {
                        "id": friUser.id,
                        "username": friUser.username,
                        "name": friUser.name,
                        "lastname": "",
                        "avatar": friUser.avatar,
                        "countryCode": friUser.countryCode,
                        "phoneNumber": friUser.phoneNumber,
                        "emailAddress": friUser.emailAddress,
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({
            "info": {
                "type": "error",
                "title": "Atención",
                "message": error,
                "errorCode": "100",
            }
        });
    }
};

export const getPendingTransactions = async (req, res) => {
    try {
        let  where = {}, order = [], limit = 10, offset = 1;
        const user = await User.findOne({ where: { id: req.userId }});
        const isAdmin = user.type == "admin";
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


        const transactions = await Transaction.findAll(
            {
                raw: true,
                where: { status: 'pending' },
                //where,
                //order,
                //attributes: columns,
                //limit,
                //offset: ((offset - 1) * limit),
                attributes: ['id','businessId','businessUserId','paymentRequestId','creationDate','status',],
            }
        );

        await Promise.all(transactions.map(async (transaction) => {
            const paymentRequest = await PaymentRequest.findOne({
                raw: true,
                where: {
                    id: transaction.paymentRequestId
                },
                attributes: ['id','friUserId','reference','format','amount'],
            });
            
            transaction.reference = paymentRequest.reference;
            transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;
            transaction.friUser = await FriUser.findOne({
                raw: true,
                where: {
                    id: paymentRequest.friUserId
                },
                attributes: ['id','username','name','lastname','avatar','countryCode', 'phoneNumber', 'emailAddress']
            });

            const date = new Date(transaction.creationDate);
            transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            
            return transaction;
        }));
        
        if (isAdmin) {
            const userTransactionList = await Promise.all(transactions.reduce((list, transaction) => {
                if (!list.some(item => item[transaction.businessUserId])) {
                    list.push({ [transaction.businessUserId]: [] });
                }
                const arr = list.filter(item => item.hasOwnProperty(transaction.businessUserId))[0];
                if (!arr[transaction.businessUserId].some( item => item.id === transaction.id )) {
                    arr[transaction.businessUserId].push(transaction);
                }
                return list;
            }, []).map(async (item) => {
                const itemId = Object.keys(item)[0];
                const itemUser = await User.findOne({ raw: true, where: { id: itemId }, attributes: ['id','name','username','emailAddress',['createdDate', 'creationDate'],'type','status']});
                return {
                    "user": itemUser,
                    "transactions": item[itemId]
                };
            }));
            res.json({
                "info": {},
                "responseContent": {
                    "transactionGroups": userTransactionList
                }
            });
        } else {
            res.json({
                "info": {},
                "responseContent": {
                    transactions
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json(
            {
                "info": {
                    "type": "error",
                    "title": "Error Get Pending Transactions",
                    "message": error,
                    "errorCode": "100",
                }
            }
        );
    }
};

export const getPaidTransactions = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.userId }});
        const isAdmin = user.type === "admin";

        const transactions = await Transaction.findAll(
            {
                raw: true,
                where: { status: ['completed', 'canceled', 'rejected', 'refunded'] },
                attributes: ['id','businessId','businessUserId','paymentRequestId','creationDate','status',],
            }
        );
        
        await Promise.all(transactions.map(async (transaction) => {
            const paymentRequest = await PaymentRequest.findOne({
                raw: true,
                where: {
                    id: transaction.paymentRequestId
                },
                attributes: ['id','friUserId','reference','format','amount'],
            });
            
            transaction.reference = paymentRequest.reference;
            transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;
            transaction.friUser = await FriUser.findOne({
                raw: true,
                where: {
                    id: paymentRequest.friUserId
                },
                attributes: ['id','username','name','lastname','avatar','countryCode', 'phoneNumber', 'emailAddress']
            });

            const date = new Date(transaction.creationDate);
            transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            
            return transaction;
        }));
        
        if (isAdmin) {
            const userTransactionList = await Promise.all(transactions.reduce((list, transaction) => {
                if (!list.some(item => item[transaction.businessUserId])) {
                    list.push({ [transaction.businessUserId]: [] });
                }
                const arr = list.filter(item => item.hasOwnProperty(transaction.businessUserId))[0];
                if (!arr[transaction.businessUserId].some( item => item.id === transaction.id )) {
                    arr[transaction.businessUserId].push(transaction);
                }
                return list;
            }, []).map(async (item) => {
                const itemId = Object.keys(item)[0];
                const itemUser = await User.findOne({ raw: true, where: { id: itemId }, attributes: ['id','name','username','emailAddress',['createdDate', 'creationDate'],'type','status']});
                return {
                    "user": itemUser,
                    "transactions": item[itemId]
                };
            }));
            res.json({
                "info": {},
                "responseContent": {
                    "transactionGroups": userTransactionList
                }
            });
        } else {
            res.json({
                "info": {},
                "responseContent": {
                    transactions
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json(
            {
                "info": {
                    "type": "error",
                    "title": "Error Get Paid Transactions",
                    "message": error,
                    "errorCode": "100",
                }
            }
        );
    }
};

export const getUnassignedTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll(
            {
                raw: true,
                where: { status: 'unassigned' },
                attributes: ['id','businessId','businessUserId','paymentRequestId','creationDate','status',],
            }
        );
        
        await Promise.all(transactions.map(async (transaction) => {
            const paymentRequest = await PaymentRequest.findOne({
                raw: true,
                where: {
                    id: transaction.paymentRequestId
                },
                attributes: ['id','friUserId','reference','format','amount'],
            });
            
            transaction.reference = paymentRequest.reference;
            transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;
            transaction.friUser = await FriUser.findOne({
                raw: true,
                where: {
                    id: paymentRequest.friUserId
                },
                attributes: ['id','username','name','lastname','avatar','countryCode', 'phoneNumber', 'emailAddress']
            });

            const date = new Date(transaction.creationDate);
            transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            
            return transaction;
        }));
        
        res.json({
            "info": {},
            "responseContent": {
                transactions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json(
            {
                "info": {
                    "type": "error",
                    "title": "Error Get Unassigned Transactions",
                    "message": error,
                    "errorCode": "100",
                }
            }
        );
    }
};

export const getTransactions = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.userId }});
        const isAdmin = user.type === "admin";

        const transactions = await Transaction.findAll(
            {
                raw: true,
                //where: { status: ['pending', 'completed', 'unassigned'] },
                attributes: ['id','businessId','businessUserId','paymentRequestId','creationDate','status',],
            }
        );
        
        await Promise.all(transactions.map(async (transaction) => {
            const paymentRequest = await PaymentRequest.findOne({
                raw: true,
                where: {
                    id: transaction.paymentRequestId
                },
                attributes: ['id','friUserId','reference','format','amount'],
            });
            
            transaction.reference = paymentRequest.reference;
            transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;
            transaction.friUser = await FriUser.findOne({
                raw: true,
                //where: {},
                attributes: ['id','username','name','lastname','avatar','countryCode', 'phoneNumber', 'emailAddress']
            });

            const date = new Date(transaction.creationDate);
            transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            
            return transaction;
        }));
        
        if (isAdmin) {
            const userTransactionList = await Promise.all(transactions.reduce((list, transaction) => {
                if (!list.some(item => item[transaction.businessUserId])) {
                    list.push({ [transaction.businessUserId]: [] });
                }
                const arr = list.filter(item => item.hasOwnProperty(transaction.businessUserId))[0];
                if (!arr[transaction.businessUserId].some( item => item.id === transaction.id )) {
                    arr[transaction.businessUserId].push(transaction);
                }
                return list;
            }, []).map(async (item) => {
                const itemId = Object.keys(item)[0];
                const itemUser = await User.findOne({ raw: true, where: { id: itemId }, attributes: ['id','name','username','emailAddress',['createdDate', 'creationDate'],'type','status']});
                return {
                    "user": itemUser,
                    "transactions": item[itemId]
                };
            }));
            res.json({
                "info": {},
                "responseContent": {
                    "transactionGroups": userTransactionList
                }
            });
        } else {
            const transactionStatus = {'pending': 'paymentRequests', 'completed': 'payments', 'unassigned': 'unassigned'};
            const getListStatus = (status) => {
                if (status == "canceled" || status == "rejected" || stauts == "refunded") {
                    return transactionStatus['completed'];
                }
                return transactionStatus[status];
            };
            const grouTransactions = transactions.reduce((list, transaction) => {
                list[getListStatus(transaction.status)].push(transaction);
                return list;
            }, { paymentRequests: [] , payments: [] , unassigned: [] });
            res.json({
                "info": {},
                "responseContent": grouTransactions
            });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json(
            {
                "info": {
                    "type": "error",
                    "title": "Error Get Paid Transactions",
                    "message": error,
                    "errorCode": "100",
                }
            }
        );
    }
};

export const updateTransaction = async (req, res) => {
    try {
        if (req.params && req.body) {
            let data = req.body.transaction;
            await Transaction.update(data, { where: { id: req.params.id }});
            res.json(true)
        } else {
            res.status(401).json("No data");
        }
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Update Transaction");
    }
};

export const updateStatusTransactions = async (req, res) => {
    try {
        if (req.body && req.body.ids && req.body.ids.length > 0 && req.body.status) {
            await Transaction.update({
                status: req.body.status
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
        res.status(401).json("Error Update Status Transactions");
    }
};

export const findFriUser = async (req, res) => {
    try {
        const { friUser } = req.body.requestContent;
        const value = friUser.toString().replace('@', '');
        const user = await FriUser.findAll({ raw: true, where: { username: { [Op.like]: '%' + value + '%' }}, attributes: ['id',['username', 'value']]});
        const userPhone = await FriUser.findAll({ raw: true, where: { phoneNumber: value }, attributes: ['id',['phoneNumber', 'value']] });
        const list = [];
        user.forEach(row => {
            row.type = "username";
            list.push(row);
        });
        userPhone.forEach(row => {
            row.type = "phone";
            row.value = row.value.toString();
            list.push(row);
        });
        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Fri User");
    }
};

export const cancelPaymentRequest = async (req, res) => {
    try {
        if (req.body && req.body.requestContent && req.body.requestContent.transaction) {
            await Transaction.update({ status: 'canceled' }, { where: { id: req.body.requestContent.transaction.id }});
            res.json(true)
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

export const refundPayment = async (req, res) => {
    try {
        if (req.body && req.body.requestContent && req.body.requestContent.transaction) {
            //await Transaction.update({ status: 'rejected' }, { where: { id: req.body.requestContent.transaction.id }});
            res.json(true)
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

export const assignPayment = async (req, res) => {
    try {
        if (req.body && req.body.requestContent && req.body.requestContent.transaction) {
            //await Transaction.update({ status: 'rejected' }, { where: { id: req.body.requestContent.transaction.id }});
            res.json(true)
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