const express=require("express");
const router=express.Router();
const fb =require("../utils/fb");
const db1 = fb.firestore();
const Config=require("../models/configModel");
const {isAuth, isAdmin} =require("../utils/auth");
const Validator =require("validator");
const isEmpty =require("lodash.isempty");
const {sendEmail} =require("../utils/mailer");
const shortid=require("shortid");

/**
 *@param {*} data
 *@return {String}
 */
function validateConfig(data) {
  const errors={};
  if (Validator.isEmpty(data.Company_Name)) {
    errors.Company_Name="This field is required!";
  }
  if (Validator.isEmpty(data.Company_Phone)) {
    errors.Company_Phone="This field is required!";
  }
  if (!Validator.isNumeric(data.Company_Phone)) {
    errors.Company_Phone="Phone Number is not valid!";
  }
  if (!Validator.isNumeric(data.Company_Lat)) {
    errors.Company_Lat="Latitute is not valid!";
  }
  if (!Validator.isNumeric(data.Company_Long)) {
    errors.Company_Long="Longtitute is not valid!";
  }
  if (Validator.isEmpty(data.Company_Email)) {
    errors.Company_Email="This field is required!";
  }
  if (!Validator.isEmail(data.Company_Email)) {
    errors.Company_Email="Email is not valid!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}
/**
 *@param {*} data
 *@return {String}
 */
function validateContact(data) {
  const errors={};
  if (Validator.isEmpty(data.name)) {
    errors.name="This field is required!";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email="This field is required!";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email="Email is not valid!";
  }
  if (Validator.isEmpty(data.message)) {
    errors.message="This field is required!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}
router.post("/contact", async (req, res)=>{
  const {errors, isValid}=validateContact(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    await db1.collection("messages").doc(shortid.generate()).set({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      date: Date.now(),
    });
    try {
      const html="<h3> Customer: "+req.body.name+"</h3>"+
         "<p><b>Email: </b>"+ req.body.email+"</p>"+
         "<p><b>Message: </b>"+req.body.message+"</p>";
      await sendEmail("hungbaonguyen.dn@gmail.com",
          "Bahoo Coding Customer Message", html);
      res.send({msg:
          "Your message has been sent to us. we will reply you soon."});
    } catch (error) {
      res.send({msg:
        "There is a proplem with sending your message."});
    }
  }
});

router.get("/", async (req, res)=> {
  await db1.collection("configs").doc("Company_Config").get().then(
      (res1)=>{
        if (res1.data()) {
          res.send(res1.data());
        } else {
          res.status(401).send("The data is not found.");
        }
      },
  ).catch(
      (err)=>{
        res.status(401).send(err);
      },
  );
});
router.post("/", isAuth, isAdmin, async (req, res)=>{
  const {errors, isValid}=validateConfig(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    const config=new Config();
    config.Company_Name=req.body.Company_Name;
    config.Company_Phone=req.body.Company_Phone;
    config.Company_Email=req.body.Company_Email;
    config.Company_Logo=req.body.Company_Logo;
    config.Company_Slogen=req.body.Company_Slogen;
    config.Company_Avatar=req.body.Company_Avatar;
    config.Company_Description=req.body.Company_Description;
    config.Company_Mission=req.body.Company_Mission;
    config.Company_About=req.body.Company_About;
    config.Company_Vision=req.body.Company_Vision;
    config.Company_Address=req.body.Company_Address;
    config.Company_Lat=req.body.Company_Lat;
    config.Company_Long=req.body.Company_Long;
    config.Googlemap_Key=req.body.Googlemap_Key;

    try {
      await db1.collection("configs").doc("Company_Config").set(config.data())
          .then(
              ()=>{
                res.send({msg: "The setting is saved successfully."});
              }).catch(
              (err)=>{
                res.status(401).send({error: err});
              },
          );
    } catch (error) {
      res.status(401).send({error: error.message});
    }
  }
});
router.get("/create", async (req, res)=>{
  const config = new Config();
  config.Company_Name="My Coffee";
  config.Company_Phone="12345678";
  config.Company_Email="hungbaonguyen.dn@gmail.com";
  config.Company_Address=
  "K20/6 Phần Lăng 8, phường An Khê, quận Thanh Khê, TP Đà Nẵng";
  await db1.collection("configs").doc("Company_Config").set(config.data()).then(
      (res1)=>{
        res.send(res1);
      },
  ).catch(
      (err)=>{
        res.status(401).send(err);
      },
  );
});
module.exports=router;
