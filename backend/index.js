const auth = require('./src/auth');
const articles = require('./src/articles');
const profile = require('./src/profile');
const following = require('./src/following');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// Connect to MongoDB
const mongoose = require('mongoose');
const connectionString = 'mongodb+srv://ya15:M6TbOmjR95aJPel1@cluster0.n2ntn.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
auth.methods(app);
articles(app);
profile(app);
following(app);

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
     const addr = server.address();
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
});