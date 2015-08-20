var fs = require('fs');
var path = require('path');
var _ = require('lodash');
_.str = require('underscore.string');
var sprintf = require('sprintf-js').sprintf;

var cfg = require('./config.json');

var teams = _.clone(cfg, true);

var teamsRounds = 5;
var rounds = [];
var lastRound;
var filename = path.join(__dirname, 'order.json');

// Remove all the teams that already have a full keepers list
teams = _.reject(teams, function(team) {
  return team.keepers.length === teamsRounds;
});

// Determine everyone's first picking round of the draft
teams = _.map(teams, function(team) {
  team.initialRound = team.keepers.length;

  return team;
});

// Calculate the order
_.times(teamsRounds, function(index) {
  rounds.push(calcRoundOrder(index));
});

prettyPrintResults(rounds);

fs.writeFile(filename, JSON.stringify(rounds, null, 2), function(err) {
  if(err) {
    console.log(err);

    return;
  }

  console.log('Order json written to', filename);
});

function calcRoundOrder(index) {
  var round = {
    id: index + 1,
    order: []
  };

  var firstTimers = _
    .chain(teams)
    .filter({initialRound: index})
    .sortBy(function customSortOrder(team) {
      return -1 * team.place;
    })
    .value()
    ;

  var veterans = (lastRound ? lastRound.order : []).reverse();

  round.order.push.apply(round.order, firstTimers);
  round.order.push.apply(round.order, veterans);

  lastRound = _.clone(round, true);

  return round;
}

function prettyPrintResults(rounds) {
  var pickCount = 1;
  var filename = path.join(__dirname, 'order.txt');
  var data = '';

  _.each(rounds, function(r, rIndex) {
    data += (nthStr(_.str.lpad(r.id, 2, ' ')) + ' round\n');

    _.each(r.order, function(team, tIndex) {
      data += sprintf('  %s pick (%s) - %s\n',
       nthStr(_.str.lpad(tIndex + 1, 3, ' ')),
       nthStr(_.str.lpad(pickCount, 3, ' ')),
       team.name
      );

      pickCount++;
    });
  });

  fs.writeFile(filename, data, function(err) {
    if(err) {
      console.log(err);

      return;
    }

    console.log('Order file written to', filename);
  });

  console.log(data);
}

function nthStr(num) {
  var str = num.toString();
  var lstDigit = str[str.length - 1];
  var suffix = 'th';

  switch(lstDigit) {
    case '1':
      suffix = 'st';
      break;
    case '2':
      suffix = 'nd';
      break;
    default:
      break;
  }

  return num + suffix;
}
