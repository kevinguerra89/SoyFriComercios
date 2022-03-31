import { Router } from 'express';
import * as userCtrl from '../controllers/user.controller';
import { authJwt, verifySignUp } from '../middlewares'

const router = Router();

/* METHOD GET */
router.get('/', userCtrl.getActiveUsers);
router.get('/:id', userCtrl.getUser);

/* METHOD POST */
router.post('/create', [ authJwt.verifyToken, authJwt.isAdministrator, verifySignUp.checkDuplicateEmail, verifySignUp.checkDuplicateUsername ], userCtrl.createUser);
router.post('/delete', [ authJwt.verifyToken, authJwt.isAdministrator ], userCtrl.deleteUser);
router.post('/modify', authJwt.verifyToken, userCtrl.updateUser);
router.post('/list', [ authJwt.verifyToken, authJwt.isAdministrator ], userCtrl.getUsers);
router.post('/block', [ authJwt.verifyToken, authJwt.isAdministrator ], userCtrl.blockUser);
router.post('/unblock', [ authJwt.verifyToken, authJwt.isAdministrator ], userCtrl.unBlockUser);
router.post('/updateStatusForUsers', userCtrl.updateStatusUsers);
router.post('/deleteUsers', userCtrl.deleteUsers);
router.post('/validate_username', verifySignUp.checkDuplicateUsername, function (req, res) { res.json(true) });
router.post('/validate_emailAddress', verifySignUp.checkDuplicateEmail, function (req, res) { res.json(true) });


export default router;