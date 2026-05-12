import express from 'express';
import errorMiddleware from './middleware/error.middleware';
import cookieParser from 'cookie-parser';



const app = express();



//middlewares
app.use(express.json());
app.use(cookieParser());



import authRoute from './routes/auth.route';;


app.use('/api/v1/auth', authRoute);



app.get('/', (req, res) => {
    res.send('<h1>Welcome to ShortLink Server!</h1>');
});


app.use(errorMiddleware);
export default app;