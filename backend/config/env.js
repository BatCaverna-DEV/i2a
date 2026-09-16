/**
 * Centraliza a leitura do .env. Nenhum outro arquivo deve ler process.env
 * diretamente — assim fica fácil saber quais variáveis o sistema exige.
 */
import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}. Veja o .env.example.`);
  }
  return value;
}

function bool(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'sim'].includes(String(value).toLowerCase());
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? '/api',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    logging: bool('DB_LOGGING', false),
    sync: bool('DB_SYNC', false),
    syncAlter: bool('DB_SYNC_ALTER', false)
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    mfaSecret: required('JWT_MFA_SECRET'),
    mfaExpiresIn: process.env.JWT_MFA_EXPIRES_IN ?? '5m'
  },

  totp: {
    issuer: process.env.TOTP_ISSUER ?? 'Grupo I2A - IFMA',
    window: Number(process.env.TOTP_WINDOW ?? 1)
  },

  seed: {
    username: process.env.SEED_ADMIN_USERNAME ?? 'admin',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
    nome: process.env.SEED_ADMIN_NOME ?? 'Administrador I2A',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@i2a.ifma.edu.br'
  }
};

export default env;
