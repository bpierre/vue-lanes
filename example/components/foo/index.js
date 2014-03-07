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

    // The current route has been updated
    this.$on('lanes:route', function(route) {
      console.log('foo: route received', route.name);
      if (route.name !== 'foo') return;
      this.keywords = route.params[0] || '';
    });

    var typeTimeout = null;
    this.$watch('keywords', function(keywords) {
      if (typeTimeout) clearTimeout(typeTimeout);

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
