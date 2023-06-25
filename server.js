import express from "express"; // we can use this syntax bcoz of esm package
import { APP_PORT, DB_URL } from "./config";
const app = express();
import routes from './routes';
import errorHandler from "./middlewares/errorHandler";
import mongoose from "mongoose";
import path from 'path';

// DB connection
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB connected...');
});

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json()) // middleware, ablility to read JSON data
app.use('/api', routes); // need to register routes in our app
app.use('/uploads', express.static('uploads'));


app.use(errorHandler);
app.listen(APP_PORT, () => {
    console.log(`Listening on port ${APP_PORT}`);
});