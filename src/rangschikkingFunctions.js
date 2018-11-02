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
