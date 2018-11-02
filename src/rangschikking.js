const knex = require("knex")({
  client: 'sqlite3',
  connection: {
    filename: './src/database.db'
  },
  useNullAsDefault: false
})
const moment = require('moment')
const { dialog } = require('electron').remote
//dialog.showSaveDialog()

$(document).ready(function() {
  Lobibox.notify.DEFAULTS = $.extend({}, Lobibox.notify.DEFAULTS, {
    iconSource: "fontAwesome",
    delay: 4000,
    soundPath: '../node_modules/lobibox/dist/sounds/',
    delayIndicator: false,
    size: 'mini',
    position: 'bottom center',
    rounded: true,
    continueDelayOnInactiveTab: false
  });

  $('#adminx-shared').load('adminx-shared.html', function(){
    $('#menuRangschikking').addClass('active');

    knex('tornooien').select('id')
      .where('active',1)
      .first()
      .then(function(id){
        knex('spelers').pluck('id')
          .where('tornooiId',id.id)
          .then(function(spelers){
            Tornooi.create(id.id, knex).then(function(tornooi){
              let spelerArray = SJCEngine.sortSpelers(spelers, tornooi)
              getRangschikking(spelerArray)
            })
          })
      })

    $('#exportRangschikking').click(function(){
      Lobibox.notify('success', {
        msg: 'Speler toegevoegd.',
        sound: 'sound7'  });
    })
  })
})
