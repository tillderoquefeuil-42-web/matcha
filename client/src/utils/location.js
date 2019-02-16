import Geocode from "react-geocode";
import axios from 'axios';

const APIkey = "AIzaSyD6IzbyQKeIcbJTgMffqFOiYqyUY1WWduA";

const headers = {
    'Content-Type'                  : 'application/json',
    'Access-Control-Allow-Origin'   : '*'
}

const components = ['street_number', 'route', 'locality', 'country', 'postal_code'];

let scriptLoading = {};

Geocode.setApiKey(APIkey);
Geocode.enableDebug();
console.warn('debug activated');

export default {

    getAPIkey   : function(){
        return APIkey;
    },

    getAddressFromGeocode   : function(lat, lng){
        return Geocode.fromLatLng(lat, lng)
        .catch(err => {
            console.log(err);
        });
    },

    parseAddress    : function(data){
        let location = {
            label   : data.formatted_address,
            lat     : data.geometry.location.lat,
            lng     : data.geometry.location.lng,
        };

        location.getGeometry = function(){
            return ({
                lat : this.lat,
                lng : this.lng
            });
        };

        for (let i in data.address_components){
            let info = data.address_components[i];

            for (let j in info.types){
                if (components.indexOf(info.types[j]) !== -1){
                    location[info.types[j]] = info.long_name;
                    break;
                }
            }
        }

        return location;
    },

    geolocate       : function(address, sessionToken){
        let url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${APIkey}`;
        return axios.post(url, {}, {headers: headers});
    },

    loadGoogleMapsAPI   : function(callback){
        let name = 'google_maps';

        if (scriptLoading[name]){
            return;
        } else {
            scriptLoading[name] = true;
        }

        console.log('load GMAP API')
        let s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = `https://maps.google.com/maps/api/js?key=${ this.getAPIkey() }`;

        let x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);

        s.addEventListener('load', e => {
            if (typeof callback === 'function'){
                callback(e);
            }
        });
    },

    loadGooglePlacesAPI : function(callback){
        let name = 'google_places';

        if (scriptLoading[name]){
            return;
        } else {
            scriptLoading[name] = true;
        }

        console.log('load GPLACE API')
        
        let s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = `https://maps.google.com/maps/api/js?key=${ this.getAPIkey() }&libraries=places`;

        let x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);

        s.addEventListener('load', e => {
            if (typeof callback === 'function'){
                callback(e);
            }
        });
    }

}