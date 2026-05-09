import express from 'express';
import errorMiddleware from './middleware/error.middleware';



const app = express();



//middlewares
app.use(express.json());



app.get('/', (req, res) => {
    res.send('<h1>Welcome to ShortLink Server!</h1>');
});


app.use(errorMiddleware);
export default app;