import express from "express"
import bodyParser from "body-parser";
import cors from "cors"
import request from 'request'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import userController from "./controllers/user/userController.js";
import likedSongController
    from "./controllers/likedSong/likedSongController.js";

const port = process.env.PORT || 4000;

dotenv.config()

// mongoose.connect(process.env.MONGO_URI);
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

await connectToDatabase();

const app = express()

app.use(cors({
                 credentials: true,
                 origin: 'http://localhost:3000'
             }))
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.post("/api/authenticate", (req, res) => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(
                             client_id + ':' + client_secret).toString(
                'base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const token = body.access_token;
            res.json({
                         'token': token
                     })
        }
    });

})

userController(app);
likedSongController(app);

app.listen(port)



