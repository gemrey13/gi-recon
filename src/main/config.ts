import { app } from 'electron';
import fs from 'fs';
import path from 'path';

type AppConfig = {
  posDataPath?: string;
};

const CONFIG_PATH = path.join(
  app.getPath('userData'),
  'config.json'
);

let cachedConfig: AppConfig | null = null;

function loadConfig(): AppConfig | null {
  if (cachedConfig) return cachedConfig;

  if (!fs.existsSync(CONFIG_PATH)) {
    cachedConfig = {};
    return cachedConfig;
  }

  try {
    cachedConfig = JSON.parse(
      fs.readFileSync(CONFIG_PATH, 'utf-8')
    );
  } catch {
    cachedConfig = {};
  }

  return cachedConfig;
}

function saveConfig(config: AppConfig) {
  cachedConfig = config;
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(config, null, 2)
  );
}

export function getPosDataPath(): string | null {
  return loadConfig()?.posDataPath ?? null;
}

export function setPosDataPath(dir: string) {
  const config = loadConfig();
  if (!config) return;
  config.posDataPath = dir;
  saveConfig(config);
}



export function isValidPosDataPath(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  if (!fs.statSync(dir).isDirectory()) return false;

  // Must contain at least one branch folder
  const hasBranch = fs.readdirSync(dir, { withFileTypes: true })
    .some(d => d.isDirectory());

  return hasBranch;
}



const BRANCH_REGEX = /^[A-Z0-9]{2,10}$/;

export function getAllBranches(): string[] {
  const root = getPosDataPath();
  if (!root) return [];

  return fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(name => BRANCH_REGEX.test(name));
}
