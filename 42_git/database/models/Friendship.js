const fields = [];

class Friendship {

    constructor (node, params){
        let data = node.properties || node;

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        this._id = parseInt(data.uid);
		this.uid = this._id;

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