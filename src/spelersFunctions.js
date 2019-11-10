function getSpelers(){
  let table = $('#spelersBody');
  table.html('')
  let qry = knex.select('spelers.id','spelers.naam','spelers.voornaam','spelers.geslacht')
                .from('spelers')
                .join('tornooien', 'spelers.tornooiId', 'tornooien.id')
                .where('tornooien.active',1)
                .orderBy('spelers.naam','asc')
  qry.then(function(result){
    for(var i = 0; i < result.length; i++){
      let str = ''
      let speler = result[i]
      str += '<tr>'
      str += '<td>'
      str += i+1
      str += '</td>'
      str += '<td>'
      str += '<span class=\'fa fa-fw '
      str += (speler.geslacht == 'm') ? 'fa-male text-primary' : 'fa-female text-danger'
      str += '\'></span> '
      str += speler.naam+' '+speler.voornaam+'</td>'
      str += '<td>'
      str += '<a href=\'#\' value=\''+speler.id+'\' class=\'text-info\'><span class=\'fas fa-fw fa-edit\'></span></a>'
      str += '<a href=\'#\' value=\''+speler.id+'\' class=\'text-danger\'><span class=\'fas fa-fw fa-times\'></span></a>'
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
            knex('spelers').where('id', id).del().then(function(){
              getSpelers()
              Lobibox.notify('error', {
                msg: 'Speler werd verwijderd.',
                sound: 'sound3'  });
            })
          }
        }
      })
    } else if ($(this).hasClass('text-info')) {
      addSpelerObj(createBootBoxSpeler,id)
    }
  })
} /* end function bindTableButtons*/

function bootOkObject(id){
  let editFlag = typeof id !== 'undefined'
  let obj = {}
  obj.label = editFlag ? "<span class='fas fa-fw fa-pencil-alt'></span> Wijzig" : "<span class='fas fa-fw fa-plus'></span> Toevoegen";
  obj.className = editFlag ? 'btn-warning btn-sm' : 'btn-success btn-sm';
  obj.callback = function(){
    let voornaam = $('input[name=voornaam]').val()
    let naam = $('input[name=naam]').val()
    let geslacht = $('input[name=geslacht]:checked').val()
    let qry
    if(editFlag){
      qry = knex('spelers').where('id',id)
                               .update({voornaam: voornaam, naam: naam, geslacht: geslacht})
    } else {
      qry = knex.from(knex.raw('?? (??, ??, ??, ??)', ['spelers', 'tornooiId', 'naam', 'voornaam', 'geslacht']))
                    .insert(function(){
                      this.from('tornooien')
                          .where('active',1)
                          .select('id',knex.raw('?, ?, ?', [naam, voornaam, geslacht]))
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
      getSpelers()
    })
  }
  return(obj)
}
