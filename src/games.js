const path = require('path')
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
const $ = require('jquery')

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
    $('#menuPartijen').addClass('active')
    $('.sidebar-toggle').click(function(){
      $('.adminx-sidebar')[0].classList.toggle("in")
    })
  })

  const element = document.getElementById('selectPlayers')
  const selection = new Choices(element, {
    searchEnabled: true,
    itemSelectText: '',
    noChoicesText: 'Geen verdere mogelijkheden',
    removeItemButton: true
  })

  element.addEventListener('addItem',function(e){
    $('#numberOfPlayers').html('('+element.length+')')
  })
  element.addEventListener('removeItem',function(e){
    $('#numberOfPlayers').html('('+element.length+')')
  })

  $('#addPlayer').click(function(){
    createBootBoxPlayer(selection)
  })

  getGames()
  getGames(true)

  $('#newPairing').click(function(){
    if(selection.getValue(true).length > 0){
      knex('tournaments').select('id').where('active',1).first().then(function(id){
        Tournament.create(id.id, knex).then(function(tournament){
          let playerArray = SJCEngine.sortPlayers(selection.getValue(true), tournament)
          SJCEngine.executePairing(playerArray, tournament)
          Lobibox.notify('success', {
            msg: 'Paring uitgevoerd.',
            sound: 'sound7'  });
        })
      })
    } else {
      Lobibox.notify('error', {
        msg: 'Geen beschikbare spelers geselecteerd.',
        sound: 'sound5'  });
    }
  })

  getSelect()
  function getSelect(){
    var choicesArray = []
    let qry = knex.select('players.id','players.name','players.surname')
                  .from('players')
                  .join('tournaments', 'players.tournamentId', 'tournaments.id')
                  .where('tournaments.active',1)
                  .orderBy('players.name','asc')
    qry.then(function(result){
      for(let i = 0; i < result.length ; i++){
        choicesArray.push({
          value: result[i].id,
          label: result[i].surname+' '+result[i].name,
          selected: $.inArray(result[i].id,selection.getValue(true)) !== -1
        })
      }
      selection.clearStore().setChoices(choicesArray, 'value', 'label', true)
    })
  }
})
