const fields = [];

class Conversation {

    constructor (node, params){
        let data = node.properties || node;

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        this._id = parseInt(data.uid);
		this.uid = this._id;

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