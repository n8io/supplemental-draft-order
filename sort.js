var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var filename = path.join(__dirname, 'config.sorted.json');
var teams = require('./config.json');

teams = _.sortBy(teams, 'place');

fs.writeFileSync(filename, JSON.stringify(teams, null, 2));
