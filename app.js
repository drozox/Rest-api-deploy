const express = require('express')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./Schemas/movies.js')
const cors = require('cors')
const app = express()//para crear aplocacion 
const PORT = process.env.PORT ?? 1234
const movies = require('./movies.json')
app.use(cors({
    origin: (origin, callback)=>{
        const ACCEPTED_ORIGINS = [
            'http://localhost:56330',
            'http://localhost:8080',
            'http://localhost:9090',
            'http://localhost:62328'
            //tambien se deberian añadir los origenes de produccion.
        ]
        if(ACCEPTED_ORIGINS.includes(origin) || !origin){
            return callback(null,true)
        }
        return callback(new Error('not allowed CORS'))
    }
}))
app.disable('x-powered-by')
app.use(express.json())

app.get('/', (req, res) => {//cuando la app recibe un get en la ruta '/' realiza la funcion flecha

    res.send('<h1>My page</h1>')
})
//origenes permitidos
const ACCEPTED_ORIGINS = [
    'http://localhost:56330',
    'http://localhost:8080',
    'http://localhost:9090',
    'http://localhost:62328'
    //tambien se deberian añadir los origenes de produccion.
]
//todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
    // const origin = req.header('origin')//esta es la forma de manejar los CORS a pie.
    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {//si el origen de la req está dentro de la lista de los aceptados se añade la cabecera.
    //     res.header('access-control-allow-origin', origin)
    // }
    const { genre } = req.query; // Obtiene el valor del parámetro de consulta 'genre'.
    if (genre) {
        // Si se proporciona el parámetro de género, filtra las películas por ese género.
        const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase()));
        return res.json(filteredMovies); // Devuelve las películas filtradas en formato JSON.
    }
    // Si no se proporciona un parámetro de género, simplemente devuelve todas las películas.
    res.json(movies);
});

app.get('/movies/:id', (req, res) => {// path to regexp
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)
    res.status(404).json({ mensaje: 'movie not found' })
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),// esto crea un uuid v4 esto es un identificador unico universal
        ...result.data// esto es diferente a solo indicar req.body, porque ya esta validado
    }
    movies.push(newMovie)
    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params// se captura la id de la url
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'movie not found' })
    }
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie
    return res.json(updateMovie)

})
app.delete('/movies/:id', (req, res) => {
    // const origin = req.header('origin')//esta es la forma de manejar los CORS a pie.
    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {//si el origen de la req está dentro de la lista de los aceptados se añade la cabecera.
    //     res.header('access-control-allow-origin', origin)
    // }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

// app.options('/movies/:id', (req, res) => {//esta es la forma de manejar los CORS a pie.
//     const origin = req.header('origin')
//     if (ACCEPTED_ORIGINS.includes(origin) || !origin) {//si el origen de la req está dentro de la lista de los aceptados se añade la cabecera.
//         res.header('access-control-allow-origin', origin)
//         res.header('access-control-allow-methods','GET, POST,PATCH,DELETE')

//     }
//     res.send(200)
// })

app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})

app.listen(PORT, () => {
    console.log(`server listening on port  http://localhost:${PORT}`);
})