const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');

connectToMongo();

const app = express()
const port = 5000

app.use(express.json());
app.use(cors());

// available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// app.get('/', (req, res) => {
//   res.send('Hello Shubhi!')
// })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})