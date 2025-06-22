/**
 * ====================================================================
 * CAPA WMS FIR, COUNTRIES
 * ====================================================================
 */

function getWmsFir() {
  try {
    return L.tileLayer.wms(
      'https://vortice.aemet.es/adaguc-server?DATASET=FIR&SERVICE=WMS&',
      {
        version: '1.1.1',
        layers: 'FIR', //nombre de la capa (ver get capabilities)
        format: 'image/png', //WMS image format (use 'image/png' for layers with transparency)
        transparent: true, //If true, the WMS service will return images with transparency.
        opacity: '1.0',
        attribution: 'AEMET',
        //crs: null (default),Coordinate Reference System to use for the WMS requests, defaults to map CRS.
        pane: 'fir',
      },
    )
  } catch (err) {
    console.log('Hay un error en getWmsFir ', err)
  }
}
function getWmsCountries() {
  try {
    return L.tileLayer.wms(
      'https://vortice.aemet.es/adaguc-server?DATASET=BORDERS&SERVICE=WMS&',
      {
        version: '1.1.1',
        layers: 'COUNTRIES', //nombre de la capa (ver get capabilities)
        format: 'image/png',
        transparent: true,
        opacity: '1.0',
        attribution: 'AEMET',
        pane: 'fir',
      },
    )
  } catch (err) {
    console.log('Hay un error en getWmsCountries', err)
  }
}

let firLayer = getWmsFir()
let countries = getWmsCountries()
