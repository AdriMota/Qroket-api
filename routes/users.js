import express from "express";
import User from "../models/user.js";
import { authenticate } from "./auth.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {  
  console.log(req.role);
  
  if (req.role.includes("admin")) {
    // Is admin
    User.find().sort('firstname').exec(function(err, users) {
      
      if (err) {
        return next(err);
      }
  
      res.send(users);
    });
  }
  else {
    // Is not admin
    return res.status(403).send("Tu n'as pas les droits :/ !")
  }

});
  

router.post("/", function(req, res, next) {
  // Create a new document from the JSON in the request body 
  const newUser = new User(req.body);

  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
      
    // Send the saved document in the response
    res.send(savedUser);
  });
});

router.get("/", function (req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);

  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }

    // Send the saved document in the response
    res.send(savedUser);
  });
});


export default router;