import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Ignition!");
});

router.get("/hello", function (req, res, next) {
  const name = req.query.name ?? 'World';
  res.set('Content-Type', 'text/plain');
  res.send(`Hello, ${name}!`)
});

export default router;