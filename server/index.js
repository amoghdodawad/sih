const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router } = require('./routes/routes');
const { connectToDB } = require('./db/db');

const PORT = 443;
const HOST ='localhost';
const URL = 'mongodb+srv://amoghasdodawad:@cluster0.mmjn3cr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"';
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/',router);
app.use(express.static('build'));

(async function (){
    await connectToDB(URL);
    console.log('Connected to sih2023 database');
    app.listen(PORT, HOST,function(){
        console.log(`Listening on port ${PORT}`);
    });
})();

