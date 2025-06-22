/**
 * ====================================================================
 * MAPA
 * ====================================================================
 */

// Constants: Basemaps which we use

const mdtRelieve = L.tileLayer(
  'https://servicios.idee.es/wmts/mdt?service=WMTS&request=GetTile&version=1.0.0&Format=image/png&layer=Relieve&style=default&tilematrixset=GoogleMapsCompatible&TileMatrix={z}&TileRow={y}&TileCol={x}',
  {
    attribution:
      '<a href="http://www.ign.es/">Infraestructura de Datos Espaciales de Espa&ntilde;a (IDEE)</a>',
    bounds: [
      [22.173559281306314, -47.0716243806546],
      [66.88067635831743, 40.8749629405498],
    ],
  },
)

const dark = L.tileLayer(
  'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
)

const openTopoMap = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
)

const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')

// Select Basemaps from sidebar (clicking on minimaps images)

function addBasemap(img) {
  // Mejor usar un array de datos que un if/else para cada caso
  const basemaps = [
    { id: 'dark', name: dark },
    { id: 'openTopoMap', name: openTopoMap },
    { id: 'mdtRelieve', name: mdtRelieve },
    { id: 'osm', name: osm },
  ]

  // Devuelve un objeto basemap con el mapa clickado
  const basemap = basemaps.find((basemap) => basemap.id === img.id)

  // Añadimos borde negro a los no clickados y rojo al clickado
  for (let j = 0; j < basemaps.length; j++) {
    if (basemaps[j].id !== basemap.id) {
      map.removeLayer(basemaps[j].name)
      $('#' + basemaps[j].id).css('border', '1px solid black')
    } else {
      basemap.name.addTo(map)
      $('#' + basemap.id).css('border', '4px solid #ffe3a1')
    }
  }
}

// Clase que inicia mapa con un mapa base, herramientas dibujar, panes y define métodos para borrar capas

class Map {
  constructor(basemap) {
    this._basemap = basemap
    this._drawButton = document.getElementById('drawTools') // herramientas para dibujar
    this._darkButton = document.getElementById('dark')
    this._openTopoMapButton = document.getElementById('openTopoMap')
    this._mdtRelieveButton = document.getElementById('mdtRelieve')
  }

  addPane() {
    map.createPane('limit')
    map.getPane('limit').style.zIndex = 740
    map.createPane('fir')
    map.getPane('fir').style.zIndex = 740
    map.createPane('metar')
    map.getPane('metar').style.zIndex = 750
    map.createPane('sigmet')
    map.getPane('sigmet').style.zIndex = 760
    map.createPane('airep')
    map.getPane('airep').style.zIndex = 760
    map.createPane('radioayuda')
    map.getPane('radioayuda').style.zIndex = 760
    map.createPane('metar_tooltip')
    map.getPane('metar_tooltip').style.zIndex = 1200
    map.createPane('sigmet_tooltip')
    map.getPane('sigmet_tooltip').style.zIndex = 820
  }

  initializeMap() {
    this._basemap.addTo(map)
    this.addPane()

    //Añadir un evento click al botón de Herramientas de Dibujo
    this._drawButton.addEventListener('click', (event) => {
      event.preventDefault()
      this.addDrawTools()
    })
  }

  //añade las herramientas de dibujar al mapa
  addDrawTools() {
    const isDrawToolsVisible = map.pm.controlsVisible() //devuelve true si las herramientas están en el mapa

    //borra las herramientas si es true y las añade si es false
    if (isDrawToolsVisible) {
      $('#draw').css('background-color', 'black').css('color', 'gray')
      map.pm.removeControls() //borra las herramientas
    } else {
      $('#draw').css('background-color', 'red').css('color', 'white')

      map.pm.addControls({
        position: 'topleft',
        drawCircleMarker: true,
        rotateMode: true,
      })
    }
  }

  //borra las capas añadidas con datos
  static removeLayer(layerToRemove) {
    map.eachLayer(function (layer) {
      if (layer.myTag && layer.myTag === layerToRemove) {
        map.removeLayer(layer)
      }
    })
  }

  //borra las capas añadidas como wms
  static removeLayerWms(layerList) {
    for (let i = 0; i < layerList.length; i++) {
      if (map.hasLayer(layerList[i])) {
        map.removeLayer(layerList[i])
      }
    }
  }
}

// Clase que añade las provincias y paises

class Regions {
  constructor() {
    // Botones y select
    this._provinciasButton = document.getElementById('provincias')
    this._colorProvinciasSelect = document.getElementById(
      'select_colorProvincia',
    )
    this._countriesButton = document.getElementById('countries')

    // Estado inicial de los botones (on/off)
    this._provinciasIsActive = false
    this._countriesIsActive = false

    // Layer countries
    this._countries = L.tileLayer.wms(
      'https://vortice.aemet.es/adaguc-server?DATASET=BORDERS&SERVICE=WMS&',
      {
        version: '1.1.1',
        layers: 'COUNTRIES',
        format: 'image/png',
        transparent: true,
        opacity: '1.0',
        attribution: 'AEMET',
        pane: 'limit',
      },
    )
  }

  init() {
    this._provinciasButton.addEventListener(
      'click',
      this.loadProvincias.bind(this),
    )
    this._countriesButton.addEventListener(
      'click',
      this.loadCountries.bind(this),
    )
    this._colorProvinciasSelect.addEventListener(
      'change',
      this.selectColorProvincias.bind(this),
    )
  }

  //add countries
  loadCountries(event) {
    if (this._countriesIsActive) {
      this._countriesIsActive = false
      $('#countries').css('background-color', 'black').css('color', 'gray')
      Map.removeLayerWms([this._countries])
    } else {
      this._countries.addTo(map)
      this._countriesIsActive = true
      $('#countries').css('background-color', 'red').css('color', 'white')
    }
  }

  //add Provincias to map
  async getProvincias(colorProvincias) {
    let response = await fetch(
      'http://brisa.aemet.es/webtools/visor/prod/static/prov5.geojson',
    )
    let data = await response.json()
    let provincias = L.geoJSON(data, {
      weight: 1,
      opacity: 0.7,
      color: colorProvincias,
      dashArray: '3',
      fillOpacity: 0,
      pane: 'limit',
    })
    provincias.addTo(map)
    provincias.myTag = 'provincias'
  }

  // Gestiona el botón de cargar las provincias en el mapa
  loadProvincias(event) {
    if (this._provinciasIsActive) {
      $('#provincias').css('background-color', 'black').css('color', 'gray')
      this._provinciasIsActive = false
      Map.removeLayer('provincias')
    } else {
      $('#provincias').css('background-color', 'red').css('color', 'white')
      this._provinciasIsActive = true
      this.getProvincias($('#select_colorProvincia').val())
    }
  }

  // Al cambiar el color en el select de provincias cambia el color en el mapa
  selectColorProvincias(event) {
    if (this._provinciasIsActive) {
      event.preventDefault()
      Map.removeLayer('provincias')
      this.getProvincias($('#select_colorProvincia').val())
    }
  }
}
