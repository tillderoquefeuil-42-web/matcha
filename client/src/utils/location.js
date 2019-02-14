import Geocode from "react-geocode";
import axios from 'axios';

const APIkey = "AIzaSyD6IzbyQKeIcbJTgMffqFOiYqyUY1WWduA";

const headers = {
    'Content-Type'                  : 'application/json',
    'Access-Control-Allow-Origin'   : '*'
}

const components = ['street_number', 'route', 'locality', 'country', 'postal_code'];


Geocode.setApiKey(APIkey);
Geocode.enableDebug();
console.warn('debug activated');

export default {

    getAPIkey   : function(){
        return APIkey;
    },

    // getGeocodeFromAddress   : function(address){
    //     Geocode.fromAddress(address)
    //     .catch(err => {
    //         console.log(err);
    //     });
    // },

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
    }

}