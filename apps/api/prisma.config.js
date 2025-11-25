'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv/config');
var config_1 = require('prisma/config');
var database_config_js_1 = require('./src/config/database.config.js');
var databaseUrl = (0, database_config_js_1.buildDatabaseUrlFromEnv)();
exports.default = (0, config_1.defineConfig)({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'pnpm exec tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
