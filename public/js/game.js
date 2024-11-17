const socket = io();

const chat_messages = document.getElementById("chat-messages");
const input = document.getElementById("chat-input");
const form = document.getElementById("chat-form");

const system_message_template =
  document.getElementById("system-message").innerHTML;

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

socket.on("print", (roomInfo) => {
  console.log(roomInfo[`${roomName}`].userName);
  console.log(roomInfo[`${roomName}`].roomName);
  console.log(roomInfo[`${roomName}`].boxes);
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

  const rows = Math.ceil(Math.sqrt(boxes)); // Calculate the number of rows
  const cols = Math.ceil(boxes / rows); // Calculate the number of columns
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  for (let i = 0; i < boxes; i++) {
    const box = document.createElement("div");
    box.classList.add("grid-box");
    box.textContent = "1"; // Optional: show box number
    gridContainer.appendChild(box);
  }
}
