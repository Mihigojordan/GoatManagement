"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Allow large request body size (e.g., for file uploads)
    app.use((0, express_1.json)({ limit: '150mb' }));
    app.use((0, express_1.urlencoded)({ limit: '150mb', extended: true }));
    // Cookie support
    app.use((0, cookie_parser_1.default)());
    // Log incoming requests (optional but useful for debugging)
    // app.use((req, res, next) => {
    //   console.log('--- Incoming Request ---');
    //   console.log('Origin:', req.headers.origin);
    //   console.log('Method:', req.method);
    //   console.log('URL:', req.originalUrl);
    //   console.log('Headers:', req.headers);
    //   next();
    // });
    // Serve uploaded files (e.g., images) from "/uploads"
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads',
    });
    // Allowlist of allowed frontend origins
    const allowedOrigins = [
        'http://localhost:5173',
        'https://ishimwefarm.com',
        'https://www.ishimwefarm.com',
    ];
    // CORS setup
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new globalThis.Error(`Not allowed by CORS: ${origin}`));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
