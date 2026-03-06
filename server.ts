import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API for Medical Data & RL Results
  app.get("/api/simulation-data", (req, res) => {
    res.json({
      network: generateMockNetwork(),
      trainingResults: generateTrainingResults(),
      patientFlow: generatePatientFlow(),
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateMockNetwork() {
  const nodes = [
    { id: "ER", group: 1, label: "Emergency Room" },
    { id: "ICU", group: 1, label: "Intensive Care" },
    { id: "OR", group: 1, label: "Operating Room" },
    { id: "LAB", group: 2, label: "Laboratory" },
    { id: "RAD", group: 2, label: "Radiology" },
    { id: "PHARM", group: 2, label: "Pharmacy" },
    { id: "WARD_A", group: 3, label: "General Ward A" },
    { id: "WARD_B", group: 3, label: "General Ward B" },
  ];
  const links = [
    { source: "ER", target: "ICU", value: 10 },
    { source: "ER", target: "LAB", value: 15 },
    { source: "ICU", target: "OR", value: 8 },
    { source: "OR", target: "WARD_A", value: 12 },
    { source: "LAB", target: "RAD", value: 5 },
    { source: "RAD", target: "ER", value: 7 },
    { source: "WARD_A", target: "PHARM", value: 9 },
    { source: "WARD_B", target: "PHARM", value: 9 },
  ];
  return { nodes, links };
}

function generateTrainingResults() {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      episode: i,
      ppo: 50 + i * 0.5 + Math.random() * 10,
      dqn: 40 + i * 0.3 + Math.random() * 15,
      ddqn: 45 + i * 0.35 + Math.random() * 12,
    });
  }
  return data;
}

function generatePatientFlow() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    arrival: Math.floor(Math.random() * 20) + 5,
    processed: Math.floor(Math.random() * 15) + 5,
    waiting: Math.floor(Math.random() * 30),
  }));
}

startServer();
