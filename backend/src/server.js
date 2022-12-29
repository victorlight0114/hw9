import http from 'http'
import express from 'express';
import dotenv from 'dotenv-defaults'
import mongoose from 'mongoose';
import WebSocket from 'ws'

import bodyParser from 'body-parser';

import mongo from './mongo';
//import cors from 'cors';
import wsConnect from './wsConnect'

mongo.connect();

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const db = mongoose.connection

db.once('open', () => {
    console.log('MongoDB connected!');
    wss.on('connection', (ws) => {
        //wsConnect.initData(ws)
        ws.box = '';
        //ws logic
        console.log("WS server on connection")
        ws.onmessage = wsConnect.onMessage(wss, ws); 
        // ws.on('message', wsConnect.onMessage(ws));
        
    });
    // console.log("End of wss connection")
});

const PORT = process.env.PORT || 4000;
//console.log("PORT: " + PORT)
server.listen(PORT, () => {console.log(`App listening on port ${PORT}!`)})


// Parses the text as JSON and exposes the resulting
// object on req.body.
//app.use(bodyParser.json());

//init middleware
//app.use(cors());
//app.use(express.json());
