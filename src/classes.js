/** Class die een speler voorstelt. */
class Player {
  constructor(id, surname, name, sex){
    this.id = id
    this.name = name
    this.surname = surname
    this.sex = sex
  }

  static create(id, knex) {
    return knex('players').where({id: id})
             .select('surname','name','sex')
             .first().then(function(r){
                return new Player(id, r.surname, r.name, r.sex)
              })
  }
}

/** Class which represents a game. */
class Game {
  constructor(id, whitePlayerId, blackPlayerId, result, date){
    this.id = id
    this.whitePlayerId = whitePlayerId
    this.blackPlayerId = blackPlayerId
    this.result = result
    this.date = date
    this.bye = typeof blackPlayerId === 'undefined'
  }

  getScore(playerId){
    let score = 0
    if(this.whitePlayerId === playerId){
      score += this.result === 2 ? 0.5 : 0
      score += this.result === 1 ? 1 : 0
    } else if (this.blackPlayerId === playerId){
      score += this.result === 2 ? 0.5 : 0
      score += this.result === 3 ? 1 : 0
    }
    return score
  }

  static create(id, knex) {
    return knex('games').where({id: id})
             .select('whitePlayerId','blackPlayerId','result','date')
             .first().then(function(r){
                return new Game(id, r.whitePlayerId, r.blackPlayerId, r.result, r.date)
              })
  }
} //end class

/** Class die een tornooi voorstelt. */
class Tournament {
  constructor(id, name, date, games){
    this.id = id
    this.name = name
    this.date = date
    this.games = games
  }

  getScore(playerId){
    let score = 0
    this.games.forEach(function(game){
      score += game.getScore(playerId)
    })
    return score
  }

  getPlayerIds(){
    let players = []
    this.games.forEach(function(game){
      if(players.indexOf(game.whitePlayerId) === -1){
        players.push(game.whitePlayerId)
      }
      if(typeof game.blackPlayerId !== 'undefine' && players.indexOf(partij.blackPlayerId) === -1){
        players.push(game.blackPlayerId)
      }
    })
    return players
  }

  getNumberOfGames(playerId){
    let count = 0
    this.games.forEach(function(game){
      count += game.whitePlayerId === playerId || game.blackPlayerId === playerId
    })
    return count
  }

  getNumberOfWhiteGames(playerId){
    let count = 0
    this.games.forEach(function(game){
      count += game.whitePlayerId === playerId
    })
    return count
  }

  alreadyPlayed(playerId1, playerId2){
    let flag = false
    this.games.forEach(function(game){
      flag += (game.whitePlayerId === playerId1 && game.blackPlayerId === playerId2) ||
                (game.whitePlayerId === playerId2 && game.blackPlayerId === playerId1)
    })
    return flag
  }

  static create (id, knex) {
    function getGames (id){
      let games = []
      return knex('games').join('players','players.id','games.whitePlayerId')
                     .join('tournaments','players.tournamentId','tournaments.id')
                     .where('tournaments.id',id)
                     .select('games.id')
                     .then(function(result){
                       result.forEach(function(row){
                         Game.create(row.id, knex).then(function(r){
                           games.push(r)
                         })
                       })
                       return games
                     })
    } //end function

    return getGames(id).then(function(games){
      return knex('tournaments').select('name','date')
        .where('id',id)
        .first()
        .then(function(r){
          return new Tournament(id, r.name, r.date, games)
        })
    })
  } // end static create
} //end class


class SJCEngine {
  static sortPlayers(availablePlayers, tournament){
    function compare(a, b) {
      let comparison = 0
      if (a.score > b.score) {
        comparison = -1
      } else if (a.score < b.score) {
        comparison = 1
      } else { // if sortField is equal
        if(a.count < b.count){
          comparison = -1
        } else if (a.count > b.count) {
          comparison = 1
        }
      }
      return comparison
    }

    /* Sorting the available players on their score */
    let playerArray = []
    availablePlayers.forEach(function(playerId){
      //flag = true
      //if(flag){
        playerArray.push({
          id: playerId,
          score: tournament.getScore(playerId),
          count: tournament.getNumberOfGames(playerId),
          countWhite: tournament.getNumberOfWhiteGames(playerId),
          sortField: tournament.getNumberOfGames(playerId) !== 0 ? tournament.getScore(playerId)/tournament.getNumberOfGames(playerId) : 0
        })
      //}
    })
    playerArray.sort(() => Math.random() - 0.5)
    playerArray.sort(compare)

    return playerArray
  }

  static executePairing(playerArray, tournament){
    for(let i = 0; i < playerArray.length; i++){
      let player1 = playerArray[i]
      let t = i+1
      let flagFoundMatch = false
      while(!flagFoundMatch && t < playerArray.length){
        let player2 = playerArray[t]
        flagFoundMatch += !tournament.alreadyPlayed(player1.id, player2.id)
        if(flagFoundMatch){ // Match gevonden
          if(tournament.getNumberOfWhiteGames(player1.id) <= tournament.getNumberOfWhiteGames(player2.id)){
            knex('games').insert({
              whitePlayerId: player1.id,
              blackPlayerId: player2.id,
              date: moment().format('YYYY-MM-DD')
            }).then()
          } else {
            knex('games').insert({
              whitePlayerId: player2.id,
              blackPlayerId: player1.id,
              date: moment().format('YYYY-MM-DD')
            }).then()
          }
          playerArray.splice(t,1)
          playerArray.splice(0,1)
          i--
        } else {
          t++
        }
      }
    } // endfor
    getGames(true)
  }
}
