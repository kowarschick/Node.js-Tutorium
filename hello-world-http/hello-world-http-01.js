'use strict';

var v_http = require('http'),
    v_html;

v_html =
['<!DOCTYPE html>',
 '<html>',
 '  <head>',
 '    <title>Hallo-Welt-Server</title>',
 '  </head>',
 '  <body>',
 '    <p>Hallo, Welt!</p>',
 '  </body>',
 '</html>'
];

v_http
  .createServer
    ( function (p_request, p_response)
      { p_response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        for (var i = 0, n = v_html.length; i<n; i++)
        { p_response.write(v_html[i]+'\n'); }
        p_response.end();
      }
    )
  .listen(7777, 'localhost');

console.log("Der Server läuft unter http://localhost:7777/.");