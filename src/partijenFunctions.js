function getPartijen(todayFlag){
  let div = todayFlag ?  $('#partijenVandaagBody') : $('#partijenBody')
  let table = div.children('table')
  let tbody = table.children('tbody')
  tbody.html('')
  let qry = knex.select('partijen.id',
                        'witspeler.naam as witSpelerNaam',
                        'witspeler.voornaam as witSpelerVoornaam',
                        'zwartspeler.naam as zwartSpelerNaam',
                        'zwartspeler.voornaam as zwartSpelerVoornaam',
                        'partijen.resultaat',
                        'partijen.ts')
                .from('partijen')
                .join('spelers as witspeler', 'witspeler.id', 'partijen.witSpelerId')
                .leftJoin('spelers as zwartspeler', 'zwartspeler.id', 'partijen.zwartSpelerId')
                .join('tornooien', 'witspeler.tornooiId','tornooien.id')
                .where('tornooien.active',1)
  if(todayFlag){
    qry.where('partijen.datum', moment().format('YYYY-MM-DD')).andWhere('partijen.resultaat',0)
  } else {
    qry.where(function() {
      this.where('partijen.datum', '!=', moment().format('YYYY-MM-DD')).orWhere('partijen.resultaat','!=',0)
    })
  }

  qry.orderBy('partijen.ts','desc').then(function(result){
    let str = ''
    result.forEach(function(partij){
      str += '<tr>'
      str += '<td>'
      str += partij.witSpelerVoornaam+' '+partij.witSpelerNaam+' - '
      if(typeof partij.zwartSpelerVoornaam != 'undefined'){
        str += partij.zwartSpelerVoornaam+' '+partij.zwartSpelerNaam
      } else {
        str += 'bye'
      }
      str += '</td>'
      if(partij.resultaat === 0){
        str += '<td class=\'text-center\'>'
        str += '<div class=\'btn-group btn-group-sm\' role=\'group\'>'
        str += '<button value=\''+partij.id+'\' result=\'1\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Wit wint</button>'
        str += '<button value=\''+partij.id+'\' result=\'2\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Remise</button>'
        str += '<button value=\''+partij.id+'\' result=\'3\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Zwart wint</button>'
        str += '</div>'
        str += '</td>'
      } else {
        str += '<td class=\'text-center\'>'
        str += formatResultaat(partij.resultaat)
        str += '</td>'
      }
      str += '<td>'
      str += '<a href=\'#\' value=\''+partij.id+'\' class=\'text-info\'><span class=\'fas fa-fw fa-edit\'></span></a>'
      str += '<a href=\'#\' value=\''+partij.id+'\' class=\'text-danger\'><span class=\'fas fa-fw fa-times\'></span></a>'
      str += '</td>'
      str += '</tr>'
    })
    if(result.length === 0){
      table.hide()
    } else {
      table.show()
      tbody.html(str)
      bindTableButtons()
    }
  })
} // end function

function bindTableButtons(){
  $('.resultBtn').off('click').on('click',function(e){
    let partijId = $(this).attr('value')
    let resultaat = $(this).attr('result')

    let qry = knex('partijen').where('id',partijId)
          .update('resultaat',resultaat)
    qry.then(function(){
      getPartijen()
      getPartijen(true)
      Lobibox.notify('warning', {
        msg: 'Partij gewijzigd.',
        sound: 'sound6'  })
    })
  })

  $('a[value]').off('click').on('click',function(e){
    let id = $(this).attr('value')

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
            knex('partijen').where('id', id).del().then(function(){
              getPartijen()
              getPartijen(true)
              Lobibox.notify('error', {
                msg: 'Partij werd verwijderd.',
                sound: 'sound3'  });
            })
          }
        }
      })
    } else if ($(this).hasClass('text-info')) {
      editPartij(id)
    }
  })
} /* end function bindTableButtons*/

function editPartij(partijId){
  let qry = knex.select('witspeler.naam as witSpelerNaam',
                        'witspeler.voornaam as witSpelerVoornaam',
                        'zwartspeler.naam as zwartSpelerNaam',
                        'zwartspeler.voornaam as zwartSpelerVoornaam',
                        'partijen.resultaat')
                .from('partijen')
                .join('spelers as witspeler', 'witspeler.id', 'partijen.witSpelerId')
                .leftJoin('spelers as zwartspeler', 'zwartspeler.id', 'partijen.zwartSpelerId')
                .where('partijen.id',partijId)

  qry.first().then(function(result){
    let witSpeler = result.witSpelerVoornaam+' '+result.witSpelerNaam
    let zwartSpeler = result.zwartSpelerVoornaam+' '+result.zwartSpelerNaam
    let resultaat = result.resultaat

    let str = ''
    str += '<form role="form">'
    str += '<div class=\'form-group\'>'
      str += '<div class=\'form-row\'>'
        str += witSpeler +' - ' + zwartSpeler
      str += '</div>'
    str += '</div>'

    str += '<div class=\'form-group\'>'
      for(let i = 0; i < 4; i++){
        str += '<div class=\'form-check abc-radio abc-radio-primary\'>'
          str += '<input class=\'form-check-input\' type=\'radio\' value=\''+i+'\' id=\''+i+'\' name=\'resultaat\''
          str += resultaat === i ? 'checked=\'\' ' : ''
          str += '>'
          str += '<label class=\'form-check-label\' for=\''+i+'\'>'+formatResultaat(i, true)+'</label>'
        str += '</div>'
      }
    str += '</div>' // <!-- .form-group -->
    str += '</form>'

    let obj = {
      closeButton: false,
      message: str,
      buttons: {
          cancel: {
              label: "Annuleer",
              className: 'btn-sm'
          },
          ok: {
              label: '<span class=\'fas fa-fw fa-pencil-alt\'></span> Wijzig',
              className: 'btn-sm btn-warning',
              callback: function(){
                let resultaat = $('input[name=resultaat]:checked').val()
                let qry = knex('partijen').where('id',partijId)
                      .update('resultaat',resultaat)
                qry.then(function(){
                  getPartijen()
                  getPartijen(true)
                  Lobibox.notify('warning', {
                    msg: 'Partij gewijzigd.',
                    sound: 'sound6'  })
                })
              }
          }
      }
    }
    bootbox.dialog(obj)
  })
}


function formatResultaat(resultaat, fullFlag = false){
  let str = ''
  switch (resultaat) {
    case 1:
      str = !fullFlag ? '1 - 0' : 'Wit wint'
      break
    case 2:
      str = !fullFlag ? '&frac12; - &frac12;' : 'Remise'
      break
    case 3:
      str = !fullFlag ? '0 - 1' : 'Zwart wint'
      break
    default:
      str = !fullFlag ? '-' : 'Nog geen uitslag'
      break
  }
  return str
}



function createBootBoxSpeler(selection){
  let str = ''
  str += '<form role="form">'
  str += '<div class=\'form-group\'>'
    str += '<div class=\'form-row\'>'
      str += '<div class=\'col-6\'>'
        str += '<input name=\'voornaam\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Voornaam\'>'
      str += '</div>'
      str += '<div class=\'col-6\'>'
        str += '<input name=\'naam\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Naam\'>'
      str += '</div>'
    str += '</div>'
  str += '</div>'

  str += '<div class=\'form-group\'>'
    str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
      str += '<input class=\'form-check-input\' type=\'radio\' value=\'m\' id=\'m\' name=\'geslacht\''
      str += 'checked=\'\' '
      str += '>'
      str += '<label class=\'form-check-label\' for=\'m\'>Mannelijk</label>'
    str += '</div>'
    str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
    str += '<input class=\'form-check-input\' type=\'radio\' value=\'f\' id=\'f\' name=\'geslacht\''
    str += '>'
    str += '<label class=\'form-check-label\' for=\'f\'>Vrouwelijk</label>'
    str += '</div>'
  str += '</div>'
  str += '</form>'

  let obj = {
    closeButton: false,
    message: str,
    buttons: {
        cancel: {
            label: "Annuleer",
            className: 'btn-sm'
        },
        ok: {
            label: '<span class=\'fas fa-fw fa-plus\'></span> Toevoegen',
            className: 'btn-sm btn-success',
            callback: function(){
              let voornaam = $('input[name=voornaam]').val()
              let naam = $('input[name=naam]').val()
              let geslacht = $('input[name=geslacht]:checked').val()
              let qry = knex.from(knex.raw('?? (??, ??, ??, ??)', ['spelers', 'tornooiId', 'naam', 'voornaam', 'geslacht']))
                            .insert(function(){
                              this.from('tornooien')
                                  .where('active',1)
                                  .select('id',knex.raw('?, ?, ?', [naam, voornaam, geslacht]))
                            })
              qry.then(function(id){
                Lobibox.notify('success', {
                  msg: 'Speler toegevoegd.',
                  sound: 'sound7'  });
                selection.setChoices([{value: id, label: voornaam+' '+naam, selected:true}], 'value', 'label');
              })
            }
        }
    }
  }
  bootbox.dialog(obj).on('shown.bs.modal',function(){
    $("input[name=voornaam]").focus()
  });
}
