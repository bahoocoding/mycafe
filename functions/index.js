const functions = require("firebase-functions");

const express=require("express");

const app=express();
const PORT=5000;


app.get("/", (req, res)=>{
    res.send("hello world");

});

app.listen(PORT,()=>{
    console.log("Server is started at http://localhost:"+PORT);
})

module.exports=functions.https.onRequest(app);