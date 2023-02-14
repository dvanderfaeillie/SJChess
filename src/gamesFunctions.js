function getGames(todayFlag) {
  let div = todayFlag ? $('#partijenVandaagBody') : $('#partijenBody')
  let table = div.children('table')
  let tbody = table.children('tbody')
  tbody.html('')
  let qry = knex.select('games.id',
    'whitePlayer.name as whitePlayerName',
    'whitePlayer.surname as whitePlayerSurname',
    'blackPlayer.name as blackPlayerName',
    'blackPlayer.surname as blackPlayerSurname',
    'games.result',
    'games.ts')
    .from('games')
    .join('players as whitePlayer', 'whitePlayer.id', 'games.whitePlayerId')
    .leftJoin('players as blackPlayer', 'blackPlayer.id', 'games.blackPlayerId')
    .join('tournaments', 'whitePlayer.tournamentId', 'tournaments.id')
    .where('tournaments.active', 1)
  if (todayFlag) {
    qry.where('games.date', moment().format('YYYY-MM-DD')).andWhere('games.result', 0)
  } else {
    qry.where(function() {
      this.where('games.date', '!=', moment().format('YYYY-MM-DD')).orWhere('games.result', '!=', 0)
    })
  }

  qry.orderBy('games.ts', 'desc').then(function(result) {
    let str = ''
    result.forEach(function(game) {
      str += '<tr>'
      str += '<td>'
      str += game.whitePlayerSurname + ' ' + game.whitePlayerName + ' - '
      if (typeof game.blackPlayerSurname != 'undefined') {
        str += game.blackPlayerSurname + ' ' + game.blackPlayerName
      } else {
        str += 'bye'
      }
      str += '</td>'
      if (game.result === 0) {
        str += '<td class=\'text-center\'>'
        str += '<div class=\'btn-group btn-group-sm\' role=\'group\'>'
        str += '<button value=\'' + game.id + '\' result=\'1\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Wit wint</button>'
        str += '<button value=\'' + game.id + '\' result=\'2\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Remise</button>'
        str += '<button value=\'' + game.id + '\' result=\'3\' class=\'btn btn-sm btn-secondary resultBtn\' style=\'padding-top: 0rem; padding-bottom:0rem;\'>Zwart wint</button>'
        str += '</div>'
        str += '</td>'
      } else {
        str += '<td class=\'text-center\'>'
        str += formatResult(game.result)
        str += '</td>'
      }
      str += '<td>'
      str += '<a href=\'#\' value=\'' + game.id + '\' class=\'text-info\'><span class=\'fas fa-fw fa-edit\'></span></a>'
      str += '<a href=\'#\' value=\'' + game.id + '\' class=\'text-danger\'><span class=\'fas fa-fw fa-times\'></span></a>'
      str += '</td>'
      str += '</tr>'
    })
    if (result.length === 0) {
      table.hide()
    } else {
      table.show()
      tbody.html(str)
      bindTableButtons()
    }
  })
} // end function

function bindTableButtons() {
  $('.resultBtn').off('click').on('click', function() {
    let gameId = $(this).attr('value')
    let result = $(this).attr('result')

    let qry = knex('games').where('id', gameId)
      .update('result', result)
    qry.then(function() {
      getGames()
      getGames(true)
      Lobibox.notify('warning', {
        msg: 'Partij gewijzigd.',
        sound: 'sound6'
      })
    })
  })

  $('a[value]').off('click').on('click', function() {
    let id = $(this).attr('value')

    if ($(this).hasClass('text-danger')) {
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
        callback: function(result) {
          if (result) {
            knex('games').where('id', id).del().then(function() {
              getGames()
              getGames(true)
              Lobibox.notify('error', {
                msg: 'Partij werd verwijderd.',
                sound: 'sound3'
              });
            })
          }
        }
      })
    } else if ($(this).hasClass('text-info')) {
      updateGame(id)
    }
  })
} /* end function bindTableButtons*/

function updateGame(gameId) {
  let qry = knex.select('whitePlayer.name as whitePlayerName',
    'whitePlayer.surname as whitePlayerSurname',
    'blackPlayer.name as blackPlayerName',
    'blackPlayer.surname as blackPlayerSurname',
    'games.result')
    .from('games')
    .join('players as whitePlayer', 'whitePlayer.id', 'games.whitePlayerId')
    .leftJoin('players as blackPlayer', 'blackPlayer.id', 'games.blackPlayerId')
    .where('games.id', gameId)

  qry.first().then(function(r) {
    let whitePlayer = r.whitePlayerSurname + ' ' + r.whitePlayerName
    let blackPlayer = r.blackPlayerSurname + ' ' + r.blackPlayerName
    let result = r.result

    let str = ''
    str += '<form role="form">'
    str += '<div class=\'form-group\'>'
    str += '<div class=\'form-row\'>'
    str += whitePlayer + ' - ' + blackPlayer
    str += '</div>'
    str += '</div>'

    str += '<div class=\'form-group\'>'
    for (let i = 0; i < 4; i++) {
      str += '<div class=\'form-check abc-radio abc-radio-primary\'>'
      str += '<input class=\'form-check-input\' type=\'radio\' value=\'' + i + '\' id=\'' + i + '\' name=\'result\''
      str += result === i ? 'checked=\'\' ' : ''
      str += '>'
      str += '<label class=\'form-check-label\' for=\'' + i + '\'>' + formatResult(i, true) + '</label>'
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
          callback: function() {
            let result = $('input[name=result]:checked').val()
            let qry = knex('games').where('id', gameId)
              .update('result', result)
            qry.then(function() {
              getGames()
              getGames(true)
              Lobibox.notify('warning', {
                msg: 'Partij gewijzigd.',
                sound: 'sound6'
              })
            })
          }
        }
      }
    }
    bootbox.dialog(obj)
  })
}


function formatResult(result, fullFlag = false) {
  let str = ''
  switch (result) {
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



function createBootBoxPlayer(selection) {
  let str = ''
  str += '<form role="form">'
  str += '<div class=\'form-group\'>'
  str += '<div class=\'form-row\'>'
  str += '<div class=\'col-6\'>'
  str += '<input name=\'surname\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Voornaam\'>'
  str += '</div>'
  str += '<div class=\'col-6\'>'
  str += '<input name=\'name\' class=\'form-control form-control-sm\' type=\'text\' placeholder=\'Naam\'>'
  str += '</div>'
  str += '</div>'
  str += '</div>'

  str += '<div class=\'form-group\'>'
  str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
  str += '<input class=\'form-check-input\' type=\'radio\' value=\'m\' id=\'m\' name=\'sex\''
  str += 'checked=\'\' '
  str += '>'
  str += '<label class=\'form-check-label\' for=\'m\'>Mannelijk</label>'
  str += '</div>'
  str += '<div class=\'form-check form-check-inline abc-radio abc-radio-primary\'>'
  str += '<input class=\'form-check-input\' type=\'radio\' value=\'f\' id=\'f\' name=\'sex\''
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
        callback: function() {
          let surname = $('input[name=surname]').val()
          let name = $('input[name=name]').val()
          let sex = $('input[name=sex]:checked').val()
          let qry = knex.from(knex.raw('?? (??, ??, ??, ??)', ['players', 'tournamentId', 'name', 'surname', 'sex']))
            .insert(function() {
              this.from('tournaments')
                .where('active', 1)
                .select('id', knex.raw('?, ?, ?', [name, surname, sex]))
            })
          qry.then(function(id) {
            Lobibox.notify('success', {
              msg: 'Speler toegevoegd.',
              sound: 'sound7'
            });
            selection.setChoices([{ value: id[0], label: surname + ' ' + name, selected: true }], 'value', 'label');
          })
        }
      }
    }
  }
  bootbox.dialog(obj).on('shown.bs.modal', function() {
    $("input[name=surname]").focus()
  });
}
