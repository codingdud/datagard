require('dotenv').config();

const env = process.env;

const isPlaceholder = (v) => !v || /^your-|^xxxxxxxx|^YourLakehouse/i.test(v);

const fabric = {
  tenantId: env.AZURE_TENANT_ID,
  clientId: env.AZURE_CLIENT_ID,
  clientSecret: env.AZURE_CLIENT_SECRET,
  server: env.FABRIC_SERVER,
  database: env.FABRIC_DATABASE,
  scope: env.FABRIC_SCOPE || 'https://database.windows.net/.default',
};
fabric.isConfigured = ![fabric.tenantId, fabric.clientId, fabric.clientSecret, fabric.server, fabric.database].some(isPlaceholder);

const config = {
  env: env.NODE_ENV || 'development',
  port: parseInt(env.PORT, 10) || 5000,
  corsOrigin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((s) => s.trim()) : '*',
  fabric,
  // Lakehouse / Warehouse table names
  tables: {
    raw: 'raw_records',
    quality: 'quality_results',
    recommendations: 'ai_recommendations',
    reviewQueue: 'human_review_queue',
    approved: 'approved_records',
    ledger: 'ai_decision_ledger',
    governance: 'governance_metrics',
  },
};

module.exports = config;
