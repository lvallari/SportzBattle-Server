const tables = require('./tables');
const common = require('./common');
const users = require('./users');
var fs = require('fs');
var path = require('path');

function getCSVOfUsersEmails(venue_id) {
    return new Promise(function (resolve, reject) {

        users.getUsersByVenue(venue_id).then(function (data) {
            var players = data;

            //get data keys
            var keys = Object.keys(players[0]);
            var str = '';

            //form headers row
            keys.forEach((p, i) => {
                if (i == 0) str = p;
                else str += (',' + p);
            });


            //collect data
            players.forEach(v => {
                str = str + "\n";
                keys.forEach((k, i) => {
                    if (i == 0) str = str + (v[k] ? v[k] : '');
                    else str = str + ',' + (v[k] ? v[k] : '');
                });
            });

            var fileName = 'SportzBattleUserEmails.csv';
            //var filename = 'file';
            if (process.env.ENVIRONMENT == 'production') var absPath = path.join(path.resolve(), "../") + '\\public\\temp\\' + fileName;
            else var absPath = path.resolve() + '\\public\\temp\\' + fileName;

            var stream = fs.createWriteStream(absPath);

            stream.once('open', function () {
                stream.end(str);

                //delete file after 5 minutes
                setTimeout(function () {
                    fs.unlink(absPath, (err) => {
                        if (err) {
                            //console.log("failed to delete local file:" + err);
                        } else {
                            //console.log('successfully deleted local file');
                        }
                    })
                }, 300000);

                resolve({ path: 'temp/' + fileName });

            });
        }).catch(function (err) {
            console.log('error',err);
            reject({ msg: 'Error getting data' });
        })

    });
}


module.exports = {
    getCSVOfUsersEmails:getCSVOfUsersEmails
}
