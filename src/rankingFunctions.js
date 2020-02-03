function getRanking(playerArray){
  let div = $('#ranking')
  let table = div.children('table')
  let tbody = table.children('tbody')
  tbody.html('')

  for(let i = 0; i < playerArray.length; i++){
    let obj = playerArray[i]
    Player.create(obj.id, knex).then(function(player){
      let str = ''
      let t = i+1
      str += '<tr id=\'player'+t+'\'>'
      if (t > 1){
        let vorigeScore = $('#player'+(t-1)).children('.score').html()
        let vorigeAantal = $('#player'+(t-1)).children('.count').html()
        if(vorigeAantal == obj.count && vorigeScore == obj.score){
          t = ''
        }
      }
      str += '<td>'+t+'</td>'
      str += '<td>'
        str += '<span class=\'fa fa-fw '
        str += (player.sex === 'm') ? 'fa-male text-primary' : 'fa-female text-danger'
        str += '\'></span> '
        str += player.surname+' '+player.name
      str += '</td>'
      str += '<td class=\'text-center score\'>'
        str += obj.score
      str += '</td>'
      str += '<td class=\'text-center count\'>'
        str += obj.count
      str += '</td>'
      str += '</tr>'

      tbody.html(tbody.html() + str)
    })
  } //end for
}

function getRankingExport(tournamentId){
  
  function getPlayers(tournamentId){
    let playerArray = []
    return knex('players').pluck('id')
      .where('tournamentId',tournamentId)
      .then(function(players){
        return Tournament.create(tournamentId, knex).then(function(tournament){
          playerArray = SJCEngine.sortPlayers(players, tournament)
          return playerArray
        })
      })
  }

  function stringifyPlayer(obj, knex){
    return Player.create(obj.id, knex).then(function(player){
      return {player: player.surname+' '+player.name,
              score: obj.score,
              count: obj.count}
    })
  }

  function stringifyPlayers(tournamentId){
    let returnArray = []
    return getPlayers(tournamentId).then(function(playerArray){
      for(let i = 0; i < playerArray.length; i++){
        let obj = playerArray[i]
        stringifyPlayer(obj, knex).then(function(data){
          returnArray.push(data)
        })
      }
      return returnArray
    })
  }

  return stringifyPlayers(tournamentId).then(function(returnArray){
    return knex('tournaments') //ugly hack???
      .select('id')
      .then(function(){
        let str = 'Tussenstand op '+moment().format('YYYY-MM-DD')+'\n'
        for(let i = 0; i < returnArray.length; i++){
          let obj = returnArray[i]
          if(!(i > 0 && returnArray[i-1].score === obj.score && returnArray[i-1].count === obj.count)){
            str += (i+1)
          }
          str += ' \t'
          str += obj.player + '\t'
          str += obj.score + '\t'
          str += obj.count
          str += '\n'
        }
        return str
      })
  })

}
