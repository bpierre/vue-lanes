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

test('Events', function(t) {
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
              value: ''
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
              value: 'foo'
            }, 'a "foo" path should match the foo route');
            onReady(self.$root, function(vm) {
              endTest(vm);
              t.end();
            });
          });
        }
      }
    }
  });
});

test('Params', function(t) {

  var tests = [

    ['foo', {
      name: 'foo',
      params: [null],
      value: 'foo'
    }, 'the params array should always match the capturing groups'],

    ['foo/1234', {
      name: 'foo',
      params: ['1234'],
      value: 'foo/1234'
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
      value: ''
    }, 'the first route should broadcast to every child component'],

    ['foo', {
      name: 'foo',
      params: [],
      value: 'foo'
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
