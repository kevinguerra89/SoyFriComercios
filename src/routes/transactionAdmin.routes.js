import { Router } from 'express';
import * as transactionCtrl from '../controllers/transaction.controller';
import { authJwt, verifyFriUser } from '../middlewares'

const router = Router();

router.post('/send', authJwt.verifyToken, transactionCtrl.createTransaction);

router.post('/pending', [ authJwt.verifyToken, /*authJwt.isAdministrator*/ ], transactionCtrl.getPendingTransactions);
router.post('/paid', [ authJwt.verifyToken, /*authJwt.isAdministrator*/ ], transactionCtrl.getPaidTransactions);
router.post('/unassigned', [ authJwt.verifyToken, authJwt.isAdministrator ], transactionCtrl.getUnassignedTransactions);

router.post('/updateStatusForTransactions', transactionCtrl.updateStatusTransactions);

router.post('/cancel', transactionCtrl.cancelPaymentRequest);

router.post('/assign', transactionCtrl.assignPayment);
router.post('/refund', transactionCtrl.refundPayment);


export default router;