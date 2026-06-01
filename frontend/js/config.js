// Configuração centralizada da API
// Carregue este arquivo ANTES de qualquer script que use API_URL
// Ex: <script src="/js/config.js"></script>
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3333'
    : 'https://lume-api-xi0p.onrender.com';

// Torna acessível globalmente para todos os scripts (inline e módulos)
window.API_URL = API_URL;
