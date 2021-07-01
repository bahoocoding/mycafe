const express=require("express");
const router=express.Router();
const fb =require("../utils/fb");
const db1 = fb.firestore();
const User=require("../models/userModel");
const Bcrypt=require("bcryptjs");
const {getToken, isAuth, isAdmin} =require("../utils/auth");
const Validator =require("validator");
const isEmpty =require("lodash.isempty");
const shortid = require("shortid");
const {sendEmail} =require("../utils/mailer");
const crypto=require("crypto");

/**
 *  @param {*} data
 * @return {String}
 */
function validateSignin(data) {
  const errors={};
  if (Validator.isEmpty(data.email)) {
    errors.email="This field is required!";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email="Email is not valid!";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password="This field is required!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}

/**
 *  @param {*} data
 * @return {String}
 */
function validateReset(data) {
  const errors={};
  if (Validator.isEmpty(data.email)) {
    errors.email="This field is required!";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email="Email is not valid!";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
/**
 *  @param {*} data
 * @return {String}
 */
function validatePasswordReset(data) {
  const errors={};
  if (Validator.isEmpty(data.userid)) {
    errors.userid="userid is not valid!";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password="password is required!";
  }
  if (Validator.isEmpty(data.token)) {
    errors.token="token is not valid!";
  }
  if (!Validator.equals(data.password, data.passwordconfirmation)) {
    errors.passwordconfirmation="Password must match!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}
/**
 *  @param {*} data
 * @return {String}
 */
function validateUpdate(data) {
  const errors={};
  if (Validator.isEmpty(data.name)) {
    errors.name="This field is required!";
  }
  if (Validator.isEmpty(data.phone)) {
    errors.phone="This field is required!";
  }
  if (Validator.isEmpty(data.address)) {
    errors.address="This field is required!";
  }
  if (Validator.isEmpty(data.avatar)) {
    errors.avatar="This field is required!";
  }
  if (Validator.isEmpty(data._id)) {
    errors._id="_id is not exists!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}
/**
 *  @param {*} data
 * @return {String}
 */
function validateRegister(data) {
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
  if (Validator.isEmpty(data.password)) {
    errors.password="This field is required!";
  }
  if (!Validator.equals(data.password, data.passwordconfirmation)) {
    errors.passwordconfirmation="Password must match!";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
}
router.get("/avatar/:id", async (req, res)=>{
  if (req.params.id) {
    await db1.collection("users").doc(req.params.id).get().then(
        (res1)=>{
          if (res1.data()) {
            res.send({avatar: res1.data().avatar});
          } else {
            res.send({avatar: ""});
          }
        },
    ).catch(
        (err)=>{
          res.send({avatar: ""});
        },
    );
  } else {
    res.send({avatar: ""});
  }
});
router.post("/register", async (req, res)=>{
  const {errors, isValid}=validateRegister(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    let daco=false;
    await db1.collection("users")
        .where("email", "==", req.body.email).get().then(
            (res1)=>{
              res1.forEach((doc)=>{
                if (doc.data()) {
                  daco=true;
                }
              });
            },
        );
    await db1.collection("userpendings")
        .where("email", "==", req.body.email).get().then(
            (res1)=>{
              res1.forEach((doc)=>{
                if (doc.data()) {
                  daco=true;
                }
              });
            },
        );
    if (daco) {
      res.send({msg: "This email is already existed"});
    } else {
      const user=new User();
      user._id=shortid.generate();
      user.name=req.body.name;
      user.email=req.body.email;
      user.password=Bcrypt.hashSync(req.body.password, 10);
      user.isAdmin=false;
      user.log.push({name: "Register", date: Date.now()});
      try {
        await db1.collection("userpendings").
            doc(user._id).set(user.data()).then(
                async (res1)=>{
                  await db1.collection("userpendings").
                      doc(user._id).update({log: user.log});
                  try {
                    const html="<h3> Hello "+user.name+"</h3>"+
                       "<p>Thank you for registering into our application."+
                        "just one more step...</p>"+
                       "<p>To activate your account please follow this "+
                       "link: <a target='_' href='http://localhost:3000/activate/"+
                       user._id+"'>Activate Link</a></p>"+
                    "<p> Cheers! </p>"+
                    "<p> Bahoo Coding Team </p>";
                    await sendEmail("hungbaonguyen.dn@gmail.com",
                        "Bahoo Coding Account Activation Email", html);
                    res.send({msg:
                        "Your account has been created,"+
                        " please check your email to get the activation!",
                    });
                  } catch (error) {
                    res.send({msg:
                      "Your account has been created, We will send you"+
                      " the activation email within 24 hours!"});
                  }
                },
            ).then(
                (err)=>{
                  res.status(401).send({error: "Can not sign up the account."});
                });
      } catch (error) {
        res.status(401).send({error: "Can not sign up the account."});
      }
    }
  }
});

router.post("/resetpassword", async (req, res)=>{
  const {errors, isValid}=validateReset(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    try {
      await db1.collection("users")
          .where("email", "==", req.body.email).get().then(
              async (res1)=>{
                const data=[];
                res1.forEach((doc)=>{
                  data.push({_id: doc.data()._id, name: doc.data().name, email:
                  doc.data().email});
                });
                const user=data[0];
                if (user) {
                  const tokenref=await db1.collection("tokens").
                      doc(user._id).get();
                  if (tokenref.data()) {
                    await db1.collection("tokens").doc(user._id).delete();
                  }
                  const resetToken = await crypto.randomBytes(32).
                      toString("hex");
                  const hash = await Bcrypt.hashSync(resetToken, 10);
                  await db1.collection("tokens").doc(user._id).set(
                      {user_id: user._id,
                        token: hash,
                        createdAt: Date.now(),
                      });
                  const html="<h3> Hello "+user.name+"</h3>"+
                 "<p>Thank you for using our application!"+
                "<p>To change your password, please follow this "+
                "link:<a target='_' href='http://localhost:3000/passwordreset?token="+
                resetToken+"&id="+user._id+"'>Reset your password</a></p>"+
             "<p> Cheers! </p>"+
             "<p> Bahoo Coding Team </p>";
                  try {
                    await sendEmail("hungbaonguyen.dn@gmail.com",
                        "Reset password for Bahoo coding Account", html);
                    res.send({msg:
               "Please check your email, The reset link has been send to you."},
                    );
                  } catch (error) {
                    res.send({error:
                   "Please try again later. The system can not send email now!",
                    });
                  }
                } else {
                  res.send({msg: "The email is not existed."});
                }
              },
          ).catch(
              (err)=>{
                res.send({error:
                   "There is a proplem for checking this email."});
              },
          );
    } catch (error) {
      res.send({error:
        "There is a proplem for checking this email."});
    }
  }
});

router.post("/passwordreset", async (req, res)=>{
  const {errors, isValid}=validatePasswordReset(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    await db1.collection("tokens").doc(req.body.userid).get().then(
        async (res1)=>{
          if (res1.data()) {
            const valid = await Bcrypt.compareSync(req.body.token,
                res1.data().token);
            if (valid) {
              const hash=await Bcrypt.hash(req.body.password, 10);
              await db1.collection("users").doc(req.body.userid).get().then(
                  async (res2)=> {
                    if (res2.data()) {
                      let log=[];
                      log=res2.data().log;
                      log.push({name: "reset password", date: Date.now()});
                      await db1.collection("users").doc(res2.data().
                          _id).update({
                        password: hash,
                        log: log,
                      }).then(
                          async (res3)=>{
                            await db1.collection("tokens").
                                doc(res2.data()._id).delete();
                            res.send({msg: "Your password has been changed!"});
                          },
                      );
                    }
                  },
              );
            }
          } else {
            res.send({error: "The reset token is not valid!"});
          }
        },
    );
    res.send({error: "Can not reset your password!"});
  }
});
router.post("/update", isAuth, async (req, res)=>{
  const {errors, isValid}=validateUpdate(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    await db1.collection("users").doc(req.body._id).get().then(
        async (res2)=>{
          let log=[];
          if (res2.data().log) {
            log=res2.data().log;
          }
          log.push({name: "update", date: Date.now()});
          if (res2.data()) {
            await db1.collection("users").doc(req.body._id).update({
              name: req.body.name,
              phone: req.body.phone,
              address: req.body.address,
              avatar: req.body.avatar,
              log: log,
            }).then(
                async (res1)=>{
                  await db1.collection("users").doc(req.body._id).get().then(
                      (res2)=>{
                        if (res2.data()) {
                          res.send({data: {_id: res2.data().
                              _id, name: res2.data().name, phone:
                             res2.data().phone, address: res2.data().address}});
                        }
                      });
                },
            );
          } else {
            res.send({error: "Failure in updating user."});
          }
        },
    ).catch(
        (err)=>{
          res.send({error: "The user is not found."});
        },
    );
  }
});
router.post("/signin", async (req, res)=>{
  const {errors, isValid}=validateSignin(req.body);
  if (!isValid) {
    res.send({errors});
  } else {
    try {
      await db1.collection("users")
          .where("email", "==", req.body.email).get().then(
              async (res1)=>{
                const data=[];
                const user=new User();
                res1.forEach((doc)=>{
                  user._id=doc.id;
                  user.name=doc.data().name;
                  user.email=doc.data().email;
                  user.password=doc.data().password;
                  user.isAdmin=doc.data().isAdmin;
                  user.phone=doc.data().phone;
                  user.address=doc.data().address;
                  user.avatar=doc.data().avatar;
                  data.push(user);
                });
                const newUser = data[0];
                if (!newUser) {
                  res.send({error: "The account is not found"});
                }

                if (!Bcrypt.compareSync(req.body.password,
                    newUser.password)) {
                  res.send({error: "The password is incorrect"});
                }
                await db1.collection("users").doc(newUser._id).get().then(
                    async (res2)=>{
                      let log=res2.data().log;
                      const log1={name: "login", date: Date.now()};
                      if (log) {
                        log.push(log1);
                        await db1.collection("users")
                            .doc(newUser._id).update({log: log});
                      } else {
                        log=[];
                        log.push(log1);
                        await db1.collection("users")
                            .doc(newUser._id).update({log: log});
                      }
                    },
                );
                res.send({data: {
                  _id: newUser._id,
                  name: newUser.name,
                  email: newUser.email,
                  isAdmin: newUser.isAdmin,
                  phone: newUser.phone,
                  address: newUser.address,
                  token: getToken({_id: newUser._id, name:
                          newUser.name, email: newUser.email,
                  isAdmin: newUser.isAdmin}),
                }});
              }).catch(
              (err)=>{
                res.send({error: "The account is not found"});
              });
    } catch (error) {
      res.send({error: "The account is not found"});
    }
  }
});
router.get("/signout/:id", isAuth, async (req, res)=>{
  if (req.params.id) {
    await db1.collection("users").doc(req.params.id).get().then(
        async (res1)=>{
          if (res1.data() && res1.data().log) {
            const log=res1.data().log;
            const log1={name: "logout", date: Date.now()};
            log.push(log1);
            await db1.collection("users").doc(req.params.id).
                update({log: log}).then(
                    ()=>{
                      res.send(log1);
                    },

                ).catch(
                    ()=>{
                      res.status(401).
                          send({error: "Failure in wringting log."});
                    },
                );
          } else {
            try {
              const log=[];
              const log1={name: "logout", date: Date.now()};
              await db1.collection("users").doc(req.params.id).
                  update({log: log}).then(
                      ()=>{
                        res.send(log1);
                      },
                  ).catch(
                      ()=>{
                        res.status(401).
                            send({error: "Failure in wringting log."});
                      },
                  );
            } catch (error) {
              res.status(401).
                  send({error: "Failure in wringting log to server."});
            }
          }
        },
    ).catch(
        (err)=>{
          res.status(401).send({error: "The User is not found."});
        },
    );
  } else {
    res.status(401).send({error: "The User is not found."});
  }
});
router.get("/", isAuth, isAdmin, async (req, res)=>{
  const data=[];
  try {
    await db1.collection("users").get().then(
        (res1)=>{
          res1.forEach((doc)=>{
            data.push(doc.data());
          });
          res.send(data);
        },
    ).catch(
        (err)=>{
          res.send(data);
        },
    );
  } catch (error) {
    res.send(data);
  }
});
router.get("/activate/:id", async (req, res)=>{
  if (req.params.id) {
    const user=new User();
    await db1.collection("userpendings").doc(req.params.id).get().then(
        async (res1)=>{
          if (res1.data()) {
            user.name=res1.data().name;
            user.email=res1.data().email;
            user.password=res1.data().password;
            user.log=res1.data().log;
            user._id=shortid.generate();
            await db1.collection("users").doc(user._id).set(user.data()).then(
                async (res2)=>{
                  user.log.push({name: "activate", date: Date.now()});
                  await db1.collection("userpendings").
                      doc(res1.data()._id).delete();
                  await db1.collection("users").
                      doc(user._id).update({log: user.log});
                  res.send({msg:
                     "your account is activated, you can go to login now."});
                },
            ).catch(
                (err)=>{
                  res.send(
                      {error: "Your account can not be activated."});
                });
          } else {
            res.send(
                {error: "Your account can not be found for activating."});
          }
        },
    ).catch(
        (err)=>{
          res.send(
              {error: "Your account can not be found for activating."});
        });
  } else {
    res.send(
        {error: "Bad request for activating your account."});
  }
});
router.get("/pending", isAuth, isAdmin, async (req, res)=>{
  const data=[];
  try {
    await db1.collection("userpendings").get().then(
        (res1)=>{
          res1.forEach((doc)=>{
            data.push(doc.data());
          });
          res.send(data);
        },
    ).catch(
        (err)=>{
          res.send(data);
        },
    );
  } catch (error) {
    res.send(data);
  }
});
router.get("/findbyemail", async (req, res)=>{
  const user=new User();
  const data=[];
  const user1=await db1.collection("users")
      .where("email", "==", "hung@gmail.com").get();
  user1.forEach((doc)=>{
    user._id=doc.id;
    user.name=doc.data().name;
    user.email=doc.data().email;
    user.password=doc.data().password;
    user.isAdmin=doc.data().isAdmin;
    data.push(user);
  });
  if (data.length==0) {
    return res.status(401).send("user not found");
  }
  res.send(data[0]);
});
router.get("/createAdmin", async (req, res)=>{
  const user=new User();
  user._id=shortid.generate();
  user.name="Nguyễn Hữu Hưng";
  user.email="hungnguyen196@yahoo.com";
  user.password=Bcrypt.hashSync("@12345", 10);
  user.isAdmin=true;
  try {
    await db1.collection("users").doc(user._id).set(user.data()).then(
        (res1)=>{
          res.send({msg: "Success in creating admin."});
        },
    ).catch(
        (err)=>{
          res.send({error: err});
        },
    );
  } catch (error) {
    res.send({error1: "Failure in creating admin."});
  }
});

module.exports=router;
