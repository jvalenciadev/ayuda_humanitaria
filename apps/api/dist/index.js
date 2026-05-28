"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3001;
app_1.default.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Servidor API REST corriendo en puerto ${PORT}`);
    console.log(`Salud de la API: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
});
