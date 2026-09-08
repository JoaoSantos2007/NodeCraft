import { fileURLToPath } from 'url';
import SwaggerParser from '@apidevtools/swagger-parser';

const spec = fileURLToPath(new URL('./openapi.json', import.meta.url));

try {
  const api = await SwaggerParser.validate(spec);
  const operations = Object.values(api.paths)
    .flatMap((path) => Object.keys(path).filter((key) => key !== 'parameters'))
    .length;

  // eslint-disable-next-line no-console
  console.log(`Swagger OK — ${Object.keys(api.paths).length} paths, ${operations} operations.`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`Swagger validation failed:\n${err.message}`);
  process.exit(1);
}
