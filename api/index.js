import { createApp } from '../server/app.mjs';
import { getRepository } from '../server/db.mjs';

let appInstance = null;

function getApp() {
  if (!appInstance) {
    const repo = getRepository();
    appInstance = createApp(repo);
  }
  return appInstance;
}

export default async function handler(req, res) {
  const app = getApp();
  // Guarantee route compatibility whether /api is preserved or stripped by rewrite
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
