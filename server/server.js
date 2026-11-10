
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

const players = new Map();
const waiting = [];
const invitations = new Map();
const matches = new Map();

function cleanUsername(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 16);
}

function publicPlayer(player) {
  return {
    username: player.username,
    online: true,
    inRace: Boolean(player.room)
  };
}

function sendOnlinePlayers(socket) {
  socket.emit(
    "players:list",
    [...players.values()]
      .filter(p => p.id !== socket.id)
      .map(publicPlayer)
  );
}

function createMatch(a, b) {
  if (!a || !b || a.room || b.room) return;

  const room = "race_" + a.id + "_" + b.id;

  a.room = room;
  b.room = room;

  matches.set(room, {
    players: [a.id, b.id],
    started: false,
    states: {}
  });

  const first = io.sockets.sockets.get(a.id);
  const second = io.sockets.sockets.get(b.id);

  first.join(room);
  second.join(room);

  io.to(room).emit("match:ready", {
    room,
    players: [a.username, b.username],
    countdown: 3
  });

  setTimeout(() => {
    const match = matches.get(room);
    if (!match) return;

    match.started = true;
    io.to(room).emit("race:start", {
      startTime: Date.now()
    });
  }, 3000);

  io.emit("players:refresh");
}

function findWaitingPlayer(current) {
  while (waiting.length) {
    const id = waiting.shift();
    const candidate = players.get(id);

    if (
      candidate &&
      candidate.id !== current.id &&
      !candidate.room
    ) {
      return candidate;
    }
  }

  return null;
}

io.on("connection", socket => {
  socket.on("player:login", (rawUsername, callback) => {
    const username = cleanUsername(rawUsername);

    if (username.length < 3) {
      return callback?.({
        ok: false,
        error: "Username must have at least 3 characters."
      });
    }

    const exists = [...players.values()].some(
      p => p.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      return callback?.({
        ok: false,
        error: "Username is already online."
      });
    }

    const player = {
      id: socket.id,
      username,
      room: null
    };

    players.set(socket.id, player);

    callback?.({ ok: true, player: publicPlayer(player) });

    sendOnlinePlayers(socket);
    io.emit("players:refresh");
  });

  socket.on("players:search", rawName => {
    const query = cleanUsername(rawName).toLowerCase();

    const results = [...players.values()]
      .filter(p =>
        p.id !== socket.id &&
        p.username.toLowerCase().includes(query)
      )
      .slice(0, 20)
      .map(publicPlayer);

    socket.emit("players:results", results);
  });

  socket.on("match:quick", () => {
    const player = players.get(socket.id);
    if (!player || player.room) return;

    const opponent = findWaitingPlayer(player);

    if (opponent) {
      createMatch(player, opponent);
    } else if (!waiting.includes(socket.id)) {
      waiting.push(socket.id);
      socket.emit("match:searching");
    }
  });

  socket.on("match:cancel", () => {
    const index = waiting.indexOf(socket.id);
    if (index !== -1) waiting.splice(index, 1);

    socket.emit("match:cancelled");
  });

  socket.on("player:invite", targetName => {
    const sender = players.get(socket.id);
    if (!sender || sender.room) return;

    const target = [...players.values()].find(
      p => p.username.toLowerCase() ===
        cleanUsername(targetName).toLowerCase()
    );

    if (!target || target.room) {
      return socket.emit("invite:error", "Player unavailable.");
    }

    invitations.set(target.id, {
      from: sender.id,
      expires: Date.now() + 30000
    });

    io.to(target.id).emit("invite:received", {
      username: sender.username
    });

    socket.emit("invite:sent", target.username);
  });

  socket.on("invite:accept", () => {
    const invitation = invitations.get(socket.id);
    invitations.delete(socket.id);

    if (!invitation || invitation.expires < Date.now()) {
      return socket.emit("invite:error", "Invitation expired.");
    }

    const sender = players.get(invitation.from);
    const receiver = players.get(socket.id);

    if (!sender || !receiver || sender.room || receiver.room) return;

    createMatch(sender, receiver);
  });

  socket.on("race:state", state => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    const match = matches.get(player.room);
    if (!match || !match.started) return;

    if (
      !state ||
      !Number.isFinite(state.x) ||
      !Number.isFinite(state.z) ||
      !Number.isFinite(state.heading) ||
      !Number.isFinite(state.speed)
    ) return;

    const safeState = {
      username: player.username,
      x: Math.max(-100000, Math.min(100000, state.x)),
      z: Math.max(-100000, Math.min(100000, state.z)),
      heading: Math.max(-1000, Math.min(1000, state.heading)),
      speed: Math.max(0, Math.min(400, state.speed))
    };

    io.to(player.room).emit("race:opponent", safeState);
  });

  socket.on("race:finish", result => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    io.to(player.room).emit("race:player-finished", {
      username: player.username,
      time: Number(result?.time) || 0
    });
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);

    const index = waiting.indexOf(socket.id);
    if (index !== -1) waiting.splice(index, 1);

    invitations.delete(socket.id);

    if (player?.room) {
      const room = player.room;
      const match = matches.get(room);

      io.to(room).emit("race:opponent-left", {
        username: player.username
      });

      if (match) {
        for (const id of match.players) {
          const other = players.get(id);
          if (other) other.room = null;
        }
        matches.delete(room);
      }
    }

    players.delete(socket.id);
    io.emit("players:refresh");
  });
});

app.get("/", (req, res) => {
  res.send("NSD Multiplayer Server is running.");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("NSD multiplayer server listening on", PORT);
});
      
