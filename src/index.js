const path = require('path')
const knex = require("knex")({
  client: 'sqlite3',
  connection: {
    filename: 'src/database.db'
  },
  useNullAsDefault: false,
  debug: true
})

const moment = require('moment')
const bootstrap = require('bootstrap')
const bootbox = require('bootbox')
const $ = require('jquery')

$(document).ready(function () {
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
    $('#menuIndex').addClass('active')
    $('.sidebar-toggle').click(function(){
      $('.adminx-sidebar')[0].classList.toggle("in")
    })
  })

    const tornooiId = new Choices('.js-choice', {
      searchEnabled: false,
      itemSelectText: ''
    })

    tornooiId.passedElement.addEventListener('change', function(event) {
      knex('tornooien').where('id','=',event.detail.value).update({active: true}).then(function(){
        Lobibox.notify('success', {
          msg: 'Het gebruikte tornooi werd gewijzigd.',
          sound: 'sound7' });
      })
      knex('tornooien').where('id','!=',event.detail.value).update({active: false}).then()
    })

    getSelect()
    function getSelect(){
      var choicesArray = []
      let qry = knex.select('id','active','naam').from('tornooien').orderBy('datum', 'desc')
      qry.then(function(result){
        for(var i = 0; i < result.length ; i++){
          choicesArray.push({
            value: result[i].id,
            label: result[i].naam,
            selected: result[i].active === 1
          })
        }
        tornooiId.setChoices(choicesArray, 'value', 'label', true)
      })
    }

    $('#addTornooi').click(function(){
      let naamEl = $('input[name="naam"]');
      if(naamEl.val() !== ''){
        knex('tornooien').insert({naam: naamEl.val(),
                                  datum: moment().format('YYYY-MM-DD'),
                                  active: 0})
                         .then(function(){
                           getSelect()
                           naamEl.val('')
                           Lobibox.notify('success', {
                             msg: 'Nieuw tornooi toegevoegd.',
                             sound: 'sound7'  })
                         })
      }
    })

    $('#deleteTornooi').click(function(){
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
            let id = $('select').val()
            knex('tornooien').where('id', id).del().then(function(){
              knex('tornooien').orderBy('datum','desc').limit(1).pluck('id').then(function(r){
                id = r[0]
                knex('tornooien').where('id','=',id).update({'active': true}).then(function(){
                  getSelect()
                  Lobibox.notify('error', {
                    msg: 'Tornooi werd verwijderd.',
                    sound: 'sound3'  });
                })
              })
            })
          }
        }
      })
    })
})
