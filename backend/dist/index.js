"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const modulos_routes_1 = require("./routes/modulos.routes");
const etiquetas_routes_1 = require("./routes/etiquetas.routes");
const idiomas_routes_1 = require("./routes/idiomas.routes");
const traducciones_routes_1 = require("./routes/traducciones.routes");
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas
app.use('/api/modulos', modulos_routes_1.modulosRouter);
app.use('/api/etiquetas', etiquetas_routes_1.etiquetasRouter);
app.use('/api/idiomas', idiomas_routes_1.idiomasRouter);
app.use('/api/traducciones', traducciones_routes_1.traduccionesRouter);
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida correctamente');
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
    console.log(`Servidor corriendo en el puerto ${port}`);
}));
