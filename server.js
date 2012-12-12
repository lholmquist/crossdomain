#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var app = express();

app.all( "/*", function(request,response) {

    // When dealing with CORS (Cross-Origin Resource Sharing)
    // requests, the client should pass-through its origin (the
    // requesting domain). We should either echo that or use *
    // if the origin was not passed.
    var origin = (request.headers.origin || "*");

    // Check to see if this is a security check by the browser to
        // test the availability of the API for the client. If the
        // method is OPTIONS, the browser is check to see to see what
        // HTTP methods (and properties) have been granted to the
        // client.
        if (request.method.toUpperCase() === "OPTIONS"){


            // Echo back the Origin (calling domain) so that the
            // client is granted access to make subsequent requests
            // to the API.
            response.status( 204 );
            response.header(
                {
                    "access-control-allow-origin": origin,
                    "access-control-allow-methods": "GET, PUT, DELETE, OPTIONS",
                    "access-control-allow-headers": "content-type, accept",
                    "access-control-max-age": 10, // Seconds.
                    "content-length": 0
                }
            );
        }
        // End the response - we're not sending back any content.
        response.status( 200 );
        response.header(
                    {
                        "access-control-allow-origin": origin,
                        "content-type": "application/json"
                    }
                );
        var callback = request.query.callback || request.query.jsonp;
        if( callback ) {
            response.send( callback + "({response:'stuff'})");
        } else {
            response.send( {response:'stuff'});
        }


});

app.listen( 8080 );

// Debugging:
console.log( "Node.js listening on port 8080" );

