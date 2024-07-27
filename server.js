const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

// Servir o arquivo socket.io.js da pasta correta
app.get("/socket.io/socket.io.js", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "node_modules",
      "socket.io",
      "client-dist",
      "socket.io.js"
    )
  );
});

let tasks = [];

io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  // Enviar tarefas existentes para o novo cliente
  socket.emit("load tasks", tasks);

  socket.on("new task", (task) => {
    tasks.push(task);
    io.emit("load tasks", tasks); // Atualizar todas as tarefas para todos os clientes
  });

  socket.on("update task", (updatedTask) => {
    tasks = tasks.map((task) =>
      task.codigo === updatedTask.codigo ? updatedTask : task
    );
    io.emit("load tasks", tasks); // Atualizar todas as tarefas para todos os clientes
  });

  socket.on("delete task", (deletedTask) => {
    tasks = tasks.filter((task) => task.codigo !== deletedTask.codigo);
    io.emit("load tasks", tasks); // Atualizar todas as tarefas para todos os clientes
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

server.listen(3000, () => {
  console.log("Servidor escutando na porta 3000");
});
