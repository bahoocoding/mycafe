const functions = require("firebase-functions");

const cors =require("cors");
const bodyParser =require("body-parser");
const express=require("express");

const menuRoute=require("./routes/menuRoute");
const app=express();
const PORT=5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use("/menus", menuRoute);
app.get("/", (req, res)=>{
    res.send("hello world");

});

app.listen(PORT,()=>{
    console.log("Server is started at http://localhost:"+PORT);
})

module.exports=functions.https.onRequest(app);