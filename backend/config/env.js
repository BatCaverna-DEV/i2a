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
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
  },

  google: {
    // Client ID do OAuth 2.0 criado no Google Cloud Console.
    // É público (aparece no frontend), mas precisa bater com o `aud` do token.
    clientId: required('GOOGLE_CLIENT_ID')
  },

  candidaturas: {
    // domínio exigido no e-mail acadêmico de quem se candidata a uma vaga.
    // Aceita subdomínios (acad.ifma.edu.br passa com ifma.edu.br). Vazio = qualquer e-mail.
    dominioEmail: (process.env.EMAIL_ACADEMICO_DOMINIO ?? 'ifma.edu.br').trim().toLowerCase()
  },

  seed: {
    username: process.env.SEED_ADMIN_USERNAME ?? 'admin',
    nome: process.env.SEED_ADMIN_NOME ?? 'Administrador I2A',
    // e-mail da conta Google que poderá entrar na área administrativa
    email: required('SEED_ADMIN_EMAIL')
  }
};

export default env;
