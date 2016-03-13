# Soteria

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/cheongwy/soteria.svg?branch=master)](https://travis-ci.org/cheongwy/soteria)


A proxy based approach to test and compare the results of 2 different servers.

Enables quick regression testing by comparing test responses from new system against existing system.

The basic implementation is simply an embedded http proxy using the http-proxy module
and a simple request forwarder. The proxy routes all requests to an origin server while
the forwarder forwards the same request to the candidate server under test. Responses
from both server are then logged to a log file to be analyzed by any other tools. (eg logstash stack)


This is still very experimental. Use at your own risk

### Install

npm install -g soteria

### Usage

Create config folder where you want to run Soteria and place the config file in it.
Name it according to the conventions of the npm config module.

Configure your origin and candidate servers as appropriate.

```json
{
    "app": {
        "name": "soteria",
        "port": "8080"
    },
    "origin": {
        "host": "localhost",
        "port": "7070"
    },
    "candidate": {
        "host": "localhost",
        "port": "7071"  
    }
}
```

start soteria

```bash
soteria
```

#### TODO

Test other http methods

Add request timing info

Replace  mock_server with json-server

Enable configuration of proportion of request to route to candidate

Cleaner way to stop server?

