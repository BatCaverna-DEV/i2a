import express from 'express';
const app = express();
const port = process.env.PORTA || 3000;

import cors from 'cors';

// Em produção o CORS é gerenciado pelo Apache (evita headers duplicados).
// Em dev local, libera todas as origens.

app.use(cors());
app.use(express.json());

//ROTAS
app.get('/', (req, res) => {
  res.send('<h1 style="text-align: center;">I2A is Online!</h1>');
})

app.listen(port, () => {console.log(`Servidor rodando em http://localhost:${port}`)})