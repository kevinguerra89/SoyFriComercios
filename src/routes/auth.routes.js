import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import { authJwt, verifySignUp } from '../middlewares';
var multer  = require('multer');
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads/'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  
var upload = multer({ storage: storage })

//var upload = multer({ dest: path.join(__dirname, '../public/uploads/') });

const router = Router();

router.post('/signup', [ verifySignUp.checkDuplicateEmail, verifySignUp.checkDuplicateUsername ], authCtrl.signUp);
router.post('/signin', authCtrl.signIn);
router.post('/logout', authCtrl.logOut);
//router.post('/forgot-password', authCtrl.forgotPassword);
//router.post('/forgot-password/:token', authCtrl.forgotPasswordUser);
router.post('/refresh_token', /*authJwt.verifyRefreshToken,*/ authCtrl.refreshToken);
router.post('/change_password', authJwt.verifyToken, authCtrl.changePassword);
router.post('/modify', [ authJwt.verifyToken, verifySignUp.checkDataLoguedUser ], authCtrl.updateUser);
router.post('/avatar', [ authJwt.verifyToken, upload.single('f') ], authCtrl.changeAvatar);

export default router