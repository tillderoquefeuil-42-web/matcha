import Geocode from "react-geocode";
import axios from 'axios';

const APIkey = "AIzaSyD6IzbyQKeIcbJTgMffqFOiYqyUY1WWduA";

const headers = {
    'Content-Type'                  : 'application/json',
    'Access-Control-Allow-Origin'   : '*'
}

const components = ['street_number', 'route', 'locality', 'country', 'postal_code'];

Geocode.setApiKey(APIkey);

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

        if (!data.geometry){
            return;
        }

        let coords = data.geometry.location;
        let typeCoords = (typeof coords.lat === 'function')? true : false;

        let location = {
            label   : data.formatted_address,
            lat     : typeCoords? coords.lat() : coords.lat,
            lng     : typeCoords? coords.lng() : coords.lng,
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