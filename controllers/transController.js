const translate = require('../translations/translate');

module.exports = function (app) {

    app.post('/', function(req, res){
        if (!req.body.language) {
            res.status(400).json({
                text: "INVALID_PARAMETERS"
            });
            return res;
        }

        let translations = translate.getFile(req.body.language);

        res.status(200).json({
            text            : "SUCCESS",
            translations    : translations
        });
        return res;
    });

}