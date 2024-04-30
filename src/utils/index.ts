import { parse } from 'yaml';
import * as path from 'path';
import * as fs from 'fs';

export const ENV = process.env.RUN_ENV;

export const loadEnvConfig = () => {
  const filePath = path.join(process.cwd(), `./config/.${ENV}.yaml`);
  const file = fs.readFileSync(filePath, 'utf8');
  return parse(file);
};

const white = []; // 跨域白名单
export const corsOptionsDelegate = (req: Request, callback) => {
  const { url } = req;

  if (white.find((item) => url.startsWith(item))) return callback(null, { origin: true });
  callback(null, { origin: false });
};
