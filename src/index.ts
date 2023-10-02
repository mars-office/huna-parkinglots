import express, { Request, Response , Application } from 'express';
import dotenv from 'dotenv';

// For env File 
dotenv.config();

const app: Application = express();

app.get('/api/gpt/health', (req: Request, res: Response) => {
  res.send('OK');
});

app.listen(3001, () => {
  console.log(`Server is Fire at http://localhost:3001`);
});
