function getRangschikking(spelerArray){
  let div = $('#rangschikking')
  let table = div.children('table')
  let tbody = table.children('tbody')
  tbody.html('')

  spelerArray.forEach(function(obj){
    Speler.create(obj.id, knex).then(function(speler){
      let str = ''
      str += '<tr>'
      str += '<td>'+(spelerArray.indexOf(obj)+1)+'</td>'
      str += '<td>'
        str += '<span class=\'fa fa-fw '
        str += (speler.geslacht == 'm') ? 'fa-male text-primary' : 'fa-female text-danger'
        str += '\'></span> '
        str += speler.voornaam+' '+speler.naam
      str += '</td>'
      str += '<td class=\'text-center\'>'
        str += obj.score
      str += '</td>'
      str += '<td class=\'text-center\'>'
        str += obj.aantal
      str += '</td>'
      str += '</tr>'

      tbody.html(tbody.html() + str)
    })
  })
}
