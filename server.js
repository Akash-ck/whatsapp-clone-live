import express from 'express';

import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';



const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1114610",
    key: "d60838c978ee0d8dec6d",
    secret: "6535542ed2db57e8133b",
    cluster: "ap2",
    useTLS: true
  });

  app.use(express.json());
  app.use(cors())



  const db = mongoose.connection;

  db.once("open", () => {
      console.log("DB connected");

      const msgCollection =db.collection("messagecontents");
      const changeStream = msgCollection.watch();

      changeStream.on("change",(change) => {
          console.log("change occured",change);

        if (change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',{
                name: messageDetails.user,
                message: messageDetails.message
            });
         } else {
            console.log('error triggering pusher');
        }
        
      })
  });




const connection_url = 'mongodb://admin:qE85WbgGbInuic7o@cluster0-shard-00-00.yqzf5.mongodb.net:27017,cluster0-shard-00-01.yqzf5.mongodb.net:27017,cluster0-shard-00-02.yqzf5.mongodb.net:27017/whattsappclone?ssl=true&replicaSet=atlas-ulhga3-shard-0&authSource=admin&retryWrites=true&w=majority';



mongoose.connect(connection_url,{

    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
});


app.get('/',(req,res) => res.status(200).send('hello '));

app.get('/messages/sync', (req,res) =>{
    Messages.find((err, data) => {
        if (err){
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})


app.post('/messages/new',(req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage,(err,data) =>{
        if (err) {
            res.status(500).send(err);
        }else {
            res.status(201).send(data);
        }


    });



});


app.listen(port,()=>console.log(`listening to localhost:${port}`));


