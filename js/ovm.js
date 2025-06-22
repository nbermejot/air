/** 
 * ====================================================================
 * OVM
 * ====================================================================
 */
	
function removeRadioayudas() {
  map.eachLayer(function (layer) {
    if (layer.myTag && layer.myTag === "radioayuda") {
      map.removeLayer(layer);
    }
  });
}

function loadRadioayudas() {
	fetch("data/static/radioayudas.geojson"
	).then(response => {
        return response.json();
    }).then(function (data) {
        let radioayuda = L.geoJSON(data, { 
            pointToLayer: function(feature, latLng) {
		        return new L.circleMarker(latLng, {
				      color: 'orange',
					  fillColor: 'white',
				      fillOpacity: 0,
				      weight: 1,
					  opacity: 1,
				      radius: 5,
					  pane: 'radioayuda',
				 });
		    },
			onEachFeature: function (feature, layer) {
                layer.bindTooltip(feature.properties.ind, {
                       permanent: true,
                       direction: "center",
                       offset: [0, 15],
					   className: "leaflet-popup-radioayudas",
                       pane: "radioayuda",
                 });
            }
        });
	    radioayuda.addTo(map);
        radioayuda.myTag = "radioayuda";
    }).catch(function(err) {
	    console.log("Error: " + err);
	});			 
}

			
class Ovm {
	constructor() {
		// DOM elements
		this._sigmetButton = document.getElementById('sigmet');
		this._airepButton = document.getElementById('airep');
		this._airmetButton = document.getElementById('airmet');
		this._navaidButton = document.getElementById('navaid');
		this._ctrButton = document.getElementById('ctr');
		this._firButton = document.getElementById('fir');
		
		// Initialize status buttons
		this._navaidIsActive = false;
		this._ctrIsActive = false;
		this._airmetIsActive = false;
		this._firIsActive = true;
		this._sigmetIsActive = false;
		this._airepIsActive = false;
		
		// Interval to reload
		this._intervalAirep = 0;
		this._intervalSigmet = 0;
		
		// Layers
		this._fir = L.tileLayer.wms("https://vortice.aemet.es/adaguc-server?DATASET=FIR&SERVICE=WMS&",{
                        version: "1.1.1",
                        layers: "FIR", 
                        format: "image/png",
                        transparent: true,
                        opacity: "1.0",
                        attribution: "AEMET",
		                pane: "fir"});	
	}
	
	
	//initialize OVM con el funcionamiento de todos los botones
	initializeOvm() {
		this._fir.addTo(map);
		$('#fir').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
		
		//Añadir un evento click al botón Sigmet
        this._sigmetButton.addEventListener("click", (event) => {
		    event.preventDefault();
			this.addSigmet();
		});
		
		//Añadir un evento click al botón Airep
        this._airepButton.addEventListener("click", (event) => {
		    event.preventDefault();
			this.addAirep();
		});
		
		//Añadir un evento click al botón Airmet
        this._airmetButton.addEventListener("click", (event) => {
		    event.preventDefault();
			this.addAirmet();
		});
		
		//Añadir un evento click al botón FIR
		this._firButton.addEventListener("click", (event) => {
		    event.preventDefault();
			this.addFir();
		});
		//Añadir un evento click al botón FIR
		this._ctrButton.addEventListener("click", (event) => {
		    event.preventDefault();
			this.addCtr();
		});
	}
	
	
	//add and remove SIGMETS
	addSigmet() {
	    if (this._sigmetIsActive) {
            $('#sigmet').css('background-color','black').css('color','white').css('font-weight','normal');
		    this._sigmetIsActive = false;
		    removeSigmet();
	        clearInterval(this._intervalSigmet);
	    } else {
		    $('#sigmet').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
		    this._sigmetIsActive = true;
		    loadAllSigmet();
	        this._intervalSigmet = setInterval(loadAllSigmet, 3000);
        } 	
	}
	
	
	//add and remove AIREPs
	addAirep() {
		if (this._airepIsActive) {
            $('#airep').css('background-color','black').css('color','#ccc').css('font-weight','normal');
		    this._airepIsActive = false;
		    removeAirep();
		    clearInterval(this._intervalAirep);
		    //$(".cajita").empty();

	    } else {
		    $('#airep').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
		    this._airepIsActive = true;
		    loadAirep();
		    //let mypromise = checkNewAirep();
		    //mypromise.then(function(result) {loadAirepText(result);});
	
		    this._intervalAirep = setInterval(() => {
				removeAirep();
				loadAirep();
				//this.#checkNewAirep();
			}, 6000);
	    }
	}
	
	// #checkNewAirep() {}
	
	
	//add and remove Airmets
	addAirmet() {
	    if (this._airmetIsActive) {
	        $('#airmet').css('background-color','black').css('color','#ccc').css('font-weight','normal');
		    this._airmetIsActive = false;
		    removeAirmet();
		    //$(".cajita").empty();
	    } else {
	        $('#airmet').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
		    this._airmetIsActive = true;
		    loadAirmet();
		    //loadAirmetText();
	    }
	}
	
	
	//add and remove FIR
	addFir() {
	    if (this._firIsActive) {
	        $('#fir').css('background-color','black').css('color','#ccc').css('font-weight','normal');
		    this._firIsActive = false;
		    Map.removeLayerWms([this._fir]);
	    } else {
	        $('#fir').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
		    this._firIsActive = true;
		    this._fir.addTo(map);
	    }
	}
	
	
	//add and remove CTR
	async addCtr() {
        if (this._ctrIsActive) {
            $('#ctr').css('background-color','black').css('color','#ccc').css('font-weight','normal');
		    this._ctrIsActive = false;
		    Map.removeLayer("ctr");
		} else {
		    this._ctrIsActive = true;
			$('#ctr').css('background-color','dodgerblue').css('color','white').css('font-weight','normal');
			let response = await fetch("http://brisa.aemet.es/webtools/visor/prod/static/CTR_.geojson");
            let data = await response.json();
            let ctr = L.geoJSON(data);
            ctr.addTo(map);
            ctr.myTag = "ctr";
        } 
    }	
}