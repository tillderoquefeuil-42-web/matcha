// const neo4j = require('neo4j-driver').v1;

const fields = [
    'blocked'
];

class Match {

    constructor (node, params){
        let data = node.properties || node;

        params = params || {};

        for (var i in fields){
            this[fields[i]] = data[fields[i]];
        }

        this._id = parseInt(data.uid);

        if (params.rel_user){
            let rel_user = params.rel_user.properties;
            this.u_has_seen = rel_user.see;
            this.u_has_liked = rel_user.like;
            this.u_has_reported = rel_user.report;
        }

        if (params.rel_partner){
            let rel_partner = params.rel_partner.properties;
            this.p_has_seen = rel_partner.see;
            this.p_has_liked = rel_partner.like;
            this.p_has_reported = rel_partner.report;
        }
    }

}

module.exports = Match;