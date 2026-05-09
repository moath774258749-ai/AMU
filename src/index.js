const express = require('express');
const cors = require('cors');
const bot = require('./bot');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ubash API Running');
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});

bot.launch();
console.log('Bot running...');