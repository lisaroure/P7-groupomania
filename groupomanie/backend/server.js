// require('dotenv').config({ path: './config/.env' })
const path = require('path');
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

/*** Initialiser l'API */
const app = express()

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: "Origin, X-Requested-With, x-access-token, role, Content, Accept, Content-Type, Authorization"
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/', userRoutes);
app.use('/api/post', postRoutes);

/*** Routage */
app.get('/', (req, res) => res.send(`Server OK`))
app.get('*', (req, res) => res.status(501).send('Error server'))

/*** Start server & MongoDB */
mongoose
    .connect(
        "mongodb+srv://" + process.env.DB_USER_PASS + "@cluster0.zanmi7c.mongodb.net/test",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    .then(() => console.log('Connected to MongoDB'))
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })
    })
    .catch(err => console.log('Connexion MongoDB failed', err))