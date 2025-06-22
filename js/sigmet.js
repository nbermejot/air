/**
 * ====================================================================
 * SIGMETS
 * ====================================================================
 */

// Convierte de time epoch a tiempo normal
function epochToJsDate(ts) {
  return new Date(ts * 1000).toLocaleString()
}

// Crea un objeto Sigmet a partir de un json y lo añade al mapa
class Sigmet {
  constructor() {
    this._icaoId
    this._firName
    this._hazard
    this._qualifier
    this._base
    this._tope
    this._dir
    this._spd
    this._chng
    this._rawSigmet
    this._coordinates
    this._validTimeFrom
    this._validTimeTo
    //propiedades no usadas
    //this._firId
    //this._seriesId
    //this._receiptTime
  }

  // Añade los datos del json descargado de NOAA
  addData(datos) {
    this._icaoId = datos.icaoId
    this._firName = datos.icaoId
    this._hazard = datos.hazard
    this._qualifier = datos.qualifier
    this._base = datos.base
    this._tope = datos.top
    this._dir = datos.dir
    this._spd = datos.spd
    this._chng = datos.chng
    this._rawSigmet = datos.rawSigmet
    this._coordinates = datos.coords
    this._validTimeFrom = datos.validTimeFrom
    this._validTimeTo = datos.validTimeTo
  }

  // Función que define el contenido del popup del sigmet en el mapa
  popupSigmet() {
    try {
      const timeFrom = epochToJsDate(this._validTimeFrom)
      const timeTo = epochToJsDate(this._validTimeTo)
      return `<center><h5 style='background-color:powderblue;'>SIGMET</h5></center> 
                    <b>Centro emisor: </b>${this._icaoId}<br>
                    <b>FIR: </b>${this._firName}<br>
                    <b>Fenómeno: </b>${this._hazard} ${this._qualifier}<br>
			        <b>Válido desde: </b>${timeFrom}<br>
			        <b>Válido hasta: </b>${timeTo}<br>
                    <b>Base: </b>${this._base} FT<br>
			        <b>Tope: </b>${this._tope} FT<br>
                    <b>Dir./Vel./Intensidad: </b>${this._dir} / ${this._spd} KT / ${this._chng}<br>
                    <b>----------------------------------------------------</b>
					<br>${this._rawSigmet}`
    } catch {
      console.log('Hay un error en popupSigmet')
    }
  }

  // Función que define el contenido del tooltip del sigmet en el mapa
  tooltipSigmet() {
    let info = ''
    if (typeof this._hazard === 'string' && typeof this._tope === 'number') {
      info += '<center><b>' + this._hazard + '</b></center>'
      info +=
        "<span style='color:red;font-size=10px;'>Top" +
        this._tope / 100 +
        '</span>'
    } else if (
      typeof this._hazard === 'string' &&
      typeof this._tope !== 'number'
    ) {
      info = '<center><b>' + this._hazard + '</b></center>'
    } else {
      info = '<center><b>No data</b></center>'
    }

    return info
  }

  // Función que devuelve el color del sigmet según sea de TS,ICE,TURB...
  getColorSigmet() {
    if (this._hazard === 'TS') {
      return 'orange'
    } else if (this._hazard === 'TURB') {
      return 'red'
    } else if (this._hazard === 'MTW') {
      return 'lime'
    } else if (this._hazard === 'ICE') {
      return 'blue'
    } else if (this._hazard === 'VA') {
      return 'magenta'
    } else {
      return 'yellow'
    }
  }

  // Getters que usaremos
  getCoordinates() {
    return this._coordinates
  }

  getHazard() {
    return this._hazard
  }
}

// BORRA TODOS LOS SIGMETS
function removeSigmet() {
  map.eachLayer(function (layer) {
    if (layer.myTag && layer.myTag === 'sigmet') {
      map.removeLayer(layer)
    }
  })
}

//FUNCION QUE PINTA TODOS LOS SIGMETS DEL ARCHIVO sigmet.json EN EL MAPA
//...es asincrona para que no espere  tener cargado sigmet.json...

async function loadAllSigmet() {
  try {
    let response = await fetch('data/sigmet/sigmet.json')
    let data = await response.json()
    removeSigmet()

    data.forEach(function (point) {
      let sigmet = new Sigmet()
      sigmet.addData(point)
      let coordinates = sigmet.getCoordinates()
      let colorSigmet = sigmet.getColorSigmet()
      let sigmetPolygon = L.polygon(coordinates, {
        weight: 5,
        pane: 'sigmet',
        color: colorSigmet,
        fillColor: colorSigmet,
      })

      sigmetPolygon.addTo(map)
      sigmetPolygon.myTag = 'sigmet'

      //popup
      try {
        sigmetPolygon.bindPopup(sigmet.popupSigmet(), {
          maxWidth: 400,
          className: 'leaflet-popup-content-metar',
          pane: 'sigmet_tooltip',
        })
      } catch {
        console.log('error en bindPopup')
      }

      //tooltip
      try {
        console.log('222:', sigmet.tooltipSigmet())
        sigmetPolygon.bindTooltip(sigmet.tooltipSigmet(), {
          permanent: true,
          direction: 'center',
          offset: [0, 0],
          pane: 'sigmet_tooltip',
          className: 'leaflet-tooltip-sigmet',
        })
      } catch (error) {
        console.log('error en tooltipSigmet', error)
      }
      //mouseout
      //sigmetPolygon.on({mouseover: function (e) {this.setStyle({ fillOpacity: 0.5 });},mouseout: function (e) {this.setStyle({ fillOpacity: 0.2 });}});
    })
  } catch (err) {
    console.log('Hay un error en loadAllSigmet:', err)
  }
}

// CARGA SOLO SIGMETS DE UN TIPO
async function loadSigmet(hazardSigmet, colorSigmet) {
  try {
    let response = await fetch('data/sigmet/sigmet.json')
    let data = await response.json()

    data.forEach(function (point) {
      let sigmet = new Sigmet()
      sigmet.addData(point)
      const coordinates = sigmet.getCoordinates()
      const hazard = sigmet.getHazard()

      if (hazard == hazardSigmet) {
        const sigmetPolygon = L.polygon(coordinates, {
          weight: 5,
          pane: 'sigmet',
          color: colorSigmet,
          fillColor: colorSigmet,
        })

        sigmetPolygon.addTo(map)
        sigmetPolygon.myTag = 'sigmet'

        //tooltip
        try {
          sigmetPolygon.bindTooltip(hazardSigmet, {
            permanent: true,
            direction: 'center',
            offset: [0, 0],
            pane: 'sigmet_tooltip',
            className: 'leaflet-tooltip-sigmet',
          })
        } catch {
          console.log('error en tooltip de loadSigmet 2')
        }

        //popup
        try {
          sigmetPolygon.bindPopup(sigmet.popupSigmet(), {
            maxWidth: 400,
            className: 'leaflet-popup-content-metar',
            pane: 'sigmet_tooltip',
          })
        } catch {
          console.log('error en bindPopup 2')
        }
      }
    })
  } catch (err) {
    console.log('...hay un error en loadSigmet: ', err)
  }
}
