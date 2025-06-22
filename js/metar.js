/**
 * ====================================================================
 * METAR
 * ====================================================================
 */

class Metar {
  constructor() {
    this._name
    this._ind
    this._omae
    this._colorMetar
    this._colorTaf
    this._rawMetar
    this._visibility
    this._ceiling
    this._hazard
    this._rawTaf
    this._typeMetar //if it is SPECI, NIL or AUTO
    this._lng
    this._lat
    this._isNil // return true if METAR is NIL
  }

  addData(features) {
    this._name = features.properties.name
    this._ind = features.properties.ind
    this._omae = features.properties.omae
    this._colorMetar = features.properties.colorMetar
    this._colorTaf = features.properties.colorTaf
    this._rawMetar = features.properties.rawMetar
    this._visibility = features.properties.visibility
    this._ceiling = features.properties.ceiling
    this._hazard = features.properties.hazard
    this._rawTaf = features.properties.rawTaf
    this._typeMetar = features.properties.typeMetar
    this._lng = features.properties.lng
    this._lat = features.properties.lat
    this._isNil = features.properties.isNil
  }

  //devuelve un marcador cuadrado de speci que parpadea (se hace con CSS y la clase pulse_square)
  getSpeci(latLng, radius) {
    return new L.shapeMarker(latLng, {
      pane: 'metar',
      shape: 'square',
      color: 'black',
      fillOpacity: 1,
      weight: 1,
      opacity: 0.9,
      radius: radius,
      className: 'pulse_square',
      fillColor: this._colorMetar,
    })
  }

  //devuelve el marcador cuadrado del METAR
  getMetar(latLng, radius) {
    return new L.shapeMarker(latLng, {
      pane: 'metar',
      shape: 'square',
      color: 'black',
      fillOpacity: 1,
      weight: 1,
      opacity: 0.8,
      radius: radius,
      fillColor: this._colorMetar,
    })
  }

  //devuelve el marcador triángulo del TAF
  getTaf(latLng, radius) {
    return new L.shapeMarker(latLng, {
      pane: 'metar',
      shape: 'triangulo',
      color: 'black',
      fillOpacity: 1,
      weight: 1,
      opacity: 0.8,
      radius: radius,
      fillColor: this._colorTaf,
    })
  }

  //método que chequea si hay SPECIs y NILs para mostrarlos en un Textarea
  checkMetar() {
    //si es un speci
    if (this._typeMetar === 'speci') {
      return `<div class='circulo' style='background-color:red;'></div>
			        <span style='color:red;font-size:14px;font-weight:600;' > SPECI ${this._ind}</span>
					<span style='color:white;font-size:13px;'> 
				    (Vis:${this._visibility}m, Nub:${this._ceiling} ft, ${this._hazard})</span><br>`

      //si está NIL y no debe estarlo
    } else if (this._typeMetar === 'nil' && this._isNil === 'false') {
      return `<div class='circulo' style='background-color:magenta;'></div>
			        <span style='color:magenta;font-size:12px;' >-METAR NIL  </span>
					<span style='color:white;font-size:13px;'>${this._ind}</span><br>`

      //si no tiene datos de visibilidad o nubosidad
    } else if (this._typeMetar === 'no_data') {
      return `<div class='circulo' style='background-color:orange;'></div>
			        <span style='color:orange;font-size:12px;font-weight:600;' >-METAR AUTO sin datos  </span>
					<span style='color:white;font-size:13px;'>${this._ind}</span><br>`

      //si no tiene datos de visibilidad
    } else if (this._typeMetar === 'no_vis') {
      return `<div class='circulo' style='background-color:orange;'></div>
			        <span style='color:orange;font-size:12px;font-weight:600;' >-METAR AUTO sin datos de VIS  </span>
					<span style='color:white;font-size:13px;'>${this._ind}</span><br>`

      //si no tiene datos de nubosidad
    } else if (this._typeMetar === 'no_nub') {
      return `<span style='color:orange;font-size:12px;font-weight:600;' >-METAR AUTO sin datos de NUB  </span>
			        <span style='color:white;font-size:13px;'>${this._ind}</span><br>`
    }
  }

  //método que construye el popup del metar y taf
  popupMetar() {
    let info
    //METAR. Si el color del METAR es blanco, amarillo, verde o transparente la letra irá en negro excepto si es SPECI
    if (
      this._colorMetar == 'white' ||
      this._colorMetar == 'yellow' ||
      this._colorMetar == 'lime' ||
      this._colorMetar == '#FF000000'
    ) {
      //si es un speci que lo ponga en rojo
      if (this._typeMetar == 'speci') {
        info = `<p style='color:black;border:1px solid gray;background-color:${this._colorMetar};'>
				        <b>METAR - ${this._name}</b></p>
						<p style='color:red;'><b>${this._rawMetar}</b></p>`
        //si es metar que sea normal
      } else {
        info = `<p style='color:black;border:1px solid gray;background-color:${this._colorMetar};'>
				        <b>METAR - ${this._name}</b></p>
				        <p><b>${this._rawMetar}</b></p>`
      }
      // en el resto de colores la letra irá en blanco excepto si es SPECI
    } else {
      if (this._typeMetar == 'speci') {
        info = `<p style='color:white;border:1px solid gray;background-color:${this._colorMetar};'>
				        <b>METAR - ${this._name}</b></p>
						<p style='color:red;'><b>${this._rawMetar}</b></p>`
      } else {
        info = `<p style='color:white;border:1px solid gray;background-color:${this._colorMetar};'>
				        <b>METAR - ${this._name}</b></p>
						<p><b>${this._rawMetar}</b></p>`
      }
    }
    // TAF. Si el color del TAF es blanco, amarillo, verde o transparente la letra irá en negro. En el resto en blanco.
    if (
      this._colorTaf == 'white' ||
      this._colorTaf == 'yellow' ||
      this._colorTaf == 'lime' ||
      this._colorTaf == '#FF000000'
    ) {
      info += `<p style='color:black;border:1px solid gray;background-color:${this._colorTaf};'>
			         <b>TAF</b></p>
					 <p><b>${this._rawTaf}</b></p>`
    } else {
      info += `<p style='color:white;border:1px solid gray;background-color:${this._colorTaf};'>
		            <b>TAF</b></p>
					<p><b>${this._rawTaf}</b></p>`
    }
    return info
  }

  //getters
  getOmae() {
    return this._omae
  }
  getLat() {
    return this._lat
  }
  getLng() {
    return this._lng
  }
  getTypeMetar() {
    return this._typeMetar
  }
}

//Función que borra todos los metars
function deleteMetar() {
  map.eachLayer(function (layer) {
    if (layer.myTag && layer.myTag === 'metar') {
      map.removeLayer(layer)
    }
  })
}
function openModal() {
  const modal = document.getElementById('ventanaModal')
  modal.style.display = 'block'
}
//Función que carga los metars y tafs en el mapa
async function loadMetarTaf(omaeSelected, radius) {
  try {
    deleteMetar()
    let listMetar = []
    let stringListMetar
    //hacemos una promesa
    let response = await fetch('data/metar/aeropuertos.geojson')
    let data = await response.json()
    //Hacemos una lista de los aeropuertos con speci y aeropuertos con NIL y los mostramos en el textarea
    for (let i = 0; i < data.features.length; i++) {
      //creamos un objeto metar
      let metar = new Metar()
      metar.addData(data.features[i])
      let typeMetar = metar.getTypeMetar()
      let omae = metar.getOmae()
      let latLng = { lat: metar.getLat(), lng: metar.getLng() }
      //metarMarker y tafMarker serán los marcadores cuadrado y triángulo a mostrar en el mapa
      let metarMarker
      let tafMarker
      //si se ha seleccionado todos
      if (omaeSelected == 'todos') {
        if (typeMetar == 'speci') {
          metarMarker = metar.getSpeci(latLng, radius)
        } else {
          metarMarker = metar.getMetar(latLng, radius)
        }
        tafMarker = metar.getTaf(latLng, radius)
        //si se ha seleccionado una omae en particular
      } else {
        if (omae == omaeSelected) {
          if (typeMetar == 'speci') {
            metarMarker = metar.getSpeci(latLng, radius)
          } else {
            metarMarker = metar.getMetar(latLng, radius)
          }
          tafMarker = metar.getTaf(latLng, radius)
        }
      }
      //si la variable metarMarker está definida que la muestre en el mapa junto con el taf
      if (typeof metarMarker !== 'undefined') {
        metarMarker.addTo(map)
        metarMarker.myTag = 'metar'
        tafMarker.addTo(map)
        tafMarker.myTag = 'metar'
        metarMarker.bindTooltip(metar.popupMetar(), {
          maxWidth: 400,
          className: 'leaflet-popup-content-metar',
          pane: 'metar_tooltip',
        })
        metarMarker.on('click', function () {
          const modal = document.getElementById('ventanaModal')
          modal.style.display = 'block'
        })

        //...y que muestre la lista de speci y nil en el textarea
        stringListMetar = metar.checkMetar()
        if (typeof stringListMetar !== 'undefined') {
          listMetar.push(stringListMetar)
          const textAirep = document.getElementById('text_airep')
          textAirep.innerHTML = listMetar
        }
      }
    }
  } catch (error) {
    console.error('Error en loadMetarTaf', error)
  }
}

//Añade la leyenda de colores OTAN
function addLegendMetar(metar) {
  return L.control.htmllegend({
    position: 'bottomright',
    legends: [
      {
        name: 'METAR/TAF/AVISOS',
        layer: metar,
        elements: [
          {
            label: 'Vis≥8000m o CEIL≥2500ft',
            html: '',
            style: {
              'background-color': 'dodgerblue',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'VIS≥5000m o CEIL≥1500ft',
            html: '',
            style: {
              'background-color': 'white',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'VIS≥3700m o CEIL≥700ft',
            html: '',
            style: {
              'background-color': 'lime',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'VIS≥1600m o CEIL≥300ft',
            html: '',
            style: {
              'background-color': 'yellow',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'VIS≥800m o CEIL≥200ft',
            html: '',
            style: {
              'background-color': 'orange',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'VIS≤800m o CEIL≤200ft',
            html: '',
            style: {
              'background-color': 'red',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'Cerrado por nubes o VIS',
            html: '',
            style: {
              'background-color': 'black',
              width: '20px',
              height: '20px',
            },
          },
          {
            label: 'Metar Auto',
            html: '',
            style: {
              color: 'magenta',
              weight: '2',
              width: '20px',
              height: '20px',
            },
          },
        ],
      },
    ],
    collapseSimple: true,
    detectStretched: true,
    collapsedOnInit: true,
    defaultOpacity: 1,
    visibleIcon: 'icon icon-eye',
    hiddenIcon: 'icon icon-eye-slash',
  })
}
