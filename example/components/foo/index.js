var fs = require('fs');

function shuffle(str) {
  return str.split('').sort(function(){
    return 0.5 - Math.random();
  }).join('');
}

module.exports = {
  template: fs.readFileSync(__dirname + '/index.html', 'utf8'),
  created: function() {
    var self = this;
    var active = null;

    // The current route has been updated
    this.$on('lanes:update:foo', function(route) {
      active = true;
      this.keywords = route.params[0] || '';
    });

    // Another route is set
    this.$on('lanes:leave:foo', function() {
      active = false;
    });

    var typeTimeout = null;
    this.$watch('keywords', function(keywords) {
      if (typeTimeout) clearTimeout(typeTimeout);
      if (!active) return;

      // Update the current path (which will update the current route)
      var path = 'foo' + (keywords? '/' + keywords : '');
      this.$dispatch('lanes:path', path);

      this.results = [];

      if (!keywords) {
        this.loading = false;
        return;
      }

      this.loading = true;

      typeTimeout = setTimeout(function() {
        self.results = [];
        self.loading = false;
        var i = 5;
        while (i--) self.results.push(shuffle(keywords));
      }, 500);
    });
  },
  data: {
    loading: false,
    keywords: '',
    results: []
  }
};
