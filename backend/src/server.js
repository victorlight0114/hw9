import http from 'http'
import express from 'express';
import dotenv from 'dotenv-defaults'
import mongoose from 'mongoose';
import WebSocket from 'ws'
import cors from "cors";
import bodyParser from 'body-parser';
import axios from "axios";
import mongo from './mongo';
//import cors from 'cors';
import wsConnect from './wsConnect'

mongo.connect();

const app = express()
const db = mongoose.connection


if (process.env.NODE_ENV === "development") {
    app.use(cors());
  }
  // define routes
app.get("/api", (req, res) => {
    // send the request back to the client
    console.log("GET /api");
    res.send({ message: "Hello from the server!" }).status(200);
  });
  
if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "../frontend", "build")));
    app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
    });
  }



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
const server = app.listen(port, () => {
    console.log(`Server is up on port ${port}.`);
  });

  
const wss = new WebSocket.Server({ server });
  
wss.on("connection", (ws) => {
    // send a random number every seconds
    const interval = setInterval(() => {
      ws.send(JSON.stringify({ number: Math.round(Math.random() * 100) }));
    }, 1000);
  
    // clear interval on close
    ws.on("close", () => {
      clearInterval(interval);
    });
  });


// Parses the text as JSON and exposes the resulting
// object on req.body.
//app.use(bodyParser.json());

//init middleware
//app.use(cors());
//app.use(express.json());
