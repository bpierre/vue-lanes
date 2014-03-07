# Vue Lanes

Event-based routing system for [Vue.js](http://vuejs.org).

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

        this.$watch('query', function(query) {

          // Dispatch the lanes:path event to change the path, which will
          // automatically change the current route
          this.$dispatch('lanes:path', 'search/' + query);
        });

        // The lanes:route event is broadcasted from the root Lanes Vue.
        // You can use it to update your value, even if it’s watched, because
        // Vue Lanes will prevent infinite loops in most cases.
        this.$on('lanes:route', function(route) {
          if (route.name !== 'search') return;
          this.query = route.params[0];
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

### lanes:route

The `lanes:route` event will send a `route` paramater, which is the route object provided by [miniroutes](https://github.com/bpierre/miniroutes).

### lanes:path

The `lanes:path` event must be dispatched from a Vue Lanes instance in order to update the path. The root _Vue Lanes_ instance will then broadcast a `lanes:route`.

## TODO

- Add an `history.pushState` mode.
- Tests (tape + testling)

## Browser compatibility

IE9+ and modern browsers.

## License

[MIT](http://pierre.mit-license.org/)
