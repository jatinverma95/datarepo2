module.exports = (function () {
    // variables
    var retVal, sql, fs, path, config;

    // assign variables
    retVal = {};
    sql = require("mssql");
    fs = require("fs");
    path = require("path");
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'datarepodatabase'
    });
    connection.connect(function (err) {
        if (!err) {
            console.log("Database is connected ... ");
        } else {
            console.log("Error connecting database ... ");
        }
    });

    // functions

    function handleDatasheetsTemplate(req, res) {
        res.sendFile(path.resolve('templates//datasheets.handlebars'));
    }


    function handleDatasheetsGet(req, res) {
        fs.readFile('data/datasheets.json', function (err, data) {
            var datasheets = JSON.parse(data);
            res.send(datasheets);
        });
    }

    function handleMessageFromRepository(req, res) {
        var dataset = req.body;
        dataset.url = undefined;

        fs.readFile('data/datasheets.json', function (err, data) {
            var datasets = JSON.parse(data);

            var users = {
                "indicators": dataset.indicatorName,
                "units": dataset.unitName,
                "areas": dataset.areaName,
                "subgroups": dataset.subgroupName,
                "timeperiod": dataset.timeperiod,
                "data": dataset.data
            };
            connection.query('INSERT INTO datasheets SET ?', users, function (error, results, fields) {
                if (error) {
                    console.log("error occurred", error);

                } else {
                    console.log('The solution is: ', results);

                }
            });

            datasets.push(dataset);

            fs.writeFile('data/datasheets.json', JSON.stringify(datasets), function (err, data) {
                res.send('');
            });
        });
    }


    // define Init
    function Init(params) {
        config = params.config;

        global.app.get('/datasheets-template/', handleDatasheetsTemplate);
        global.app.get('/datasheets/', handleDatasheetsGet);
        global.app.post('/send-message/', handleMessageFromRepository);
    }

    // Call Init
    retVal.Init = Init;

    // return module
    return retVal;
})();