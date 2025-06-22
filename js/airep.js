/**
 * ====================================================================
 * AIREPS
 * ====================================================================
 */

class Airep {
  constructor() {
    this._lng
    this._lat
    this._tipo
    this._color
    this._cat
    this._hora
    this._nivel
    this._numero
    this._raw
  }

  // Añadimos los datos de airep.geojson
  addData(features) {
    //this._coordinates = features.geometry.coordinates
    this._lng = features.properties.lng
    this._lat = features.properties.lat
    this._tipo = features.properties.tipo
    this._color = features.properties.color
    this._cat = features.properties.cat
    this._hora = features.properties.hora
    this._nivel = features.properties.nivel
    this._numero = features.properties.numero
    this._raw = features.properties.raw
  }

  // Obtiene el tipo de icono del airep
  getIconAirep() {
    if (this._tipo === 'Turbulencia' && this._cat === 'moderada') {
      return turMod
    } else if (this._tipo === 'Turbulencia' && this._cat == 'severa') {
      return turSev
    } else if (this._tipo === 'Engelamiento' && this._cat === 'moderada') {
      return iceMod
    } else if (this._tipo === 'Engelamiento' && this._cat === 'severa') {
      return iceSev
    } else if (this._tipo === 'Onda de montaña' && this._cat === 'moderada') {
      return mtwMod
    } else if (this._tipo === 'Onda de montaña' && this._cat === 'severa') {
      return mtwSev
    } else {
      console.log('hay un error en getIconAirep()')
    }
  }

  // Define el popup que vamos a mostrar en el mapa
  popupAirep() {
    return `<p style='background-color:${this._color};color:white;font-family:courier;font-weight:bold;'>
		       AIREP ${this._tipo} ( ${this._lat}, ${this._lng} )</p>
               <b>INTENSIDAD: </b> ${this._cat} <br>
               <b>HORA OBSERVACIÓN: </b> ${this._hora} <br>
               <b>AIREP: </b> ${this._raw}`
  }

  getLat() {
    return this._lat
  }

  getLng() {
    return this._lng
  }

  getNivel() {
    return this._nivel
  }
}

// Imágenes para los aireps
const turMod = L.icon({
  iconUrl: './images/turbm.bmp',
  iconSize: [22, 22],
})

const turSev = L.icon({
  iconUrl: './images/turbs.bmp',
  iconSize: [28, 28],
})

const iceMod = L.icon({
  iconUrl: './images/icem.bmp',
  iconSize: [22, 22],
})

const iceSev = L.icon({
  iconUrl: './images/ices.bmp',
  iconSize: [28, 28],
})

const mtwMod = L.icon({
  iconUrl: './images/mtwm.bmp',
  iconSize: [22, 22],
})

const mtwSev = L.icon({
  iconUrl: './images/mtws.bmp',
  iconSize: [28, 28],
})

// FUNCION QUE BORRA TODOS LOS AIREPS
function removeAirep() {
  map.eachLayer(function (layer) {
    if (layer.myTag && layer.myTag === 'airep') {
      map.removeLayer(layer)
    }
  })
}

// INICIALIZAMOS EL NUMERO TOTAL DE AIREPS
let numTotalAireps = 0;

// DEFINIMOS UNA VARIABLE PARA QUE CUANDO SE PULSE EL BOTÓN DE AIREP NO MUESTRE UNA ALERTA
// SÓLO QUEREMOS ALERTA CUANDO HAYA UN NUEVO AIREP EMITIDO
let airep_once = false;

// FUNCIÓN QUE PINTA LOS AIREPS EN EL MAPA

async function loadAirep() {
  try {
    let response = await fetch('data/sigmet/airep.geojson')
    let data = await response.json()

    for (let i = 0; i < data.features.length; i++) {
      let airep = new Airep()
      airep.addData(data.features[i])
      let latLng = { lat: airep.getLat(), lng: airep.getLng() }
      let iconAirep = airep.getIconAirep()
      let nivel = airep.getNivel()

      let airepPoint = L.marker(latLng, {
        pane: 'airep',
        icon: iconAirep,
      })

      airepPoint.addTo(map)
      airepPoint.myTag = 'airep'

      airepPoint.bindPopup(airep.popupAirep(), {
        maxWidth: 400,
        className: 'leaflet-popup-airep',
        pane: 'sigmet_tooltip',
      })

      airepPoint.bindTooltip(nivel, {
        permanent: true,
        direction: 'center',
        offset: [0, 25],
        className: 'leaflet-tooltip-airep',
        pane: 'sigmet_tooltip',
      })
    }
  } catch (error) {
    console.error('Error en loadAirep', error)
  }
}

async function checkNewAirep() {
  try {
    let response = await fetch('data/sigmet/airep.geojson')
    let data = await response.json()

    for (let i = 0; i < data.features.length; i++) {
      //la primera vez entrará por aqui porque airep_once es false y no emitirá alerta
      if (airep_once === false) {
        data.features.forEach((f) => {
          let num = f.properties.numero //número de Aireps del geojson
          if (numTotalAireps < num) {
            numTotalAireps = num
          }
        })

        airep_once = true;

        return numTotalAireps;

        // y la segunda vez entrará por aqui
      } else {
        data.features.forEach((f) => {
          let num = f.properties.numero
          if (numTotalAireps < num) {
            numTotalAireps = num;
            alert('Hay un nuevo airep emitido)')
          }
        })

        return numTotalAireps;
      }
    }
  } catch (err) {
    console.error('Error en checkNewAirep', err)
  }
}

// FUNCIÓN QUE CARGA LOS AIREPS EN EL TEXTAREA
function loadAirepText(numTotalAireps) {
  $.ajax({
    url: 'data/sigmet/airep.txt',
    cache: false,
    dataType: 'text',
    success: function (data) {
      const textAirep = document.getElementById('text_airep')

      if (data.length === 0) {
        textAirep.innerHTML = '<h6>No hay Aireps emitidos hoy</h6>'
      } else {
        data = data.replaceAll('UASP', '<p><strong>-UASP')
        data = data.replaceAll('=', '=</strong></p>')
        textAirep.innerHTML = `<h6>Total AIREPs emitidos hoy: ${numTotalAireps}</h6>
			                          <hr style='color:cyan;margin-top:1px;height:1px;background-color:cyan;'></hr>
								      ${data}`
      }
    },
  })
}
