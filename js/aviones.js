/** 
 * ====================================================================
 * TRÁFICO AÉREO (de https://opensky-network.org/)
 * ====================================================================
 */

//clase para construir un objeto avión

class Flight {
    constructor() {
        this._icao
        this._country 
        this._lon 
        this._lat 
        this._baro_altitude 
		this._velocity 
        this._angle
		this._vertical_velocity 
		this._geo_altitude 
	}
	
	addData(value) {
	    this._icao = value[0];
        this._country = value[2];
        this._lon = value[5];
		this._lat = value[6];
        this._baro_altitude = Math.round(value[7] * 3.28084);
		this._velocity = parseInt(value[9] * 1.94384); //pasamos a kt
        this._angle = parseInt(value[10]);
        this._vertical_velocity = parseInt(value[11] * 1.94384);	
        this._geo_altitude = Math.round(value[13] * 3.28084);	
	}
	
	tipFlight(time) {
        //vertical_velocity = vertical_velocity.toString().replaceAll("-","↓");
        let info = "<b class='tooltip_aviones'>Hora: </b>" + time + " <br>";
           info += "<b class='tooltip_aviones'>País: </b>" + this._country + " <br>";
		   info += "<b class='tooltip_aviones'>Alt.geo: </b>" + this._geo_altitude + " ft<br>";
           info += "<b class='tooltip_aviones'>Alt.baro: </b>" + this._baro_altitude + " ft<br>";
           info += "<b class='tooltip_aviones'>Velocidad: </b>" + this._velocity + " kt<br>";
           info += "<b class='tooltip_aviones'>Vel.vertical: </b>" + this._vertical_velocity + " kt<br>";
        return info;
	}

    getLat() {
		return this._lat;
	}
	getLon() {
		return this._lon;
	}
	getAngle() {
		return this._angle;
	}	
}



function getFontAwesomeIcon(color,angle) {
    if (color === 'white' ) {
		return L.divIcon({
                  html:'<i class="fas fa-plane" style="transform:rotate(calc(-90deg + ' +
                       angle + 'deg));" aria-hidden="true"></i>',
                  className: "mydivIcon",
        });
	} else if (color === 'black' ) {
		return L.divIcon({
                  html:'<i class="fas fa-plane" style="transform:rotate(calc(-90deg + ' +
                       angle + 'deg));" aria-hidden="true"></i>',
                  className: "mydivIcon2",
        });
	} else if (color === 'orange' ) {
		return L.divIcon({
                  html:'<i class="fas fa-plane" style="transform:rotate(calc(-90deg + ' +
                       angle + 'deg));" aria-hidden="true"></i>',
                  className: "mydivIcon3",
        });
	} else {
		console.log("Hay un error en getFontAwesome()");
	}
}


//FUNCION QUE CARGA LOS AVIONES A PARTIR DEL ARCHIVO flight.json DESCARGADO DE INTERNET

async function loadFlight(color) {
  try {
	  removeFlight();
	  
      let response = await fetch("https://nbermejot.github.io/air/data/trafico/flight.json",{
            method: "POST",
            headers: { "Content-type": "application/json"}
      });
      let data = await response.json();
	  let dateFlight = epochToJsDate(data.time);
	  
	  $.each(data.states, function (i, value) {
			let flight = new Flight();
			flight.addData(value);
			let lat = flight.getLat();
			let lon = flight.getLon();
			const latLng = [lat, lon];
			let angle = flight.getAngle();
		    //Pintamos el avión en el mapa según el color que le pasamos como argumento
            let fontAwesomeIcon = getFontAwesomeIcon(color, angle);
		    let flightPoint = L.marker(latLng, {
                  pane: "flight",
                  icon: fontAwesomeIcon,
            }); 
			
		    flightPoint.addTo(map);
			flightPoint.myTag = "flight";
			
			flightPoint.bindTooltip(flight.tipFlight(dateFlight),{
				pane: "flight_tooltip" });
				
            
      });
  } catch (error) {
      console.error(error);
  }
}



function removeFlight() {
    map.eachLayer(function (layer) {
        if (layer.myTag && layer.myTag === "flight") {
            map.removeLayer(layer);
        }
    });
}

//FUNCION QUE ROTA LOS MARCADORES DE LOS AVIONES
(function () {
  // save these original methods before they are overwritten
  let proto_initIcon = L.Marker.prototype._initIcon;
  let proto_setPos = L.Marker.prototype._setPos;

  let oldIE = L.DomUtil.TRANSFORM === "msTransform";

  L.Marker.addInitHook(function () {
    let iconOptions = this.options.icon && this.options.icon.options;
    let iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
    if (iconAnchor) {
      iconAnchor = iconAnchor[0] + "px " + iconAnchor[1] + "px";
    }
    this.options.rotationOrigin =
      this.options.rotationOrigin || iconAnchor || "center bottom";
    this.options.rotationAngle = this.options.rotationAngle || 0;

    // Ensure marker keeps rotated during dragging
    this.on("drag", function (e) {
      e.target._applyRotation();
    });
  });

  L.Marker.include({
    _initIcon: function () {
      proto_initIcon.call(this);
    },

    _setPos: function (pos) {
      proto_setPos.call(this, pos);
      this._applyRotation();
    },

    _applyRotation: function () {
      if (this.options.rotationAngle) {
        this._icon.style[L.DomUtil.TRANSFORM + "Origin"] =
          this.options.rotationOrigin;

        if (oldIE) {
          // for IE 9, use the 2D rotation
          this._icon.style[L.DomUtil.TRANSFORM] =
            "rotate(" + this.options.rotationAngle + "deg)";
        } else {
          // for modern browsers, prefer the 3D accelerated version
          this._icon.style[L.DomUtil.TRANSFORM] +=
            " rotateZ(" + this.options.rotationAngle + "deg)";
        }
      }
    },

    setRotationAngle: function (angle) {
      this.options.rotationAngle = angle;
      this.update();
      return this;
    },

    setRotationOrigin: function (origin) {
      this.options.rotationOrigin = origin;
      this.update();
      return this;
    },
  });
})();
