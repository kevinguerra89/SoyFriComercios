import { Router } from 'express';
import * as closingCtrl from '../controllers/closing.controller';
import { authJwt } from '../middlewares'

const router = Router();

router.post('/admin/transactions', [ authJwt.verifyToken, authJwt.isAdministrator ], closingCtrl.getPendingTransactionsAdmin);
router.post('/admin/close', [ authJwt.verifyToken, authJwt.isAdministrator ], closingCtrl.closeTransactionsAdmin);
router.post('/admin/list', [ authJwt.verifyToken, authJwt.isAdministrator ], closingCtrl.getClosingsAdmin);
router.post('/admin/transactions/list', [ authJwt.verifyToken, authJwt.isAdministrator ], closingCtrl.getTransactionsByClosing);

router.post('/transactions/pending', [ authJwt.verifyToken ], closingCtrl.getPendingTransactions);
router.post('/close', [ authJwt.verifyToken ], closingCtrl.closeTransactions);
router.post('/history', [ authJwt.verifyToken ], closingCtrl.getClosings);
router.post('/transactions/list', [ authJwt.verifyToken ], closingCtrl.getTransactionsByClosing);

export default router;