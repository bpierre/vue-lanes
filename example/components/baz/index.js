var fs = require('fs');

module.exports = {
  template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
  components: {
    'abc': require('./components/abc'),
    'xyz': require('./components/xyz')
  }
}
