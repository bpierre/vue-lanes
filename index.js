var minihash = require('minihash');
var miniroutes = require('miniroutes');

// if $compiler.init is false, the ready hook has been triggered
function ensureReady(vm, cb) {
  if (!vm.$compiler.init) return cb();
  vm.$once('hook:ready', cb);
}

function createLog(debug) {
  if (!debug) return function() {};
  return function() {
    console.log.apply(console, [].slice.call(arguments));
  }
}

function routesEqual(route1, route2) {
  if (!(route1 && route2) ||
      route1.name !== route2.name ||
      route1.params.length !== route2.params.length ||
      route1.value !== route2.value) {
    return false;
  }
  for (var i = route1.params.length - 1; i >= 0; i--) {
    if (route1.params[i] !== route2.params[i]) return false;
  }
  return true;
}

function initRoot(vm, routes, options) {
  var currentRoute = null;
  var hash = null;
  var log = createLog(options.debug);

  // Update the current path on update event
  vm.$on('lanes:route', function(route, except) {
    log('lanes:route received', route)
    currentRoute = route;
    vm.$broadcast('lanes:route', route, except);
  });

  // New path received: update the hash value (triggers a route update)
  vm.$on('lanes:path', function(path) {
    log('lanes:path received', path)
    ensureReady(vm, function() {
      log('change the hash value', path);
      hash.value = path;
    });
  });

  // Routing mechanism
  hash = minihash(options.prefix, miniroutes(routes, function(route) {
    log('hash->route received', route)
    ensureReady(vm, function() {
      if (!currentRoute || !routesEqual(currentRoute, route)) {
        log('emits a lanes:route event', route);
        vm.$emit('lanes:route', route);
      }
    });
  }));

  vm.$on('hook:beforeDestroy', function() {
    hash.stop();
  });
}

function makeRoutes(routes) {
  if (Array.isArray(routes)) return routes;
  if (typeof routes !== 'function') return [];
  var finalRoutes = [];
  routes(function(name, re) {
    finalRoutes.push([name, re]);
  });
  return finalRoutes;
}

module.exports = function(Vue, options) {
  return Vue.extend({
    created: function() {
      if (this.$root === this) {
        initRoot(this, makeRoutes(options.routes), {
          prefix: options.prefix || '',
          debug: options.debug || false
        });
      }
    }
  });
};
