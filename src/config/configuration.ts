import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {

  const config = yaml.load(
    readFileSync( join('src','config', YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  const replaceEnvVariables = (obj: any): any => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/\${(.*?)}/g, (_, name) => process.env[name] || '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = replaceEnvVariables(obj[key]);
      }
    }
    return obj;
  };

  return replaceEnvVariables(config);
};
