# Información del Visor
## SIGMETS,AIRMETS y AIREPS

- [ ] Los AIRMETs se descargan en formato texto desde la web autobriefing (ftp://abweb.aemet.es). Existen 3 regiones de AIRMETS (Madrid, Barcelona y Canarias), así que se unen los 3 en un mismo archivo airmet.txt
Después se va extrayendo información con un script de python y se convierte a json
```bash
wget  -O /var/www/html/visor/data/airmet/airmet1.txt 'ftp://abweb.aemet.es/aero/AirmetESP/WASP42LEMM'$(date +'%d')'*.txt'
wget  -O /var/www/html/visor/data/airmet/airmet2.txt 'ftp://abweb.aemet.es/aero/AirmetESP/WASP41LEMM'$(date +'%d')'*.txt'
wget  -O /var/www/html/visor/data/airmet/airmet3.txt 'ftp://abweb.aemet.es/aero/AirmetESP/WACR40LEMM'$(date +'%d')'*.txt' 
cat airmet*.txt > airmet.txt
python3 airmet.py
```


- [ ] Los SIGMETs se descargan desde la web de NOAA en formato json (https://aviationweather.gov).
```bash
curl  -o /var/www/html/visor/data/sigmet/sigmet.json  'https://aviationweather.gov/api/data/isigmet?format=json' \   -H 'accept: */*'
```
## METARs, TAFs
Sos descargados en formato texto desde Autobriefing y se convierte a json con un script de python
## Tráfico aéreo
Se descarga desde el servidor opensky-network en formato json. Hay limitación de descargas al dia.
```bash
curl -o /var/www/html/visor/data/trafico/flight.json -k -X GET 'https://nbermejot:Cca20211@opensky-network.org/api/states/all?lamin=34.5&lomin=-13.0&lamax=44.0&lomax=5'
```

