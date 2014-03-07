var Vue = require('vue');
var vueLanes = require('../');

var Lanes = vueLanes(Vue, {
  prefix: '!/',
  routes: function(route) {

    // Match '', 'foo', 'foo/<anything>'
    route('foo', /^(?:foo(?:\/(.+))?)?$/);

    // Match 'bar'
    route('bar', /^bar\/*$/);

    // Match 'baz', 'baz/<anything>'
    route('baz', /^baz(?:\/(.+))?\/*$/);
  }
});

// var lanes = vueLanes(Vue, {
//   prefix: '!/',
//   routes: [
//
//     // Match '', 'foo', 'foo/<anything>'
//     [ 'foo', /^(?:foo(?:\/(.+))?)?$/ ],
//
//     // Match 'bar'
//     [ 'bar', /^bar\/*$/ ],
//
//     // Match 'baz', 'baz/<anything>'
//     [ 'baz', /^baz(?:\/(.+))?\/*$/ ]
//   ]
// });

var app = new Lanes({
  el: 'body',
  data: {
    route: null
  },
  created: function() {
    this.$on('lanes:route', function(route) {
      this.route = route;
      var noslash = route.value.replace(/\/+$/, '');
      if (noslash !== route.value) {
        this.$emit('lanes:path', noslash);
      }
    });
  },
  directives: {
    go: require('./directives/go')
  },
  components: {
    foo: Lanes.extend(require('./components/foo')),
    bar: Lanes.extend(require('./components/bar')),
    baz: Lanes.extend(require('./components/baz')),
    menu: Lanes.extend(require('./components/menu'))
  }
});
