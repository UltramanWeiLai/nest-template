import { parse } from 'yaml';
import * as path from 'path';
import * as fs from 'fs';

export const ENV = process.env.RUN_ENV;

export const loadEnvConfig = () => {
  const filePath = path.join(process.cwd(), `./config/.${ENV}.yaml`);
  const file = fs.readFileSync(filePath, 'utf8');
  return parse(file);
};
