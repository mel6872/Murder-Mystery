import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

const makeId = (bytes = 8) => crypto.randomBytes(bytes).toString("hex");

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

app.post("/api/rooms", (req, res) => {
  const roles = Array.isArray(req.body.roles)
    ? req.body.roles.map(x => String(x).trim()).filter(Boolean)
    : [];

  if (roles.length < 2 || roles.length > 30) {
    return res.status(400).json({ error: "Use between 2 and 30 roles." });
  }

  const roomId = makeId(4).toUpperCase();
  const creatorKey = makeId(24);
  const shuffled = shuffle(roles);

  const slots = {};
  shuffled.forEach((role, i) => {
    slots[String(i + 1)] = {
      role,
      claimed: false,
      token: null
    };
  });

  rooms.set(roomId, {
    creatorKey,
    slots,
    createdAt: Date.now()
  });

  res.json({
    roomId,
    count: shuffled.length,
    joinUrl: `/room/${roomId}`
  });
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Game not found." });

  res.json({
    count: Object.keys(room.slots).length,
    claimed: Object.values(room.slots)
      .filter(slot => slot.claimed)
      .map((_, index) => index)
  });
});

app.post("/api/rooms/:roomId/pick", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Game not found." });

  const number = String(req.body.number ?? "");
  const slot = room.slots[number];

  if (!slot) return res.status(400).json({ error: "That number does not exist." });

  if (slot.claimed) {
    return res.status(409).json({
      error: "That number has already been picked. Choose another."
    });
  }

  const token = makeId(32);
  slot.claimed = true;
  slot.token = token;

  // Only this request receives this role.
  res.json({
    number,
    token,
    role: slot.role
  });
});

app.get("/api/rooms/:roomId/status", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Game not found." });

  // Deliberately reveals ONLY whether a number is taken.
  const status = {};
  for (const [number, slot] of Object.entries(room.slots)) {
    status[number] = slot.claimed;
  }

  res.json({ status });
});

app.get("/api/rooms/:roomId/role/:token", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Game not found." });

  const slot = Object.values(room.slots).find(
    s => s.token === req.params.token
  );

  if (!slot) return res.status(403).json({ error: "Invalid private role token." });

  res.json({ role: slot.role });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Murder Mystery Picker running on port ${port}`);
});