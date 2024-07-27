const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  loadTasks();
  socket.emit("load tasks"); // Solicitar tarefas do servidor
});

document.getElementById("task-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value;
  const fornecedor = document.getElementById("fornecedor").value;
  const descricao = document.getElementById("descricao").value;
  const status = document.getElementById("status").value;
  const datetime = new Date().toLocaleString();

  const newTask = {
    codigo,
    fornecedor,
    descricao,
    status,
    datetime,
  };

  socket.emit("new task", newTask);
  saveTaskToLocalStorage(newTask);

  document.getElementById("task-form").reset();
});

socket.on("new task", function (task) {
  addTaskToTable(task);
});

function addTaskToTable(task) {
  const table = document
    .getElementById("task-table")
    .getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();

  const cellCodigo = newRow.insertCell(0);
  const cellFornecedor = newRow.insertCell(1);
  const cellDescricao = newRow.insertCell(2);
  const cellStatus = newRow.insertCell(3);
  const cellDatetime = newRow.insertCell(4);
  const cellActions = newRow.insertCell(5);

  cellCodigo.innerHTML = task.codigo;
  cellFornecedor.innerHTML = task.fornecedor;
  cellDescricao.innerHTML = task.descricao;
  cellStatus.innerHTML = task.status;
  cellDatetime.innerHTML = task.datetime;

  const statusSelect = document.createElement("select");
  const statuses = [
    "Em Armazenamento",
    "Recebido",
    "Em recebimento",
    "Conferência",
    "Aguardando Fiscal",
    "Aguardando Qualidade",
    "Aguardando Armazenagem",
    "Armazenado",
  ];

  statuses.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status;
    option.text = status;
    statusSelect.appendChild(option);
  });

  statusSelect.value = task.status;

  const editButton = document.createElement("button");
  editButton.innerHTML = "Alterar Status";
  editButton.onclick = function () {
    const newStatus = statusSelect.value;
    if (newStatus) {
      task.status = newStatus;
      task.datetime = new Date().toLocaleString();
      cellStatus.innerHTML = newStatus;
      cellDatetime.innerHTML = task.datetime;
      socket.emit("update task", task);
      updateTaskInLocalStorage(task);
    }
  };

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Excluir";
  deleteButton.onclick = function () {
    table.deleteRow(newRow.rowIndex - 1);
    socket.emit("delete task", task);
    deleteTaskFromLocalStorage(task);
  };

  cellActions.appendChild(statusSelect);
  cellActions.appendChild(editButton);
  cellActions.appendChild(deleteButton);
}

function saveTaskToLocalStorage(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  addTaskToTable(task); // Adicionar a tarefa na tabela após salvar
}

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => addTaskToTable(task));
}

socket.on("load tasks", function (tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks)); // Salvar tarefas no local storage
  const table = document
    .getElementById("task-table")
    .getElementsByTagName("tbody")[0];
  table.innerHTML = ""; // Limpar a tabela antes de carregar
  tasks.forEach((task) => addTaskToTable(task));
});

function updateTaskInLocalStorage(updatedTask) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map((task) =>
    task.codigo === updatedTask.codigo ? updatedTask : task
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTaskFromLocalStorage(deletedTask) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((task) => task.codigo !== deletedTask.codigo);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
