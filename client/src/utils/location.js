import Geocode from "react-geocode";

const version = "3.exp";
const APIkey = "AIzaSyD6IzbyQKeIcbJTgMffqFOiYqyUY1WWduA";

Geocode.setApiKey(APIkey);
Geocode.enableDebug();

const components = ['street_number', 'route', 'locality', 'country', 'postal_code'];

export default {

    getParams   : function(){
        return {
            v   : version,
            key : APIkey
        };
    },

    getGeocodeFromAddress   : function(address){
        Geocode.fromAddress("Eiffel Tower")
        .catch(err => {
            console.log(err);
        });
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
    }

}