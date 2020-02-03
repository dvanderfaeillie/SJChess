const path = require('path')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(require('electron').remote.getGlobal('sharedLocation').userDataPath,'sjchess.db')
  },
  useNullAsDefault: false,
  debug: false
})

const $ = require('jquery')
const moment = require('moment')
const bootstrap = require('bootstrap')
const bootbox = require('bootbox')

$(document).ready(function() {
  Lobibox.notify.DEFAULTS = $.extend({}, Lobibox.notify.DEFAULTS, {
    iconSource: "fontAwesome",
    delay: 4000,
    soundPath: 'sounds/',
    delayIndicator: false,
    size: 'mini',
    position: 'bottom center',
    rounded: true,
    continueDelayOnInactiveTab: false
  });

  $('#adminx-shared').load('adminx-shared.html', function () {
    $('#menuSpelers').addClass('active')
    $('.sidebar-toggle').click(function(){
      $('.adminx-sidebar')[0].classList.toggle("in")
    })
  })

  getPlayers()

  $('#addPlayer').click(function(){
    addPlayerObj(createBootBoxPlayer)
  })
})
