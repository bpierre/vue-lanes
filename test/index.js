var test = require('tape');
var Vue = require('vue');
var vueLanes = require('../');

function reset(el) {
  el.innerHTML = '';
  window.location.hash = '';
}

function endTest(vm) {
  var el = vm.$el;
  vm.$destroy();
  reset(el);
}

function appendComponents(name) {
  if (Array.isArray(name)) {
    return name.forEach(appendComponents);
  }
  var div = document.createElement('div');
  div.setAttribute('v-component', name);
  container.appendChild(div);
}

function onReady(vm, cb) {
  if (!vm.$compiler.init) {
    setTimeout(function() { cb(vm) }, 0);
  } else {
    vm.$on('hook:ready', function() {
      cb(vm);
    });
  }
}

var container = document.body.appendChild(document.createElement('div'));
reset(container);

test('lanes:route and lanes:path events', function(t) {
  t.plan(3);

  appendComponents(['index', 'foo']);

  var Lanes = vueLanes(Vue, {
    prefix: '!/',
    routes: function(route) {
      route('index', /^$/);
      route('foo', /^foo$/);
    }
  });

  var app = new Lanes({
    el: container,
    components: {
      index: {
        created: function() {
          this.$on('lanes:route', function(route) {
            if (route.name !== 'index') return;
            t.same(route, {
              name: 'index',
              params: [],
              path: ''
            }, 'an empty path should match the index route');
            this.$dispatch('lanes:path', 'foo');
          });
        }
      },
      foo: {
        created: function() {
          var self = this;
          this.$on('lanes:route', function(route) {
            if (route.name !== 'foo') return;
            t.same(route, {
              name: 'foo',
              params: [],
              path: 'foo'
            }, 'a "foo" path should match the foo route');
            onReady(self.$root, function(vm) {
              endTest(vm);
              t.end();
            });
          });
          this.$on('lanes:update:foo', function(route) {
            t.is(route.name, 'foo', 'a route-specific event should be broadcasted');
          });
        }
      }
    }
  });
});

test('lanes:update:<route_name> and lanes:leave:<route_name> events', function(t) {

  var Lanes = vueLanes(Vue, {
    prefix: '!/',
    routes: function(route) {
      route('foo', /^foo(?:\/(.+))?$/);
      route('bar', /^bar$/);
    }
  });

  var app = new Lanes({
    el: container,
    created: function() {
      var self = this;
      var tests = [
        ['foo', 'foo', null],
        ['foo/bar', 'foo', null],
        ['bar', 'bar', 'foo'],
        ['foo/abc', 'foo', 'bar'],
        ['foo/xyz', 'foo', 'bar']
      ];

      t.plan(9);

      var i = 0;
      this.$on('lanes:leave:foo', function(route) {
        t.is(route.name, 'foo', 'The leave:foo event should pass the route which is left');
        t.is(i, 2, 'The leave:foo event should be called once');
      });
      this.$on('lanes:leave:bar', function(route) {
        t.is(route.name, 'bar', 'The leave:bar event should pass the route which is left');
        t.is(i, 3, 'The leave:bar event should be called once');
      });
      this.$on('lanes:update:foo', function(route) {
        t.ok([0,1,3,4].indexOf(i) > -1, 'the update:foo event should be called exactly four times');
      });
      this.$on('lanes:update:bar', function(route) {
        t.is(i, 2, 'the update:bar event should be called once');
      });
      this.$on('lanes:route', function(route) {
        if (!route.name) return;
        if (i >= tests.length-1) {
          endTest(this);
          t.end();
          return;
        }
        this.$emit('lanes:path', tests[++i][0]);
      });
      this.$emit('lanes:path', tests[i][0]);
    }
  });
});

test('Params', function(t) {

  var tests = [

    ['foo', {
      name: 'foo',
      params: [null],
      path: 'foo'
    }, 'the params array should always match the capturing groups'],

    ['foo/1234', {
      name: 'foo',
      params: ['1234'],
      path: 'foo/1234'
    }, 'capturing groups should property fill the params array']
  ];

  appendComponents('foo');

  var Lanes = vueLanes(Vue, {
    prefix: '!/',
    routes: function(route) {
      route('foo', /^foo(?:\/([0-9]+)(?:\/.+)?)?$/)
    }
  });

  var i = 0;
  var app = new Lanes({
    el: container,
    created: function() {
      // Wait for the first route (from the URL hash) before setting the path
      this.$on('lanes:route', function(route) {
        if (!route.name) {
          this.$dispatch('lanes:path', tests[i][0]);
        }
      });
    },
    components: {
      foo: {
        created: function() {
          this.$on('lanes:route', function(route) {
            if (route.name !== 'foo') return;
            t.same(route, tests[i][1], tests[i][2]);
            if (i < tests.length-1) {
              this.$dispatch('lanes:path', tests[++i][0]);
            } else {
              onReady(this.$root, function(vm) {
                endTest(vm);
                t.end();
              });
            }
          });
        }
      }
    }
  });
});

test('Nested components', function(t) {

  var tests = [
    ['index', {
      name: 'index',
      params: [],
      path: ''
    }, 'the first route should broadcast to every child component'],

    ['foo', {
      name: 'foo',
      params: [],
      path: 'foo'
    }, 'the path should dispatch to the $root ViewModel'],
  ];

  appendComponents('foo');

  var Lanes = vueLanes(Vue, {
    prefix: '!/',
    routes: function(route) {
      route('index', /^$/);
      route('foo', /^foo$/);
    }
  });

  var i = 0;

  var app = new Lanes({
    el: container,
    components: {
      foo: Lanes.extend({
        template: '<div v-component="bar"></div>',
        created: function() {
          this.$on('lanes:route', function(route) {
            t.same(route, tests[i][1], tests[i][2]);
          });
        },
        components: {
          bar: Lanes.extend({
            created: function() {
              this.$on('lanes:route', function(route) {
                t.same(route, tests[i][1], tests[i][2]);
                i++;
                if (i >= tests.length) {
                  t.end();
                  endTest(this.$root);
                } else {
                  this.$dispatch('lanes:path', tests[i][0]);
                }
              });
            }
          })
        }
      })
    }
  });
});
