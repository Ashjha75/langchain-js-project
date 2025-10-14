console.log("TEST: File starting");

import express from "express";
console.log("TEST: Express imported");

const app = express();
console.log("TEST: App created");

const PORT = 3002;

app.get("/test", (_req, res) => {
  res.json({ message: "Test works!" });
});

app.listen(PORT, () => {
  console.log(`TEST: Server running on port ${PORT}`);
});

console.log("TEST: Listen called");
