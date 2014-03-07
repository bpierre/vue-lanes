var fs = require('fs');

module.exports = {
  template: fs.readFileSync(__dirname + '/index.html', 'utf8')
}
