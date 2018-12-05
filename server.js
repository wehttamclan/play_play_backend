const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');

const environment   = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database      = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Play-play';

app.get('/api/v1/favorites', (request, response) => {
  database('songs').select(['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/songs/:id', (request, response) => {
  database('songs').select(['id', 'name', 'artist_name', 'genre', 'song_rating'])
  .where("id", request.params.id)
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/songs', (request, response) => {
  const song = request.body

  const requiredParameters = ['name', 'artist_name', 'genre', 'song_rating']
  for(let parameter of requiredParameters) {
    if (!song[parameter]) {
      return response
        .status(400)
        .send({error: `Missing "${parameter}"`})
    } else if (song['song_rating'] > 100 || song['song_rating'] < 1) {
      return response
        .status(400)
        .send({error: 'Song Rating must be between 1-100'})
    }
  }

  database('songs').insert(song, ['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .then((song) => {
      response.status(200).json({"songs": song[0]});
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.patch('/api/v1/songs/:id', function (request, response) {
  const song   = request.body;
  const songId = request.params.id;

  database('songs').select('id')
  .where("id", songId)
  .update(song)
  .then(() => {
    database('songs').select(['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .where('id', songId)
    .then((updatedSong) => {
      response.status(200).json({ songs: updatedSong[0] });
    })
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});