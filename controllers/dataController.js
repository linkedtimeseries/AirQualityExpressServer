exports.dataGet = function (req, res) {
    //Add required modules here
    var request = require('request');
    if (!req.params.id) {
        res.status(500);
        res.send({ "Error": "Looks like you are not senging the product id to get the product details." });
        console.log("Looks like you are not senging the product id to get the product detsails.");
    }
    console.log("https://jsonplaceholder.typicode.com/todos/" + req.params.id);
    request.get({ url: "https://jsonplaceholder.typicode.com/todos/" + req.params.id }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            //console.log(Object.prototype.toString.call(body));
            let d = JSON.parse(body);
            let t = d.title;
            console.log(d);
            console.log('title:' + t);
            res.json(d);
        }
    });
};
//exports.data_get_z_x_y = function (req, res) {
//    res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y);    
//}
exports.data_get_z_x_y_page = function (req, res) {
    res.send('Not Implemented : \nzoom :' + req.params.zoom + '\ntile_x : ' + req.params.tile_x + '\ntile_y : ' + req.params.tile_y + ' page : ' + req.param('page'));
};
exports.dataConvert = function (req, res) {
    let s = req.params.id;
    console.log(s);
    let buff = new Buffer(s);
    let sc = buff.toString('base64');
    console.log(sc);
    res.send(s + ':' + sc);
};
