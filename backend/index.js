/**
 * Arquivo principal do backend do Grupo de Pesquisa I2A.
 *
 * Monta a aplicação Express e sobe o servidor HTTP:
 *  1. carrega as variáveis de ambiente (.env) via config/env.js;
 *  2. registra os middlewares globais e as rotas da API;
 *  3. testa a conexão com o MariaDB;
 *  4. opcionalmente sincroniza os models com o banco (apenas em desenvolvimento);
 *  5. trata o encerramento gracioso do processo.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import env from './config/env.js';
import { sequelize } from './config/database.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './helpers/errorHandler.js';
import './models/index.js'; // registra models e associações

/* ------------------------------------------------------------------
 * Aplicação Express
 * ------------------------------------------------------------------ */
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// healthcheck fora do prefixo da API
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// /api → auth, publico, admin
app.use(env.apiPrefix, routes);

// tratamento de erro sempre por último
app.use(notFoundHandler);
app.use(errorHandler);

/* ------------------------------------------------------------------
 * Servidor HTTP
 * ------------------------------------------------------------------ */
async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log(`[db] conectado em ${env.db.host}:${env.db.port}/${env.db.name}`);

    if (env.db.sync) {
      await sequelize.sync({ alter: env.db.syncAlter });
      console.log('[db] models sincronizados com o banco');
    }

    server = app.listen(env.port, () => {
      console.log(`[http] API do I2A ouvindo em http://localhost:${env.port}${env.apiPrefix}`);
      console.log(`[http] ambiente: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('[fatal] não foi possível iniciar a aplicação:', error.message);
    process.exit(1);
  }
}

let server;

async function shutdown(signal) {
  console.log(`\n[http] recebido ${signal}, encerrando...`);
  server?.close(async () => {
    await sequelize.close();
    console.log('[http] encerrado com sucesso');
    process.exit(0);
  });

  // failsafe: se algo travar, derruba em 10s
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] promise rejeitada sem tratamento:', reason);
});

bootstrap();

export default app;
