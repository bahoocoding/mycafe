const express =require("express");
const Menu=require("../models/menuModel");
const fb=require("../utils/fb");
const db1=fb.firestore();
const router=express.Router();
const validator=require("validator");
const isEmpty=require("lodash.isempty");
const shortid=require("shortid");
/**
 *@param {*} data
 *@return {String}
 */
 function validateMenu(data) {
    const errors={};
    if (Validator.isEmpty(data.Name)) {
      errors.Name="This field is required!";
    }    
    if (Validator.isEmpty(data.Description)) {
      errors.Description="This field is required!";
    }
    if (Validator.isEmpty(data.Avatar)) {
      errors.Avatar="This field is required!";
    }
    return {
      errors,
      isValid: isEmpty(errors),
    };
  }
router.get("/", async (req, res)=>{
    const data=[];
    await db1.collection("menus").where("Enabled", "==", true).get().then(
      (res1)=>{
        res1.forEach((doc)=>{
            data.push(doc.data());
        })
      }
    );
});
router.post("/", async (req, res)=>{
    const {errors, isValid}=validateMenu(req.body);
    if (!isValid) {
      res.send({errors});
    } else {
        const id=shortid.generate();
        const menu=new Menu();
        menu.Id=id;
   await db1.collection("menus").doc("id").set(menu.data());

    }
});




module.exports=router;