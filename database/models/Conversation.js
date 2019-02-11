const fields = [];

class Conversation {

    constructor (data, params){

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }
        params = params || {};

        this.partners = [];

        if (params.partners){
            this.partners = params.partners;
        }

        if (params.members){
            this.members = params.members;
        }

    }

    getPartnerId(userId) {

        if (this.partners){
            for (let i in this.partners){
                if (this.partners[i] !== userId){
                    return this.partners[i];
                }
            }
        }

        return null;
    }

}

module.exports = Conversation;