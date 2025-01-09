import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';
import { ConfigModuleOptions } from '@nestjs/config';
import { ENV } from '.';

export const loadEnvConfig = () => {
  const filePath = path.join(process.cwd(), `./config/.${ENV}.yaml`);
  const file = fs.readFileSync(filePath, 'utf8');
  return parse(file);
};

export const configModuleOptions: ConfigModuleOptions = { isGlobal: true, ignoreEnvFile: true, load: [loadEnvConfig] };
