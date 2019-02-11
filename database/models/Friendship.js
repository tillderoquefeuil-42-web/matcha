const fields = [];

class Friendship {

    constructor (data, params){

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        if (params.partners.length){
            this.partners = params.partners
        }

        if (params.links.length){
            this.locked = false;
            this.accepted = true;

            for (let i in params.links){
                let link = params.links[i];
                this.locked = link.locked? true : this.locked;
                this.accepted = !link.accepted? false : this.accepted;
            }
        }

    }

}

module.exports = Friendship;