const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const path = require('path')
const dbpath = path.join(__dirname, 'moviesData.db')
app.use(express.json())

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running http://localhost:3000')
    })
  } catch (e) {
    console.log('DB Error is ${e.message}')
    process.exit(1)
  }
}
initializeDBAndServer()

const convertMovieDBApi = objectItem => {
  return {
    movieName: objectItem.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
      SELECT movie_name FROM movie;
      `
  const movieArray = await db.all(getMoviesQuery)
  response.send(getMoviesQuery.map(eachMovie => convertMovieDBApi(eachMovie)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addnewMovieQuery = `
     INSERT INTO movie(director_id,movie_name,lead_actor)
     VALUES(${directorId},'${movieName}','${leadActor}');`
  const newMovie = await db.run(addnewMovieQuery)
  response.send('Movie Successfully Added')
})

const convertMovieDBApi3 = objectItem => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getNewMovieQuery = `
    SELCET * FROM movie 
    WHERE movie_id=${movieId};
    `
  const newMovie = await db.get(getNewMovieQuery)
  response.send(convertMovieDBApi3(newMovie))
})

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
      UPDATE movie
      SET director_id=${directorId}, movie_name='${movieName}', lead_actor='${leadActor}';`

  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
       DELETE FROM movie WHERE movie_id=${movieId};
    `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

const convertDirectorDBAPI = objectItem => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;
    `
  const directorArray = await db.all(getDirectorsQuery)
  response.send(
    getDirectorsQuery.map(eachDirector => convertDirectorDBAPI(eachDirector)),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesByDirector = `
       SELECT movie_name as movieName FROM movie WHERE director_id=${directorId}; 
    `
  const getMoviesByDirectorRes = await db.all(getMoviesByDirector)
  response.send(getMoviesByDirectorRes)
})

module.exports = app
