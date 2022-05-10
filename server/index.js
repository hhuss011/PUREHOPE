// IMPORT ALL THE PACKAGES THAT I WOULD NEED 
// PACKAGES FOR THE LOGIN AND REGISTER PAGE
const dotenv = require('dotenv');
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//CHATROOM PACKAGES 
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const {AddUser, RemoveUser, GetUser, GetUsersInRoom} = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

dotenv.config({path : './config.env'});
require('./db/conn');
const port = process.env.PORT;

// ACCESSING THE MODULE SECTION 
const Users = require('./module/user');

// ESTABLISING A CONNECTING WITH THE FRONTEND 
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());


// REGISTER SECTION 
app.post('/register', async (req,res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const cemail = req.body.cemail;
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        const createUser = new Users({
            username: username,
            email: email, 
            cemail: cemail,
            password: password,
            cpassword: cpassword
        });

        const created = await createUser.save()
        console.log(created);
        res.status(200).send("REGISTERED");
        
    } catch (error) {
        res.status(400).send(error)
    }
})



// LOGIN SECTION 
app.post('/', async (req,res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await Users.findOne({ username: username});

        if(user) { 
            const isMatch = await bcryptjs.compare(password, user.password );

            if(isMatch) {
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 1),
                    httpOnly: true 
                })
                res.status(200).send("LOGGEDIN")
            } else {
                res.status(400).send(" INVALID INFORMATION TRY AGAIN !");
            }
        } else {
            res.status(400).send(" INVALID INFORMATION TRY AGAIN !");

        }
    } catch (error) {
        res.status(400).send(error);
    }
})

//CHATROOM SECTION
io.on('connect', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
      const { error, user } = AddUser({ id: socket.id, name, room });
  
      if(error) return callback(error);
  
      socket.join(user.room);
  
      socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
      socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
  
      io.to(user.room).emit('roomData', { room: user.room, users: GetUsersInRoom(user.room) });
  
      callback();
    });
  
    socket.on('sendMessage', (message, callback) => {
      const user = GetUser(socket.id);
  
      io.to(user.room).emit('message', { user: user.name, text: message });
  
      callback();
    });
  
    socket.on('disconnect', () => {
      const user = RemoveUser(socket.id);
  
      if(user) {
        io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        io.to(user.room).emit('roomData', { room: user.room, users: GetUsersInRoom(user.room)});
      }
    })
  });
  
  server.listen(process.env.port || 3001, () => console.log(`Server has started.`));