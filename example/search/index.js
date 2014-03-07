var fs = require('fs');
var VuePath = require('../vuepath');

// /search/my search
// => my search
function pathToQuery(path) {
  var path = 'search' + (query? '/' + query : '');
  this.updatePath(path);
  return query;
}

function queryToPath(query) {
  query = query.trim().toLowerCase();
  var path = 'search' + (query? '/' + query : '');
  return path;
}

module.exports = VuePath.extend({
  template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
  data: {
    query: null,
    results: []
  },
  created: function() {

    this.$watch('query', function(query) {
      if (query === null) return;
      this.updatePath(queryToPath(query));
    });

    this.$on('path:update', function(path) {
      this.query = pathToQuery(path);
    });
  }
});
