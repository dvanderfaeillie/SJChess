function getRangschikking(spelerArray){
  let div = $('#rangschikking')
  let table = div.children('table')
  let tbody = table.children('tbody')
  tbody.html('')

  for(let i = 0; i < spelerArray.length; i++){
    let obj = spelerArray[i]
    Speler.create(obj.id, knex).then(function(speler){
      let str = ''
      let t = i+1
      str += '<tr id=\'speler'+t+'\'>'
      if (t > 1){
        let vorigeScore = $('#speler'+(t-1)).children('.score').html()
        let vorigeAantal = $('#speler'+(t-1)).children('.count').html()
        if(vorigeAantal == obj.aantal && vorigeScore == obj.score){
          t = ''
        }
      }
      str += '<td>'+t+'</td>'
      str += '<td>'
        str += '<span class=\'fa fa-fw '
        str += (speler.geslacht == 'm') ? 'fa-male text-primary' : 'fa-female text-danger'
        str += '\'></span> '
        str += speler.voornaam+' '+speler.naam
      str += '</td>'
      str += '<td class=\'text-center score\'>'
        str += obj.score
      str += '</td>'
      str += '<td class=\'text-center count\'>'
        str += obj.aantal
      str += '</td>'
      str += '</tr>'

      tbody.html(tbody.html() + str)
    })
  } //end for
}

function getRangschikkingExport(tornooiId){
  function getSpelers(tornooiId){
    let spelerArray = []
    return knex('spelers').pluck('id')
      .where('tornooiId',tornooiId)
      .then(function(spelers){
        return Tornooi.create(tornooiId, knex).then(function(tornooi){
          spelerArray = SJCEngine.sortSpelers(spelers, tornooi)
          return spelerArray
        })
      })
  }

  function stringifySpeler(obj, knex){
    return Speler.create(obj.id, knex).then(function(speler){
      return {speler: speler.voornaam+' '+speler.naam,
              score: obj.score,
              aantal: obj.aantal}
    })
  }

  function stringifySpelers(tornooiId){
    let returnArray = []
    return getSpelers(tornooiId).then(function(spelerArray){
      for(let i = 0; i < spelerArray.length; i++){
        let obj = spelerArray[i]
        stringifySpeler(obj, knex).then(function(data){
          returnArray.push(data)
        })
      }
      return returnArray
    })
  }

  return stringifySpelers(tornooiId).then(function(returnArray){
    return knex('tornooien') //ugly hack???
      .select('id')
      .then(function(temp){
        let str = 'Tussenstand op '+moment().format('YYYY-MM-DD')+'\n'
        for(let i = 0; i < returnArray.length; i++){
          let obj = returnArray[i]
          if(!(i > 0 && returnArray[i-1].score === obj.score && returnArray[i-1].aantal === obj.aantal)){
            str += (i+1)
          }
          str += ' \t'
          str += obj.speler + '\t'
          str += obj.score + '\t'
          str += obj.aantal
          str += '\n'
        }
        return str
      })
  })

}
