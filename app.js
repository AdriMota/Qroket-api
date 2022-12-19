import express from "express";
import createError from "http-errors";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import animalsRouter from "./routes/animals.js";
import locationsRouter from "./routes/locations.js";
import authRouter from "./routes/auth.js";
import mongoose from 'mongoose';
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost/qroket');

const app = express();

app.use(cors());

// Log requests (except in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/animals", animalsRouter);
app.use("/locations", locationsRouter);
app.use("/auth", authRouter);

// Serve the apiDoc documentation.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/apidoc', express.static(path.join(__dirname, 'docs')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //console.warn(err.stack);
  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});


export default app;