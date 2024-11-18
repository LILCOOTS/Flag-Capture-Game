const socket = io();

const chat_messages = document.getElementById("chat-messages");
const input = document.getElementById("chat-input");
const form = document.getElementById("chat-form");
const gridContainer = document.getElementById("game-grid");

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

socket.on("change", (clickedBox) => {
  const box = document.querySelector(`[data-index="${clickedBox}"]`);
  box.style.backgroundColor = "blue";
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
    box.textContent = "1";
    box.setAttribute("data-index", i); //to target each grid
    box.style.backgroundColor = "#ff4500";
    gridContainer.appendChild(box);
  }
}
gridContainer.addEventListener("click", (event) => {
  const clickedBox = event.target;
  console.log(clickedBox);

  // Check if a grid-box was clicked
  if (clickedBox.classList.contains("grid-box")) {
    // Perform any action you want on the clicked box
    const boxIndex = clickedBox.getAttribute("data-index");
    console.log(`Box ${boxIndex} clicked`);
    clickedBox.style.backgroundColor = "blue";

    socket.emit("changeColor", boxIndex);
  }
});
