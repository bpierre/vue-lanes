# Vue Lanes [![Build Status](https://travis-ci.org/bpierre/vue-lanes.png?branch=master)](https://travis-ci.org/bpierre/vue-lanes)

Event-based routing system for [Vue.js](http://vuejs.org).

<p align="center"><img width="958" height="315" alt="vue-lanes illustration" src="http://scri.ch/luh-2x.png"></p>


## Example

Vue Lanes need to be initialized first. The `Lanes` extended Vue will let you create _Vue Lanes_ components, or can be directly instantiated.

See the [example](example) directory for a more complete example.

```js
var Vue = require('vue');
var vueLanes = require('vue-lanes');

var Lanes = vueLanes(Vue, {

  prefix: '!/', // The path prefix

  routes: function(route) {
    
    // Add routes with the route() function
    route(
      'index', // Route name
      /^$/ // Route regex
    );

    // Use capturing groups to retrieve parameters
    route('search', /^search\/(.+)$/);
  }
});

var app = new Lanes({

  created: function() {

    // The lanes:route event will be emitted each time the route has changed
    this.$on('lanes:route', function(route) {
      // do something
    });

  },
  components: {
    search: Lanes.extend({
      data: { query: '' },
      created: function() {

        // Dispatch the lanes:path event to the root VM to change the path,
        // which will automatically change the current route
        this.$watch('query', function(query) {
          this.$dispatch('lanes:path', 'search/' + query);
        });

        // The lanes:update:search event is broadcasted from the root Lanes Vue.
        // You can safely use it to update your value, even if it’s watched,
        // because Vue Lanes will prevent infinite loops in most cases.
        this.$on('lanes:update:search', function(route) {
          this.query = route.params[0];
        });

        // The lanes:route event is broadcasted each time a new route is set.
        this.$on('lanes:route', function(route) {
          // This function will be called on every route change.
        });
      }
    })
  }
});
```

## Installation

```
$ npm install vue-lanes
```

## Events

Inside a `Lanes` extended Vue, you can _listen_ for the `lanes:route` event, and _dispatch_ a `lanes:path` event to change the path.

If you are interested by a specific route, you can _listen_ for the `lanes:update:<route_name>` and `lanes:leave:{route_name}` events.

### lanes:route

The `lanes:route` event will send a `route` paramater, which is the route object provided by [miniroutes](https://github.com/bpierre/miniroutes).

### lanes:update:{route_name}

Where `{route_name}` is the name of a registered route.

The `lanes:update:{route_name}` acts exactly as the `lanes:route` event, except it is for a specific route. This is useful if you want to do something when a specific route is active.

### lanes:leave:{route_name}

Where `{route_name}` is the name of a registered route.

The `lanes:leave:{route_name}` is triggered everytime another route is set. This event is not triggered if a route is just updated (different path).

### lanes:path

The `lanes:path` event must be dispatched from a Vue Lanes instance in order to update the path. The root _Vue Lanes_ instance will then broadcast a `lanes:route`.

## TODO

- Add an `history.pushState` mode.

## Browser compatibility

IE9+ and modern browsers.

[![Browser support](https://ci.testling.com/bpierre/vue-lanes.png)](https://ci.testling.com/bpierre/vue-lanes)

## License

[MIT](http://pierre.mit-license.org/)

## Special thanks

Illustration made by [Raphaël Bastide](http://raphaelbastide.com/) with [scri.ch](http://scri.ch/).
