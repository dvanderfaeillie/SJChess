const knex = require("knex")({
  client: 'sqlite3',
  connection: {
    filename: './src/database.db'
  },
  useNullAsDefault: false
})
const moment = require('moment')
const $ = require('jquery')
const { remote } = require('electron')
const fs = require('fs')


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

  $('#adminx-shared').load('adminx-shared.html', function () {
    $('#menuRangschikking').addClass('active')
    $('.sidebar-toggle').click(function(){
      $('.adminx-sidebar')[0].classList.toggle("in")
    })
  })

  knex('tournaments').select('id')
    .where('active',1)
    .first()
    .then(function(id){
      knex('players').pluck('id')
        .where('tournamentId',id.id)
        .then(function(players){
          Tournament.create(id.id, knex).then(function(tournament){
            let playerArray = SJCEngine.sortPlayers(players, tournament)
            getRanking(playerArray)
          })
        })
    })

  $('#exportRanking').click(function(){
    knex('tournaments').select('id')
      .where('active',1)
      .first()
      .then(function(id){
        getRankingExport(id.id).then(function(content){
          let path = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {title: 'Save file'})
          if (typeof path !== 'undefined') {
            fs.writeFile(path, content, function(err) {
              if(err) {
                  return console.log(err)
              }
            })
          } // end if
        }) // end then
      })
  })
})