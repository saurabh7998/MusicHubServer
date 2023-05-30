import express from "express"
import cors from "cors"
import bodyParser from "body-parser";
import request from 'request'

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    family: 4
}

const app = express()

app.use(cors({
                 credentials: true,
                 origin: 'http://localhost:3000'
             }))
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const client_id = '4a89680f85b44ea0931efc1d24e59460';
const client_secret = '0e5fe65837bd470f9b612a36e0895db6';

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

app.listen(4000)



