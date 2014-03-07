var minihash = require('minihash');
var miniroutes = require('miniroutes');

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

function initRoot(vm, routes, prefix) {
  var currentRoute = null;
  var hash = null;

  // Received a new path: update the hash value (triggers a route update)
  vm.$on('lanes:path', function(path) {
    if (hash) return hash.value = path;
    vm.$root.$once('hook:ready', function() {
      hash.value = path;
    });
  });

  // Update the current path on update event
  vm.$on('lanes:route', function(route, except) {
    currentRoute = route;
    vm.$broadcast('lanes:route', route, except);
  });

  // Routing mechanism
  hash = minihash(prefix, miniroutes(routes, function(route) {
    if (currentRoute && routesEqual(currentRoute, route)) return;
    vm.$emit('lanes:route', route);
  }));
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
    ready: function() {
      var self = this;
      if (this.$root === this) {
        initRoot(this, makeRoutes(options.routes), options.prefix || '');
      }
    }
  });
};
