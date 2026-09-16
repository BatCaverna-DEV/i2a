/**
 * Instância única (singleton) do Sequelize conectada ao MariaDB.
 */
import { Sequelize } from 'sequelize';
import env from './env.js';

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mariadb',
  logging: env.db.logging ? (msg) => console.log(`[sql] ${msg}`) : false,
  timezone: '-03:00',
  define: {
    // O DER não prevê created_at/updated_at; ligue se quiser auditoria.
    timestamps: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000
  },
  dialectOptions: {
    connectTimeout: 20_000
  }
});

export default sequelize;
