import express from 'express';



const app = express();



//middlewares
app.use(express.json());



app.get('/', (req, res) => {
    res.send('<h1>Welcome to ShortLink Server!</h1>');
});


export default app;