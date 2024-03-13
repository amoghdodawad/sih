const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router } = require('./routes/routes');
const { connectToDB } = require('./db/db');
const path = require('path');
const https = require('https');
const { readFileSync } = require('fs');

const PORT = 443;
const HOST ='localhost';
const URL = 'mongodb+srv://amoghasdodawad:@cluster0.mmjn3cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/',router);
app.use(express.static('build'));
app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
        next();
    } else {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

const credentials = {
    key : readFileSync('./certificates/server.key'),
    cert : readFileSync('./certificates/server.pem')
}
const server = https.createServer(credentials,app);

(async function (){
    await connectToDB(URL);
    console.log('Connected to sih2023 database');
    server.listen(PORT, HOST,function(){
        console.log(`Listening on port ${PORT}`);
    });
})();

