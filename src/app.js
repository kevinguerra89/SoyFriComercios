import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import pkg from '../package.json';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import closingRoutes from './routes/closing.routes';
import transactionAdminRoutes from './routes/transactionAdmin.routes';
import { createAdmin} from "./libs/initialSetup";
const path = require('path');

const app = express();
createAdmin();

//Settings
app.set('port', process.env.PORT || env.process.PORT)
app.set('pkg', pkg)

//Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors(/*{
    origin: "http://localhost:3000",
    credentials: true
}*/));
//app.use(cookieParser());

//Routes
app.get('/', (req, res) => {
    res.send("Api rest");
});
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/transaction/admin', transactionAdminRoutes);
app.use('/api/closing', closingRoutes);
app.use('/api/public', express.static(path.join(__dirname, 'public')));

export default app;