var fs = require('fs');

module.exports = {
  template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
  data: {
    path: null,
    paths: [
      'foo',
      'foo/xyz',
      'bar',
      'baz',
      'baz/abc',
      'baz/xyz'
    ]
  },
  created: function() {
    this.$on('lanes:route', function(route) {
      this.path = route.value;
    });
  }
}
