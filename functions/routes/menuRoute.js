const express=require("express");
const router=express.Router();
const fb =require("../utils/fb");
const db1 = fb.firestore();
const Menu=require("../models/menuModel");
const shortid =require("shortid");
const {isAuth, isAdmin} =require("../utils/auth");
const Validator =require("validator");
const isEmpty =require("lodash.isempty");

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
  
  if (Validator.isEmpty(data.Price.toString())) {
    errors.Price="This field is required!";
  }
  if (!Validator.isNumeric(data.Price.toString())) {
    errors.Price="the value is not valid!";
  }
  if (Validator.isEmpty(data.Order.toString())) {
    errors.Order="This field is required!";
 }
  if (!Validator.isNumeric(data.Order.toString())) {
    errors.Order="The value is not valid!";
  }
  if (Validator.isEmpty(data.Avatar)) {
    errors.Avatar="This field is required!";
  }
  if (Validator.isEmpty(data.Content)) {
    errors.Content="This field is required!";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
router.get("/delete/:id", isAuth, isAdmin, async (req, res)=>{
  if (req.params.id) {
    await db1.collection("menus").doc(req.params.id).delete().then(
        (res1)=>{
          res.send({data: req.params.id});
        },
    ).catch(
        (err)=>{
          res.send({data: null});
        },
    );
  } else {
    res.send({data: null});
  }
});
router.post("/setenabled", isAuth, isAdmin, async (req, res)=>{
  if (req.body && req.body.Id) {
    await db1.collection("menus").
        doc(req.body.Id).update({Enabled: req.body.Enabled}).then(
            (res1)=>{
              res.send({data: req.body.Enabled});
            },
            (err)=>{
              res.send({data: null});
            },
        );
  } else {
    res.send({data: null});
  }
});
router.post("/", isAuth, isAdmin, async (req, res)=>{
  
  const {errors, isValid}=validateMenu(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
   
    const menuId=shortid.generate();
    const menu=new Menu();
    let msg="";
    if (req.body.Id) {
      menu.Id=req.body.Id;
      menu.Enabled=req.body.Enabled;
      msg="The menu is updated.";
    } else {
      menu.Id=menuId;
      msg="The new menu is created.";
    }
    menu.Name=req.body.Name;   
    menu.Price=req.body.Price,
    menu.Order=req.body.Order,    
    menu.Description=req.body.Description;
    menu.Avatar=req.body.Avatar;
    menu.Content=req.body.Content;
   
    try {
      await db1.collection("menus").doc(menu.Id)
          .set(menu.data()).then(
              ()=>{
                res.send({msg: msg});
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
router.get("/content/:id", async (req, res)=>{
  if (req.params.id) {
    try {
      await db1.collection("menus").
          doc(req.params.id).get().then(
              (res1)=>{
                if (res1.data()) {
                  res.send({Content: res1.data().Content});
                } else {
                  res.send({Content: ""});
                }
              },
          ).catch(
              (err)=>{
                res.send({Content: ""});
              },
          );
    } catch (error) {
      res.send({Content: ""});
    }
  }
});
router.get("/menu/:id", async (req, res)=>{
  if (req.params.id) {
    await db1.collection("menus").doc(req.params.id).get().then(
        (res1)=>{
          if (res1.data()) {
            res.send(res1.data());
          } else {
            res.send({});
          }
        },
    ).catch(
        (err)=>{
          res.send({});
        },
    );
  } else {
    res.send({});
  }
});
router.get("/all", async (req, res)=>{
  const data=[];
  await db1.collection("menus").get().then(
      (res1)=>{
        res1.forEach((doc)=>{
          data.push(doc.data());
        });
      },
  );
  res.send(data);
});
router.get("/", async (req, res)=>{
  const data=[];
  await db1.collection("menus").where("Enabled", "==", true).get().then(
      (res1)=>{
        res1.forEach((doc)=>{
          data.push(doc.data());
        });
      },
  );
  res.send(data);
});
router.get("/alias", async (req, res)=>{
  const data=[];
  await db1.collection("menus").where("Enabled", "==", true).get().then(
      (res1)=>{
        res1.forEach((doc)=>{
          data.push({Id: doc.data().Id,
            Alias: doc.data().Alias});
        });
      },
  );
  res.send(data);
});
module.exports=router;
