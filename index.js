const express = require('express');
const notificationRoute = require('./routes/notifications');
const mongoose = require('mongoose');
const login= require("./routes/login");
const videoRoute = require('./routes/video');
const dotenv= require("dotenv");
const app = express();
const port = 3000;

dotenv.config();

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => 
        console.log("DB connection successful"))
    .catch((err) => {
        console.log(err);
    });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.json());

app.use("/api/sign", login);

app.use('/api/notifications', notificationRoute);

app.use('/api/videos', videoRoute);

//serving static video files
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
