require('dotenv').config("./env")
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIEDEX = require('./movies-data.json')
const { nextTick } = require('process')

const app = express()
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

function validateBearerToken(req,res, next){
const authToken = req.get('Authorization')
const apiToken = process.env.API_TOKEN
if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request'})
}
next();
}

app.get('/movie', validateBearerToken, function handlegetMovie (req,res){
   let response = MOVIEDEX;
   if (req.query.genre){
       response = response.filter(movies => {
        let genreFilter = movies.genre
       return genreFilter.toLowerCase().includes(req.query.genre.toLowerCase())
       })
   }

   if (req.query.country){
       response = response.filter(movies => {
           let countryFilter = movies.country
           return countryFilter.toLowerCase().includes(req.query.country.toLowerCase())
       })
   }

  if(req.query.avg_vote){
       response = response.filter(movies => {
        let voteFilter = movies.avg_vote
        if(voteFilter >= Number(req.query.avg_vote)){
            return movies
        }
       })
   } 

 return res.json(response)
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production'){
        response = {error: { message: 'server error'}}
    } else{
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 7000

app.listen(PORT, () => {
})