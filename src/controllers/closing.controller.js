import Closing from '../models/Closing';
import Transaction from '../models/Transaction';
import PaymentRequest from '../models/PaymentRequest';
import User from '../models/User';
import { Op } from 'sequelize';
import { getFieldExpressionWhere } from '../libs/helpers';
import FriUser from '../models/FriUser';

const getPendingTransactionsList = async (userId) => {
    let where = {[Op.and]: {"businessUserId": {[Op.eq]: userId}, "closingId": {[Op.eq]: null}}};
    const transactions = await Transaction.findAll(
        {
            raw: true,
            where,
            attributes: ['id','businessId','businessUserId','paymentRequestId',/*'transferId','refundTransferId','authorizationNumber',*/'creationDate',/*'resolutionDate','refundDate',*/'status',],
        }
    );

    const listTransactions = await Promise.all(transactions.map(async (transaction) => {
        const paymentRequest = await PaymentRequest.findOne({
            raw: true,
            where: {
                id: transaction.paymentRequestId
            },
            attributes: ['reference','format','amount'],
        });
        
        transaction.reference = paymentRequest.reference;
        transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;

        const date = new Date(transaction.creationDate);
        transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        
        return transaction;
    }));

    return listTransactions;
}

export const getPendingTransactions = async (req, res) => {
    try {
        const pendingTransactionsList = await getPendingTransactionsList(req.userId);

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "transactions": pendingTransactionsList
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Pending Transactions");
    }
}

export const getPendingTransactionsAdmin = async (req, res) => {
    try {
        const { user } = req.body.requestContent;
        const pendingTransactionsList = await getPendingTransactionsList(user.id);

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "transactions": pendingTransactionsList
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Pending Transactions");
    }
}

const closeTransactionsByUserId = async (userId) => {
    let format = '';
    let amount = 0;
    let transactionsCount = 0;
    let completionsCount = 0;
    let cancelationsCount = 0;
    let rejectionsCount = 0;
    let refundsCount = 0;
    
    const where = {[Op.and]: {"businessUserId": {[Op.eq]: userId}, "closingId": {[Op.eq]: null}}};
    let transactions = await Transaction.findAll({
        raw: true,
        where: where,
        attributes: ['id','businessId','businessUserId','paymentRequestId','creationDate','status','closingId'],
    });

    if (transactions.length <= 0) {
        return 0;
    }

    const closingDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    for (const transaction of transactions) {
        const paymentRequest = await PaymentRequest.findOne({
            raw: true,
            where: {
                id: transaction.paymentRequestId
            },
            attributes: ['id','friUserId','reference','format','amount'],
        });

        // HANDLE
        format = paymentRequest.format;
        amount += Number(paymentRequest.amount);
        transactionsCount += 1;

        switch (transaction.status) {
            case 'completed':
                completionsCount += 1;
                break;
            case 'canceled':
                cancelationsCount += 1;
                break;
            case 'rejected':
                rejectionsCount += 1;
                break;
            case 'refunded':
                refundsCount += 1;
                break;
            default:
                return 0;
                break;
        }
    }
    
    const completionDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const closingCreated = await Closing.create({
        closingDate,
        completionDate,
        userId,
        format,
        amount,
        status: "processing",
        transactions: transactionsCount,
        completions: completionsCount,
        cancelations: cancelationsCount,
        rejections: rejectionsCount,
        refunds: refundsCount
    });

    for (const transaction of transactions) {
        await Transaction.update({closingId: closingCreated.id}, { where: { id: transaction.id }});
    }

    return closingCreated.id; 
}

export const closeTransactions = async (req, res) => {
    try {
        const closingId = await closeTransactionsByUserId(req.userId);

        if (closingId <= 0) {
            res.status(401).json("Error Close Transactions");
        }

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "closingId": closingId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Close Transactions");
    }
}

export const closeTransactionsAdmin = async (req, res) => {
    try {
        const { user } = req.body.requestContent;

        const closingId = await closeTransactionsByUserId(user.id);

        if (closingId <= 0) {
            res.status(401).json("Error Close Transactions");
        }

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "closingId": closingId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Close Transactions");
    }
}

const getClosingsList = async (limit, offset, where) => {
    let closings = await Closing.findAll({
        raw: true,
        limit: limit,
        offset: ((offset - 1) * limit),
        where: where,
        attributes: ['id','closingDate','completionDate','format','amount','status','transactions','completions','cancelations','rejections','refunds'],
    });

    closings = closings.map((closing) => {
        closing.amount = closing.format + ' ' + closing.amount;
        delete closing.format;
        return closing;
    });

    return closings;
};

export const getClosings = async (req, res) => {
    try {
        let limit = 10;
        let offset = 1;
        const { pageSize, page } = req.body.requestContent;
        if (!isNaN(pageSize)) {
            limit = pageSize;
        }
        if (!isNaN(page)) {
            offset = page;
        }
        const where = {userId: req.body.userId};
        const closings = await getClosingsList(limit, offset, where);

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "closings": closings
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Closings");
    }
};

export const getClosingsAdmin = async (req, res) => {
    try {
        console.log(req.body.requestContent);
        let limit = 10;
        let offset = 1;
        let closingList = [];
        const { pageSize, page, businessUserId } = req.body.requestContent;
        if (!isNaN(pageSize)) {
            limit = pageSize;
        }
        if (!isNaN(page)) {
            offset = page;
        }
        if (typeof businessUserId !== 'undefined' && businessUserId != "") {
            // Get user by id
            const user = await User.findOne({ where: { id: businessUserId }, attributes: ['id','name','username','emailAddress',['createdDate', 'creationDate'],'type','status']});
            const where = { userId: businessUserId };
            const closings = await getClosingsList(limit, offset, where);
            if (closings.length > 0) {
                closingList.push({ "user": user, "closings": closings });
            }
        } else {
            const users = await User.findAll({
                raw: true,
                where: {
                    type: "operator",
                    status: {
                        [Op.not]: "deleted"
                    },
                },
                attributes: ['id','name','username','emailAddress',['createdDate', 'creationDate'],'type','status']
            });

            for (let user of users) {
                const where = { userId: user.id };
                const closings = await getClosingsList(limit, offset, where);
                if (closings.length > 0) {
                    closingList.push({ "user": user, "closings": closings });
                }
            }
        }

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "closingGroups": closingList
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Closings");
    }
};

export const getTransactionListByClosing = async (closingId) => {
    const where = {"closingId": {[Op.eq]: closingId}};
    const transactions = await Transaction.findAll({
        raw: true,
        where,
        attributes: ['id','businessId','businessUserId','paymentRequestId',/*'transferId','refundTransferId','authorizationNumber',*/'creationDate',/*'resolutionDate','refundDate',*/'status',],
    });

    const listTransactions = await Promise.all(transactions.map(async (transaction) => {
        const paymentRequest = await PaymentRequest.findOne({
            raw: true,
            where: {
                id: transaction.paymentRequestId
            },
            attributes: ['reference','format','amount'],
        });
        
        transaction.reference = paymentRequest.reference;
        transaction.formattedAmount = paymentRequest.format + " " + paymentRequest.amount;

        const date = new Date(transaction.creationDate);
        transaction.creationDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        
        return transaction;
    }));

    return transactions;
};

export const getTransactionsByClosing = async (req, res) => {
    try {
        let { closingId } = req.body.requestContent;
        let transactions = getTransactionListByClosing(closingId);

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "transactions": transactions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Closing");
    }
}

export const getTransactionsByClosingAdmin = async (req, res) => {
    try {
        let { closingId } = req.body.requestContent;
        let transactions = getTransactionListByClosing(closingId);

        return res.json({
            "info": {
                "type": "success"
            },
            "responseContent": {
                "transactions": transactions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json("Error Get Closing");
    }
}