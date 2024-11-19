const socket = io();

const chat_messages = document.getElementById("chat-messages");
const input = document.getElementById("chat-input");
const form = document.getElementById("chat-form");
const gridContainer = document.getElementById("game-grid");
const sidebar = document.getElementById("sidebar-player-list");
const startBtn = document.getElementById("start");

const system_message_template =
  document.getElementById("system-message").innerHTML;

const player_tag_template = document.getElementById("player-tag").innerHTML;

const { userName, roomName, boxes } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("roomJoin", { userName, roomName, boxes });

socket.on("createGame", (info) => {
  generateGrid(info.boxes);
});

socket.on("systemMsg", (msg) => {
  const html = Mustache.render(system_message_template, {
    message: msg,
  });
  chat_messages.insertAdjacentHTML("beforeend", html);
});

socket.on("displayPlayer", (info) => {
  const html = Mustache.render(player_tag_template, {
    users: info,
  });
  sidebar.innerHTML = html;
});

socket.on("change", (clickedBox, name, color) => {
  const box = document.querySelector(`[data-index="${clickedBox}"]`);
  box.style.backgroundColor = color;
  box.innerText = name;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = input.value;
  if (value) {
    socket.emit("sendMsg", value);
  }
  input.value = "";
});

function generateGrid(boxes) {
  const gridContainer = document.getElementById("game-grid");
  gridContainer.innerHTML = ""; // Clear any existing boxes

  if (boxes > 25) {
    var rows = Math.ceil(Math.sqrt(boxes)); // Calculate the number of rows
    var cols = Math.ceil(boxes / rows); // Calculate the number of columns
  } else {
    var cols = Math.ceil(Math.sqrt(boxes)); // Calculate the number of rows
    var rows = Math.ceil(boxes / cols); // Calculate the number of columns
  }
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let i = 0; i < boxes; i++) {
    const box = document.createElement("div");
    box.classList.add("grid-box");
    box.textContent = "Play";
    box.setAttribute("data-index", i); //to target each grid
    box.style.backgroundColor = "grey";
    gridContainer.appendChild(box);
  }
}

startBtn.addEventListener("click", () => {
  console.log("clicked");
  socket.emit("startGame");
});

gridContainer.addEventListener("click", (event) => {
  const clickedBox = event.target;
  console.log(clickedBox);

  // Check if a grid-box was clicked
  if (clickedBox.classList.contains("grid-box")) {
    // Perform any action you want on the clicked box
    const boxIndex = clickedBox.getAttribute("data-index");

    socket.emit("changeColor", boxIndex, userName);
    socket.emit("changeBoxInfo", boxIndex, userName);
  }
});
