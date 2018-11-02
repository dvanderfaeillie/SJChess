/** Class die een speler voorstelt. */
class Speler {
  constructor(id, voornaam, naam, geslacht){
    this.id = id
    this.naam = naam
    this.voornaam = voornaam
    this.geslacht = geslacht
  }

  static create(id, knex) {
    return knex('spelers').where({id: id})
             .select('voornaam','naam','geslacht')
             .first().then(function(r){
                return new Speler(id, r.voornaam, r.naam, r.geslacht)
              })
  }
}

/** Class die een partij voorstelt. */
class Partij {
  constructor(id, witSpelerId, zwartSpelerId, resultaat, datum){
    this.id = id
    this.witSpelerId = witSpelerId
    this.zwartSpelerId = zwartSpelerId
    this.resultaat = resultaat
    this.datum = datum
    this.bye = typeof zwartSpelerId === 'undefined'
  }

  getScore(spelerId){
    let score = 0
    if(this.witSpelerId === spelerId){
      score += this.resultaat === 2 ? 0.5 : 0
      score += this.resultaat === 1 ? 1 : 0
    } else if (this.zwartSpelerId === spelerId){
      score += this.resultaat === 2 ? 0.5 : 0
      score += this.resultaat === 3 ? 1 : 0
    }
    return score
  }

  static create(id, knex) {
    return knex('partijen').where({id: id})
             .select('witSpelerId','zwartSpelerId','resultaat','datum')
             .first().then(function(r){
                return new Partij(id, r.witSpelerId, r.zwartSpelerId, r.resultaat, r.datum)
              })
  }
} //end class

/** Class die een tornooi voorstelt. */
class Tornooi {
  constructor(id, naam, datum, partijen){
    this.id = id
    this.naam = naam
    this.datum = datum
    this.partijen = partijen
  }

  getScore(spelerId){
    let score = 0
    this.partijen.forEach(function(partij){
      score += partij.getScore(spelerId)
    })
    return score
  }

  getSpelerIds(){
    let spelers = []
    this.partijen.forEach(function(partij){
      if(spelers.indexOf(partij.witSpelerId) === -1){
        spelers.push(partij.witSpelerId)
      }
      if(typeof partij.zwartSpelerId !== 'undefine' && spelers.indexOf(partij.zwartSpelerId) === -1){
        spelers.push(partij.zwartSpelerId)
      }
    })
    return spelers
  }

  getAantalPartijen(spelerId){
    let aantal = 0
    this.partijen.forEach(function(partij){
      aantal += partij.witSpelerId === spelerId || partij.zwartSpelerId === spelerId
    })
    return aantal
  }

  getAantalWitPartijen(spelerId){
    let aantal = 0
    this.partijen.forEach(function(partij){
      aantal += partij.witSpelerId === spelerId
    })
    return aantal
  }

  reedsGespeeld(spelerId1, spelerId2){
    let flag = false
    this.partijen.forEach(function(partij){
      flag += (partij.witSpelerId === spelerId1 && partij.zwartSpelerId === spelerId2) ||
                (partij.witSpelerId === spelerId2 && partij.zwartSpelerId === spelerId1)
    })
    return flag
  }

  static create (id, knex) {
    function getPartijen (id){
      let partijen = []
      return knex('partijen').join('spelers','spelers.id','partijen.witSpelerId')
                     .join('tornooien','spelers.tornooiId','tornooien.id')
                     .where('tornooien.id',id)
                     .select('partijen.id')
                     .then(function(result){
                       result.forEach(function(row){
                         Partij.create(row.id, knex).then(function(r){
                           partijen.push(r)
                         })
                       })
                       return partijen
                     })
    } //end function

    return getPartijen(id).then(function(partijen){
      return knex('tornooien').select('naam','datum')
        .where('id',id)
        .first()
        .then(function(r){
          return new Tornooi(id, r.naam, r.datum, partijen)
        })
    })
  } // end static create
} //end class


class SJCEngine {
  static sortSpelers(beschikbareSpelers, tornooi){
    function compare(a, b) {
      let comparison = 0
      if (a.sortField > b.sortField) {
        comparison = -1
      } else if (a.sortField < b.sortField) {
        comparison = 1
      } else {
        if(a.aantal < b.aantal){
          comparison = -1
        } else if (a.aantal > b.aantal) {
          comparison = 1
        }
      }
      return comparison
    }

    /* Sorting the available players on their score */
    let spelerArray = []
    beschikbareSpelers.forEach(function(spelerId){
      spelerArray.push({
        id: spelerId,
        score: tornooi.getScore(spelerId),
        aantal: tornooi.getAantalPartijen(spelerId),
        aantalWit: tornooi.getAantalWitPartijen(spelerId),
        sortField: tornooi.getAantalPartijen(spelerId) !== 0 ? tornooi.getScore(spelerId)/tornooi.getAantalPartijen(spelerId) : 0
      })
    })
    spelerArray.sort(compare)

    return spelerArray
  }

  static executeParing(spelerArray, tornooi){
    for(let i = 0; i < spelerArray.length; i++){
      let speler1 = spelerArray[i]
      let t = i+1
      let flagMatchGevonden = false
      while(!flagMatchGevonden && t < spelerArray.length){
        let speler2 = spelerArray[t]
        flagMatchGevonden += !tornooi.reedsGespeeld(speler1.id, speler2.id)
        if(flagMatchGevonden){ // Match gevonden
          if(tornooi.getAantalWitPartijen(speler1.id) <= tornooi.getAantalWitPartijen(speler2.id)){
            knex('partijen').insert({
              witSpelerId: speler1.id,
              zwartspelerId: speler2.id,
              datum: moment().format('YYYY-MM-DD')
            }).then()
          } else {
            knex('partijen').insert({
              witSpelerId: speler2.id,
              zwartspelerId: speler1.id,
              datum: moment().format('YYYY-MM-DD')
            }).then()
          }
          spelerArray.splice(t,1)
          spelerArray.splice(0,1)
          i--
        } else {
          t++
        }
      }
    } // endfor
    getPartijen(true)
  }
}
