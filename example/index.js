var Vue = require('vue');
var vueLanes = require('../');

var Lanes = vueLanes(Vue, {
  debug: true,
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

/*
// Same example with the array syntax:
var Lanes = vueLanes(Vue, {
  prefix: '!/',
  routes: [

    // Match '', 'foo', 'foo/<anything>'
    [ 'foo', /^(?:foo(?:\/(.+))?)?$/ ],

    // Match 'bar'
    [ 'bar', /^bar\/*$/ ],

    // Match 'baz', 'baz/<anything>'
    [ 'baz', /^baz(?:\/(.+))?\/*$/ ]
  ]
});
*/

var app = new Lanes({
  el: 'body',
  data: {
    route: null
  },
  created: function() {
    this.$on('lanes:route', function(route) {
      this.route = {
        name: route.name,
        path: route.path,
        params: route.params
      };
      this.$emit('lanes:path', route.path);
    });
  },
  directives: {
    go: require('./directives/go')
  },
  components: {
    foo: require('./components/foo'),
    bar: require('./components/bar'),
    baz: require('./components/baz'),
    menu: require('./components/menu')
  }
});
