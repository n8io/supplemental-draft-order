var fs = require('fs');
var path = require('path');

var _ = require('lodash');
_.str = require('underscore.string');
var chance = new require('chance')();

var teamsNames = require('./teams.json');

var places = _.range(1, teamsNames.length + 1);
places = _.chain(places).shuffle().value();

var data = _.map(teamsNames, function(n, index) {
  return {
    id: n.id || _.str.camelize(n),
    name: n.name || n,
    place: n.place || places[index],
    keepers: n.keepers || getRandomKeepers()
  };
});

var filename = path.join(__dirname, 'config.' + (new Date()).getTime() + '.json');

fs.writeFile(filename, JSON.stringify(data, null, 2), function(err) {
  if(err) {
    console.log(err);

    return;
  }

  console.log('File written to', filename);
});

function getRandomKeepers() {
  var rand = chance.integer({min: 0, max: 5});
  var names = chance.n(getRandomDude, rand);

  return _.map(names, function(name, index) {
    return {
      name: name,
      positition: index + 1
    };
  });
}

function getRandomDude() {
  return chance.name({gender: 'male'});
}
