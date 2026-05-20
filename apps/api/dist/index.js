"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
// Import router modules (to be created next)
const auth_1 = __importDefault(require("./routes/auth"));
const organizaciones_1 = __importDefault(require("./routes/organizaciones"));
const ayudas_1 = __importDefault(require("./routes/ayudas"));
const hospitales_1 = __importDefault(require("./routes/hospitales"));
const reportes_1 = __importDefault(require("./routes/reportes"));
const victimas_1 = __importDefault(require("./routes/victimas"));
const logs_1 = __importDefault(require("./routes/logs"));
const comunicados_1 = __importDefault(require("./routes/comunicados"));
const pronunciamientos_1 = __importDefault(require("./routes/pronunciamientos"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false // Allows loading uploaded assets from frontend
}));
app.use((0, cors_1.default)({
    origin: '*', // Customize this in production to point to our Next.js frontend port
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Global Rate Limiting - Protection from Denial of Service (DoS)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per windowMs
    message: { error: 'Demasiadas peticiones desde esta dirección IP. Inténtelo de nuevo más tarde.' }
});
app.use(limiter);
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../../../uploads')));
// Healthy Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servicio de Ayuda Humanitaria activo', timestamp: new Date() });
});
// Register REST Routes
app.use('/api/auth', auth_1.default);
app.use('/api/organizaciones', organizaciones_1.default);
app.use('/api/ayudas', ayudas_1.default);
app.use('/api/hospitales', hospitales_1.default);
app.use('/api/reportes', reportes_1.default);
app.use('/api/victimas', victimas_1.default);
app.use('/api/logs', logs_1.default);
app.use('/api/comunicados', comunicados_1.default);
app.use('/api/pronunciamientos', pronunciamientos_1.default);
// Centralized error-handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: 'Ocurrió un error interno en el servidor.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Servidor API REST corriendo en puerto ${PORT}`);
    console.log(`Salud de la API: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
});
