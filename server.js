const express = require('express');
const { static } = express;
const path = require('path');
const fs = require('fs')
const nba = JSON.parse(fs.readFileSync('players.json', 'utf8'));
const team = JSON.parse(fs.readFileSync('team.json', 'utf8'));
const app = express();

app.use('/dist', static(path.join(__dirname, 'dist')));

app.get('/', (req, res, next)=> res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/players', async(req, res, next)=> {
  try {
    res.send(await Player.findAll());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/teams', async(req, res, next)=> {
    try {
      res.send(await Team.findAll());
    }
    catch(ex){
      next(ex);
    }
  });

const init = async()=> {
  try {
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  }
  catch(ex){
    console.log(ex);
  }
};

const Sequelize = require('sequelize');
const { STRING } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/nba_db');

const Player = conn.define('player', {
  name: {
      type: STRING
  },
  teamName:{
      type: STRING
  } 
});

const Team = conn.define('team', {
    name:{
    type: STRING
    },
    location:{
        type: STRING
    },
    logoUrl:{
        type: STRING
    }
})

Player.belongsTo(Team)
Team.hasMany(Player)

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  await Promise.all( nba.map((player) =>
      Player.create({
        name: player.name,
        teamName: player.team
        
      })
    )
  ) 
  await Promise.all( team.map((team) =>
  Team.create({
    name: team.name,
    location: team.location,
    logoUrl: team.logoUrl,
    
  })
)
) 

};

init();

