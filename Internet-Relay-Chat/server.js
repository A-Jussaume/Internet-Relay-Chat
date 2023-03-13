const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  /* ... */
};
const io = require("socket.io")(httpServer, options);

var users = [];
var users_id = [];
var rooms = [];
var rooms_id = [];

io.on("connect", (socket) => {
  console.log("Nouvel utilisateur connecté au serveur");

  socket.on("new_user", (arg) => {
    user = arg;
    users.push(user);
    users_id[user] = socket.id;
    console.log(users);
    // console.log(users_id);
  });

  socket.on("channel_list", (arg) => {
    console.log(arg);
    if (arg === "") {
      socket.emit("channel_list", "Liste des channels : " + rooms);
    } else if (typeof arg === "string") {
      const found = rooms.filter((element) => element === arg);
      room = found;
      socket.emit("channel_list", "Liste des channels : " + room);
    }
  });

  socket.on("new_room", (user, room) => {
    rooms.push(room);
    rooms_id[user] = room;
    socket.join(room);
  });

  socket.on("delete_room", (arg) => {
    room = arg;
    socket.leave(room);
    socket.emit("delete_room", " Le channel " + room + " à bien été supprimé !");
  });

  socket.on("join_room", (room, user) => {
    rooms_id[user] = room;
    console.log(users);
    socket.join(room);
    console.log(user + " a rejoint le channel " + room);
  });

  socket.on("leave_room", (arg, nick) => {
    room = arg;
    user = nick;
    socket.leave(room);
    socket.emit("leave_room", user + " à quitté le channel " + room + " !")
  });

  socket.on("users_list", (arg) => {
    socket.emit("users_list", "Liste des utilisateurs : " + users);
  });

  socket.on("privateMessage", (arg) => {
    from = arg.from;
    // console.log(from);
    to = arg.to
    // console.log(users_id[to]);
    io.to(users_id[to]).emit(
      "privateMessage",
      "Vous avez reçu un message de " + arg.from + " : " + arg.message
    );
  });

  socket.on("send_all_user", (arg) => {
    user = arg.from;
    console.log(arg);
    console.log(rooms_id);
    console.log(rooms_id[user]);
    io.to(rooms_id[user]).emit(
      "newMessage_all_user",
      "Message de " + arg.from + " dans " + rooms_id[user] + " : " + arg.message
    );
  });
});

httpServer.listen(3000);
