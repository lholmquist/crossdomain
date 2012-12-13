#!/bin/env node
//  OpenShift sample Node application
var express = require( "express" );
var app = express();
var http = require( "http" );

var x = "";

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
                    "access-control-max-age": 20, // Seconds.
                    "content-length": 0
                }
            );
            // End the response - we're not sending back any content.
            return( response.send() );
        }

            var responseBody = "";
            var callback = request.query.callback || request.query.jsonp;

            if( request.params[ 0 ] === "realm/status" ) {
                http.get( "http://us.battle.net/api/wow/realm/status", function( res ) {
                    res.on( "data", function( chunk ) {
                        x += chunk;
                    });

                    res.on( "end", function() {
                        responseBody =  x ;
                        response.status( 200 );
                        response.header(
                                {
                                    "access-control-allow-origin": origin,
                                    "content-type": "application/json"
                                }
                        );
                        if( callback ) {
                            response.send( callback + "(" + responseBody + " ) " );
                        } else {
                            response.send( JSON.parse( responseBody ) );
                        }
                    });
                }).on( "error", function( error ) {
                        console.log( "ERROR" + error.message );
                });
            } else {
                responseBody = "{thing: 'crossDomain'}";

                response.status( 200 );
                response.header(
                        {
                            "access-control-allow-origin": origin,
                            "content-type": "application/json"
                        }
                );

                if( callback ) {
                    response.send( callback + "(" + responseBody + " ) " );
                } else {
                    response.send( responseBody );
                }
        }



});

//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP || "localhost";
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

//  terminator === the termination handler.
function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

//  Process on exit and signals.
process.on('exit', function() { terminator(); });

// Removed 'SIGPIPE' from the list - bugz 852598.
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

//  And start the app on that interface (and port).
app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});

// Debugging:
console.log( "Node.js listening on port 8080" );

