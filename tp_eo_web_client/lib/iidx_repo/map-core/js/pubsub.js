/**
 * AMD wrapped version based on:
 *
 * jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)
 *
 * Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
 *
 * Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
 * http://dojofoundation.org/license for more information.
 * @module PubSub
 * @requires jQuery
 */
define(['jquery'],
  function (d) {
    'use strict';

    var cache = {};

    /**
     * Publish an event to all subscribers
     * @memberof module:PubSub
     * @param {string} topic - Event Name
     * @param {Array} [args] - Arguments to pass to listeners
     */
    d.publish = function ( /* String */ topic, /* Array? */ args) {
      try {
        //only publish if something is listening
        if (cache[topic] !== undefined) {
          d.each(cache[topic], function () {
            this.apply(d, args || []);
          });
        }
      } catch (err) {
        // handle this error
        console.log('Error caught in pubsub.js:');
        console.log(err.stack);
      }
    };

    /**
     * Subscribe to particular event topic and provide callback function
     * @memberof module:PubSub
     * @param {string} topic - Event Name
     * @param {Function} callback - Callback function to invoke on event
     */
    d.subscribe = function ( /* String */ topic, /* Function */ callback) {
      if (!cache[topic]) {
        cache[topic] = [];
      }
      cache[topic].push(callback);
      return [topic, callback]; // Array
    };

    /**
     * Unsubscribe to a topic
     * @memberof module:PubSub
     * @param {Array} handle - [topic, callback] handle returned from subscribe action
     */
    d.unsubscribe = function ( /* Array */ handle) {
      var t = handle[0];
      var dummy = cache[t] && d.each(cache[t], function (idx) {
        if (this === handle[1]) {
          cache[t].splice(idx, 1);
        }
      });
    };

    /**
     * Get list of PubSub listeners
     * @memberof module:PubSub
     */
    d.pubsublisteners = function () {
      return cache;
    };

  });
