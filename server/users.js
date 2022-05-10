const { use } = require("./router");

const users = [];

const AddUser = ({ id, name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const AlreadyUsedUser = users.find((user) => user.room === room && user.name === name);

    if(!name || !room) return {error: 'Sorry, Username and room number is required!'};
    if(AlreadyUsedUser) return {error: 'Username has already been taken, please try again !'};

    const user = { id, name , room};

    users.push(user);

    return {user};
}

const RemoveUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1 ) return users.splice(index, 1)[0];
}

const GetUser = (id) => users.find((user) => user.id === id);
const GetUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {AddUser, RemoveUser, GetUser, GetUsersInRoom};
