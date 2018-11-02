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
    $('#menuPartijen').addClass('active');
    const selection = new Choices('.js-choice-remove', {
      searchEnabled: true,
      itemSelectText: '',
      noChoicesText: 'Geen verdere mogelijkheden',
      removeItemButton: true
    })

    $('#addSpeler').click(function(){
      createBootBoxSpeler(selection)
    })

    getPartijen()
    getPartijen(true)

    $('#nieuweParing').click(function(){
      if(selection.getValue(true).length > 0){
        knex('tornooien').select('id').where('active',1).first().then(function(id){
          Tornooi.create(id.id, knex).then(function(tornooi){
            let spelerArray = SJCEngine.sortSpelers(selection.getValue(true), tornooi)
            SJCEngine.executeParing(spelerArray, tornooi)
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
      let qry = knex.select('spelers.id','spelers.naam','spelers.voornaam')
                    .from('spelers')
                    .join('tornooien', 'spelers.tornooiId', 'tornooien.id')
                    .where('tornooien.active',1)
                    .orderBy('spelers.naam','asc')
      qry.then(function(result){
        for(let i = 0; i < result.length ; i++){
          choicesArray.push({
            value: result[i].id,
            label: result[i].voornaam+' '+result[i].naam,
            selected: $.inArray(result[i].id,selection.getValue(true)) !== -1
          })
        }
        selection.clearStore().setChoices(choicesArray, 'value', 'label', true)
      })
    }
  })
})
