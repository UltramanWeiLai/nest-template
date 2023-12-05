import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as pkg from '../package.json';

export const createInterfaceDocument = (app) => {
  const options = new DocumentBuilder().setTitle(pkg.name).setDescription(pkg.description).setVersion(pkg.version).build();
  const doc = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/doc', app, doc);
};
