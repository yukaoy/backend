const mongoose = require("mongoose");
const md5 = require('md5');
const User = mongoose.model("user", require('./userSchema'));

let sessionUser = {};
let cookieKey = "sid";

let userObjs = {};

function isLoggedIn(req, res, next) {
    // likely didn't install cookie parser
    if (!req.cookies) {
       return res.sendStatus(401);
    }

    let sid = req.cookies[cookieKey];

    // no sid for cookie key
    if (!sid) {
        return res.sendStatus(401);
    }

    let username = sessionUser[sid];

    // no username mapped to sid
    if (username) {
        req.username = username;
        next();
    }
    else {
        return res.sendStatus(401)
    }
}

function login(req, res) { //POST /login
    let username = req.body.username;
    let password = req.body.password;

    // supply username and password
    if (!username || !password) {
        return res.sendStatus(400);
    }


    User.findOne({ username: username }, (err, user) => {
        if (err || !user) {
            return res.sendStatus(401);
        }

        // Create hash using md5, user salt and request password, check if hash matches user hash
        let hash = md5(user.salt + password);

        if (hash === user.hash) {
            // create session id, use sessionUser to map sid to user username 
            let sid = md5(new Date().getTime() + username);

            sessionUser[sid] = username;

            // Adding cookie for session id
            res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'None', secure: true });

            let msg = { username: username, result: 'success' };
            res.send(msg);
        } else {
            res.sendStatus(401);
        }
    });
}

function logout(req, res) { //PUT /logout
    let sid = req.cookies[cookieKey];
    if (sid) {
        User.findOneAndDelete({ sid: sid }, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
        });
        delete sessionUser[sid];
        res.clearCookie(cookieKey);
    }
    res.send({ result: 'Logged out successfully' });
}

function register(req, res) { //POST /register
    let username = req.body.username;
    let password = req.body.password;

    // supply username and password
    if (!username || !password) {
        return res.sendStatus(400);
    }

    let salt = username + new Date().getTime();
    let hash = md5(salt + password);

    let newUser = new User({
        username: username,
        hash: hash,
        salt: salt,
        created: new Date()
    });

    newUser.save((err) => {
        if (err) {
            return res.sendStatus(500);
        }
        userObjs[username] = { username: username, salt: salt, hash: hash };

        let msg = { username: username, result: 'success' };
        res.send(msg);
    }); 
}

function password(req, res) { //PUT /password (stub)
    let username = req.username; // Obtained from isLoggedIn middleware
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    if (!oldPassword || !newPassword) {
        return res.sendStatus(400); // Bad request if passwords are not provided
    }

    let user = userObjs[username];
    if (!user) {
        return res.sendStatus(401); // Unauthorized if user not found
    }

    // Verify old password
    let oldHash = md5(user.salt + oldPassword);
    if (oldHash !== user.hash) {
        return res.sendStatus(401); // Unauthorized if old password is incorrect
    }

    // Update password
    let newHash = md5(user.salt + newPassword);
    userObjs[username].hash = newHash;

    res.send({ result: 'Password updated successfully' });
}

const methods = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.use(isLoggedIn);
    app.put('/logout', logout);
    app.put('/password', password); //stub
}

module.exports = {methods, isLoggedIn};
