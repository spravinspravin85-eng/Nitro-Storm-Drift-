
import { io } from
  "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

const SERVER_URL = "https://YOUR-MULTIPLAYER-SERVER";

export function createMultiplayer(onOpponentUpdate = () => {}) {
  const socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"]
  });

  const status = document.getElementById("online-status");
  const playersList = document.getElementById("online-players");
  const results = document.getElementById("player-results");
  const invitation = document.getElementById("incoming-invitation");

  let connected = false;
  let username = "";

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  socket.on("connect", () => {
    connected = true;
    showStatus("Connected to NSD Online");
  });

  socket.on("disconnect", () => {
    connected = false;
    showStatus("Disconnected from server");
  });

  function login(name) {
    username = name.trim();

    socket.emit("player:login", username, response => {
      if (!response?.ok) {
        showStatus(response?.error || "Login failed");
        return;
      }

      showStatus("Welcome " + username);
      socket.emit("players:search", "");
    });
  }

  socket.on("players:list", renderPlayers);
  socket.on("players:refresh", () => {
    if (connected) socket.emit("players:search", "");
  });

  socket.on("players:results", renderPlayers);

  function renderPlayers(players) {
    if (!playersList) return;

    playersList.innerHTML = "";

    players.forEach(player => {
      const row = document.createElement("div");
      row.textContent = player.username +
        (player.inRace ? " - IN RACE" : " - ONLINE");

      const button = document.createElement("button");
      button.textContent = "INVITE";
      button.disabled = player.inRace;

      button.addEventListener("click", () => {
        socket.emit("player:invite", player.username);
      });

      row.appendChild(button);
      playersList.appendChild(row);
    });
  }

  socket.on("invite:received", data => {
    if (!invitation) return;

    invitation.textContent =
      data.username + " invited you to race.";

    const accept = document.createElement("button");
    accept.textContent = "ACCEPT RACE";

    accept.onclick = () => {
      socket.emit("invite:accept");
      invitation.textContent = "Joining race...";
    };

    invitation.appendChild(accept);
  });

  socket.on("invite:error", showStatus);
  socket.on("invite:sent", name => {
    showStatus("Invitation sent to " + name);
  });

  socket.on("match:searching", () => {
    showStatus("Searching for opponent...");
  });

  socket.on("match:ready", data => {
    showStatus("Opponent found: " + data.players.join(" vs "));
  });

  socket.on("race:start", () => {
    showStatus("RACE STARTED!");
    window.dispatchEvent(new Event("nsd-online-race-start"));
  });

  socket.on("race:opponent", data => {
    onOpponentUpdate(data);
  });

  socket.on("race:opponent-left", data => {
    showStatus(data.username + " disconnected.");
  });

  socket.on("race:player-finished", data => {
    showStatus(data.username + " finished the race!");
  });

  document.getElementById("online-login")?.addEventListener("click", () => {
    const name = document.getElementById("online-username").value;

    if (!name.trim()) return showStatus("Enter a username first.");

    if (!connected) {
      socket.connect();
      socket.once("connect", () => login(name));
    } else {
      login(name);
    }
  });

  document.getElementById("quick-match")?.addEventListener("click", () => {
    socket.emit("match:quick");
  });

  document.getElementById("cancel-match")?.addEventListener("click", () => {
    socket.emit("match:cancel");
  });

  document.getElementById("search-button")?.addEventListener("click", () => {
    const query = document.getElementById("search-player").value;
    socket.emit("players:search", query);
  });

  return {
    socket,

    sendState(car) {
      if (!connected) return;

      socket.emit("race:state", {
        x: car.position.x,
        z: car.position.z,
        heading: car.rotation.y,
        speed: car.userData.speed || 0
      });
    },

    finish(time) {
      socket.emit("race:finish", { time });
    },

    disconnect() {
      socket.disconnect();
    }
  };
}
