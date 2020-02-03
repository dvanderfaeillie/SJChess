function addPlayerObj(callback, playerId){
  let editFlag = typeof playerId !== 'undefined'
  let id = editFlag ? playerId : 0

  let qry =  knex('players')
  qry.select('surname','name','sex')
     .where('id',id)
  qry.first().asCallback(function(err, result) {
    let surname = editFlag ? result.surname : ''
    let name = editFlag ? result.name : ''
    let sex = editFlag ? result.sex : ''

    let str = ''
    str += '<form role="form">'
    str += '<div class=\'form-group\'>'
      str += '<div class=\'form-row\'>'
        str += '<div class=\'col-6\'>'
          str += '<input name=\'surname\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Voornaam\' value="'+surname+'">'
        str += '</div>'
        str += '<div class=\'col-6\'>'
          str += '<input name=\'name\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Naam\' value="'+name+'">'
        str += '</div>'
      str += '</div>'
    str += '</div>'

    str += '<div class=\'form-group\'>'
      str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
        str += '<input class=\'form-check-input\' type=\'radio\' value=\'m\' id=\'m\' name=\'sex\''
        str += sex !== 'f' ? 'checked=\'\' ' : ''
        str += '>'
        str += '<label class=\'form-check-label\' for=\'m\'>Mannelijk</label>'
      str += '</div>'
      str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
      str += '<input class=\'form-check-input\' type=\'radio\' value=\'f\' id=\'f\' name=\'sex\''
      str += sex == 'f' ? 'checked=\'\' ' : ''
      str += '>'
      str += '<label class=\'form-check-label\' for=\'f\'>Vrouwelijk</label>'
      str += '</div>'
    str += '</div>'
    str += '</form>'

    if(typeof callback === 'function'){
      callback(str, playerId)
    }
  })
}

function createBootBoxPlayer(str, id){
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
    $("input[name=surname]").focus()
  });
}
