const io = require("socket.io-client");
const socket = io("http://localhost:3000");

var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);

function console_out(msg) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.log(msg);
  rl.prompt(true);
}

rl.on("line", function (line) {
  if (line[0] == "/" && line.length > 1) {
    var cmd = line.match(/[a-z]+\b/)[0];
    var arg = line.substr(cmd.length + 2, line.length);
    chat_command(cmd, arg);
  } else {
    // send chat message
    socket.emit("send_all_user", { type: "chat", message: line, from: nick });
    rl.prompt(true);
  }
});
socket.on("newMessage_all_user", (arg) => {
  console_out(arg);
});
// client-side
function chat_command(cmd, arg) {
  switch (cmd) {
    case "nick":
      nick = arg;
      var notice = "Hello " + nick + " !";
      socket.emit("new_user", arg);
      socket.emit("send", { type: "notice", message: notice });
      console_out(notice);
      break;

    case "list":
      socket.emit("channel_list", arg);
      socket.on("channel_list", (arg) => {
        console_out(arg);
      });
      break;

    case "create":
      console_out(nick);
      room = arg;
      socket.emit("new_room", nick, room);
      var notice = "Le channel " + room + " a bien été créé sur le serveur";
      console_out(notice);
      break;

    case "delete":
      room = arg;
      socket.emit("delete_room", room);
      socket.on("delete_room", (arg) => {
        console_out(arg);
      })
      break;

    case "join":
      room = arg;
      socket.emit("join_room", room, nick);
      var notice = nick + " a rejoint le channel " + room;
      console_out(notice);
      break;

    case "leave":
      room = arg;
      socket.emit("leave_room", room, nick);
      socket.on("leave_room", (arg) => {
        console_out(arg);
      })
      break;

    case "users":
      socket.emit("users_list", nick);
      socket.on("users_list", (arg) => {
        console_out(arg);
      });
      break;

    case "msg":
      string = arg.split(" ");
      nickname = string[0];

      string.shift();
      message_string = string;
      message = message_string.join(" ");
      socket.emit("privateMessage", {
        type: "tell",
        message: message,
        to: nickname,
        from: nick,
      });
      break;
    default:
      console_out("That is not a valid command.");
  }
  socket.on("privateMessage", (arg) => {
    console_out(arg);
  });
}
