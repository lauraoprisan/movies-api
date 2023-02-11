const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 3000
require('dotenv').config()

//Mongo Database settings
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'movies'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


app.set('view engine', 'ejs')       //allows us to render webpages using template files, here an ejs templae
app.use(express.static('public'))   //serves static files to the express app via http
app.use(express.urlencoded({ extended: true })) //recognises the incoming data with the request as strings or arrays
app.use(express.json()) //recognises the incoming data with the request as a JSON object

app.get('/',(request, response)=>{
    db.collection('movies').find().sort({likes: -1}).toArray()
    .then(data => {
        response.render('index.ejs', { info: data })
    })
    .catch(error => console.error(error))
})

app.post('/addMovie', (request, response) => {
    db.collection('movies').insertOne({movieName: request.body.movieName,
    director: request.body.director, likes: 0})
    .then(result => {
        console.log('Movie Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('movies').updateOne({movieName: request.body.movieNameS, director: request.body.directorS,likes: request.body.likesS},{
        $set: {
            likes:request.body.likesS + 1
          }
    },{
        sort: {_id: -1},
        upsert: true
    })
    .then(result => {
        console.log('Added One Like')
        response.json('Like Added')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteMovie', (request, response) => {
    db.collection('movies').deleteOne({movieName: request.body.movieNameS})
    .then(result => {
        console.log('Movie Deleted')
        response.json('Movie Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})