import { Router } from 'express';
import Bedrock from '../controller/Bedrock.js';

const router = Router();

router
  .get('/bedrock', Bedrock.readAll)
  .get('/bedrock/:id', Bedrock.readOne)
  .post('/bedrock', Bedrock.create)
  .put('/bedrock/:id', Bedrock.update)
  .delete('/bedrock/:id', Bedrock.delete)
  .post('/bedrock/run/:id', Bedrock.run)
  .post('/bedrock/stop/:id', Bedrock.stop);

export default router;
