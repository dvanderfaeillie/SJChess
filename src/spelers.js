const knex = require("knex")({
  client: 'sqlite3',
  connection: {
    filename: './src/database.db'
  },
  useNullAsDefault: false
})
const moment = require('moment')
const bootstrap = require('bootstrap')
const bootbox = require('bootbox')



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
    $('#menuSpelers').addClass('active');

    getSpelers()

    $('#addSpeler').click(function(){
      addSpelerObj(createBootBoxSpeler)
    })
  })
})
