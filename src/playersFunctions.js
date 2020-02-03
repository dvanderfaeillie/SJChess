function getPlayers(){
  let table = $('tbody');
  table.html('')
  let qry = knex.select('players.id','players.name','players.surname','players.sex')
                .from('players')
                .join('tournaments', 'players.tournamentId', 'tournaments.id')
                .where('tournaments.active',1)
                .orderBy('players.name','asc')
  qry.then(function(r){
    for(var i = 0; i < r.length; i++){
      let str = ''
      let player = r[i]
      str += '<tr>'
      str += '<td>'
      str += i+1
      str += '</td>'
      str += '<td>'
      str += '<span class=\'fa fa-fw '
      str += (player.sex === 'm') ? 'fa-male text-primary' : 'fa-female text-danger'
      str += '\'></span> '
      str += player.name+' '+player.surname+'</td>'
      str += '<td>'
      str += '<a href=\'#\' value=\''+player.id+'\' class=\'text-info\'><span class=\'fas fa-fw fa-edit\'></span></a>'
      str += '<a href=\'#\' value=\''+player.id+'\' class=\'text-danger\'><span class=\'fas fa-fw fa-times\'></span></a>'
      str += '</td>'
      str += '</tr>'

      table.html(table.html() + str)
    }
    bindTableButtons()
  })
}

function bindTableButtons(){
  $('a[value]').click(function(e){
    let id = $(this).attr('value');

    if($(this).hasClass('text-danger')){
      bootbox.confirm({
        message: 'Ben je zeker?',
        buttons: {
          confirm: {
            label: 'Ja',
            className: 'btn-success btn-sm'
          },
          cancel: {
            label: 'Nee',
            className: 'btn-danger btn-sm'
          }
        },
        callback: function(result){
          if(result){
            knex('players').where('id', id).del().then(function(){
              getPlayers()
              Lobibox.notify('error', {
                msg: 'Speler werd verwijderd.',
                sound: 'sound3'  });
            })
          }
        }
      })
    } else if ($(this).hasClass('text-info')) {
      addPlayerObj(createBootBoxPlayer,id)
    }
  })
} /* end function bindTableButtons*/

function bootOkObject(id){
  let editFlag = typeof id !== 'undefined'
  let obj = {}
  obj.label = editFlag ? "<span class='fas fa-fw fa-pencil-alt'></span> Wijzig" : "<span class='fas fa-fw fa-plus'></span> Toevoegen";
  obj.className = editFlag ? 'btn-warning btn-sm' : 'btn-success btn-sm';
  obj.callback = function(){
    let surname = $('input[name=surname]').val()
    let name = $('input[name=name]').val()
    let sex = $('input[name=sex]:checked').val()
    let qry
    if(editFlag){
      qry = knex('players').where('id',id)
                               .update({surname: surname, name: name, sex: sex})
    } else {
      qry = knex.from(knex.raw('?? (??, ??, ??, ??)', ['players', 'tournamentId', 'name', 'surname', 'sex']))
                    .insert(function(){
                      this.from('tournaments')
                          .where('active',1)
                          .select('id',knex.raw('?, ?, ?', [name, surname, sex]))
                    })
    }
    qry.then(function(){
      if(editFlag){
        Lobibox.notify('warning', {
          msg: 'Speler gewijzigd.',
          sound: 'sound6'  });
      } else {
        Lobibox.notify('success', {
          msg: 'Speler toegevoegd.',
          sound: 'sound7'  });
      }
      getPlayers()
    })
  }
  return(obj)
}
