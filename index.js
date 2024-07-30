require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const UserRouter = require('./routes/user');
const cookieParser = require('cookie-parser');
const { restrictToLoggedInUserOnly } = require('./middlewares/auth');

const app = express();
const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB!");
  });

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use("/user", UserRouter);

app.get("/", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/home.html"));});
app.get("/flow", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/flow.html"));});
app.get("/image2", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/image2.html"));});
app.get("/bg", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/bg.html"));});
app.get("/video", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/video.html"));});
app.get("/last-page", restrictToLoggedInUserOnly ,(req,res)=>{return res.sendFile(path.resolve("./public/last-page.html"));});

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});