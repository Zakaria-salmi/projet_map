const express = require('express')
const cors = require('./middlewares/cors')
const cityRoutes = require('./routes/cityRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors)

app.get('/', (req, res) => {
  res.json({ message: 'API en ligne' })
})

app.use('/api/cities', cityRoutes)

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
