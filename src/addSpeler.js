function addSpelerObj(callback, spelerId){
  let editFlag = typeof spelerId !== 'undefined'
  let id = editFlag ? spelerId : 0

  let qry =  knex('spelers')
  qry.select('voornaam','naam','geslacht')
     .where('id',id)
  qry.first().asCallback(function(err, result) {
    let voornaam = editFlag ? result.voornaam : ''
    let naam = editFlag ? result.naam : ''
    let geslacht = editFlag ? result.geslacht : ''

    let str = ''
    str += '<form role="form">'
    str += '<div class=\'form-group\'>'
      str += '<div class=\'form-row\'>'
        str += '<div class=\'col-6\'>'
          str += '<input name=\'voornaam\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Voornaam\' value=\''+voornaam+'\'>'
        str += '</div>'
        str += '<div class=\'col-6\'>'
          str += '<input name=\'naam\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Naam\' value=\''+naam+'\'>'
        str += '</div>'
      str += '</div>'
    str += '</div>'

    str += '<div class=\'form-group\'>'
      str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
        str += '<input class=\'form-check-input\' type=\'radio\' value=\'m\' id=\'m\' name=\'geslacht\''
        str += geslacht !== 'f' ? 'checked=\'\' ' : ''
        str += '>'
        str += '<label class=\'form-check-label\' for=\'m\'>Mannelijk</label>'
      str += '</div>'
      str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
      str += '<input class=\'form-check-input\' type=\'radio\' value=\'f\' id=\'f\' name=\'geslacht\''
      str += geslacht == 'f' ? 'checked=\'\' ' : ''
      str += '>'
      str += '<label class=\'form-check-label\' for=\'f\'>Vrouwelijk</label>'
      str += '</div>'
    str += '</div>'
    str += '</form>'

    if(typeof callback === 'function'){
      callback(str, spelerId)
    }
  })
}

function createBootBoxSpeler(str, id){
  let obj = {
    closeButton: false,
    message: str,
    buttons: {
        cancel: {
            label: "Annuleer",
            className: 'btn-sm'
        },
        ok: bootOkObject(id)
    }
  }
  bootbox.dialog(obj).on('shown.bs.modal',function(){
    $("input[name=voornaam]").focus()
  });
}
