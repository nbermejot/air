/**
 * ====================================================================
 * AIRMETS
 * ====================================================================
 */

class Airmet {
  constructor() {
    this._icaoId
    this._firNamet
    this._hazard
    this._validTimeFrom
    this._validTimeTo
    this._geom
    this._coords
    this._rawAirmet
  }

  //añadimos datos de airmet.json
  addData(data) {
    this._icaoId = data.icaoId
    this._firName = data.firName
    this._hazard = data.hazard
    this._validTimeFrom = data.validTimeFrom
    this._validTimeTo = data.validTimeTo
    this._geom = data.geom
    this._coords = data.coords
    this._rawAirmet = data.rawAirmet
  }

  //construye el popup del airmet
  popupAirmet() {
    let info =
      "<center><h5 style='background-color:green;'>AIRMET</h5></center>"
    info += '<b>Centro emisor: </b>' + this._icaoId + '<br>'
    info += '<b>FIR: </b>' + this._firName + '<br>'
    info += '<b>Fenómeno: </b>' + this._hazard + '<br>'
    info +=
      '<b>----------------------------------------------------</b><br>' +
      this._rawAirmet
    return info
  }

  //getters
  getHazard() {
    return this._hazard
  }
  getCoords() {
    return this._coords
  }
}

// FUNCIÓN QUE BORRA TODOS LOS AIRMETS
function removeAirmet() {
  map.eachLayer(function (layer) {
    if (layer.myTag && layer.myTag === 'airmet') {
      map.removeLayer(layer)
    }
  })
}

// FUNCIÓN QUE PINTA TODOS LOS AIRMETS
async function loadAirmet() {
  await $.ajax({
    type: 'POST',
    url: 'data/sigmet/airmet.json',
    cache: false,
    crossDomain: true,
    headers: { 'Access-Control-Allow-Origin': '*' }, // <-------- set this
    dataType: 'json',
    success: function (data) {
      removeAirmet()
      data.forEach(function (point) {
        let airmet = new Airmet()
        airmet.addData(point)
        let hazard = airmet.getHazard()
        let coords = airmet.getCoords()

        let airmetPolygon = L.polygon(coords, {
          weight: 5,
          pane: 'sigmet',
          color: 'cyan',
          fillColor: 'green',
          opacity: 1,
        })
        airmetPolygon.bindTooltip(hazard, {
          permanent: true,
          direction: 'center',
          offset: [0, 0],
          pane: 'sigmet_tooltip',
        })
        airmetPolygon.bindPopup(airmet.popupAirmet(), {
          maxWidth: 400,
          className: 'leaflet-popup-content-metar',
          pane: 'sigmet_tooltip',
        })
        airmetPolygon.on({
          mouseover: function (e) {
            this.setStyle({ fillOpacity: 0.6 })
          },
          mouseout: function (e) {
            this.setStyle({ fillOpacity: 0.3 })
          },
        })
        airmetPolygon.myTag = 'airmet'
        airmetPolygon.addTo(map)
      })
    },
  })
}

function loadAirmetText() {
  $.ajax({
    url: 'data/sigmet/airmet.txt',
    cache: false,
    dataType: 'text',
    success: function (data) {
      const textAirep = document.getElementById('text_airep')
      if (data.length === 0) {
        //$("#text_airep").html("<h6>No hay Airmets emitidos hoy</h6>");
        textAirep.innerHTML = '<h6>No hay Aireps emitidos hoy</h6>'
      } else {
        data = data.replaceAll('WASP', '<p><strong>-WASP')
        data = data.replaceAll('=', '=</strong></p>')
        //$("#text_airep").html("<h6>Airmets: </h6><hr style='color:cyan;margin-top:1px;height:1px;background-color:cyan;'>" + data);
        const airmetsToInsert =
          "<h6>Airmets: </h6><hr style='color:cyan;margin-top:1px;height:1px;background-color:cyan;'>" +
          data
        textAirep.innerHTML = airmetsToInsert
      }
    },
  })
}
