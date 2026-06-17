// Mude para "prod" quando fizer deploy
// Mude para "dev" para desenvolvimento local
const NODE_SERVER = "prod";

const API_URL =
  NODE_SERVER === "dev"
    ? "http://localhost:3333"
    : "https://lume-api-xi0p.onrender.com";

// Torna acessível globalmente para todos os scripts
window.API_URL = API_URL;
