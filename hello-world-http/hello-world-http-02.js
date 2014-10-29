'use strict';

var v_http        = require('http'),        // Das HTTP-Server-Paket.
    v_querystring = require('querystring'), // Zur Umwandlung von Benutzerdaten in JavaScript-Objekte.
    v_documents;                            // Alle HTML-Templates, die der Server als Antwort schicken kann.

/* Ein HTML-Template ist ein Array, gefüllt mit HTML-Template-Strings.
 * Ein HTML-Template-String ist ein normaler String bestehend aus
 * HTML-Code, der zusätzlich ein oder mehrere Template-Strings
 * der Bauart "{{key}}" enthalten darf. Diese Template-Strings werden
 * von der Methode "m_template_to_html" durch aktuelle Daten
 * ersetzt, bevor der HTML-TExt an den Client (Browser) ausgeliefert
 * wird.
 */
v_documents =
{ '/':
  [ '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>Hallo-Server</title>',
    '  </head>',
    '  <body>',
    '    <p>Hallo, Welt!</p>',
    '    <form action="/hallo" method="post">',
    '      <label>Ihr Name: </label>' + '<input type="text" name="user"/>',
    '      <input type="submit" value="Begrüße mich!">',
    '    </form>',
    '  </body>',
    '</html>'
  ],

  '/hallo':
  [ '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>Hallo-{{user}}-Server</title>',
    '  </head>',
    '  <body>',
    '    <p>Hallo, {{user}}!</p>',
    '  </body>',
    '</html>'
  ],

  'error':
    [ '<!DOCTYPE html>',
      '<html>',
      '  <head>',
      '    <title>Hallo-Server</title>',
      '  </head>',
      '  <body>',
      '    <p><strong>Die angeforderte Seite existiert nicht.</strong></p>',
      '  </body>',
      '</html>'
    ]
};

/**
 * Extrahiert die Benutzerdaten aus <code>p_request</code>
 * und ruft die Callback-Funktion <code>p_callback</code>
 * auf, sobald dies erledigt ist.  Beim Aufruf wird der
 * Funktion <code>p_callback</code> das erzeugte und bereinigte
 * Datenobjekt als einziges Argument übergeben.
 *
 * @private
 * @param {Object}   p_request  Das Request-Objekt der aktuellen HTTP-Anfrage.
 * @param {Function} p_callback Die Callback-Funktion, die aufgerufen wird, sobald
 *                              alle im Request-Objekt enthaltenen Daten empfangen
 *                              und extrahiert wurden.
 */
function m_get_user_data(p_request, p_callback)
{ var l_data_string = '';

  // Nur Post-Requests dürfen Benutzerdaten enthalten.
  if (p_request.method === 'POST')
  { p_request
      /* Immer, wenn ein Teil der Benutzerdaten angekommen ist,
       * wird der Event 'data' ausgelöst. Die neu angekommen Daten
       * werden zum Daten-String l_data_string hinzugefügt.
       * Wenn der Benutzer mehr als 1000000 Zeichen an Daten schickt,
       * wird die Verbindung abgebrochen.
       */
      .on('data',
          function (p_data_string)
          { l_data_string += p_data_string;

            // Zu viele Daten => Verbindungsabbruch!
            if (l_data_string.length > 1000000)
            { p_request.connection.destroy(); }
          }
         )
      /* Wenn alle Daten empfangen wurden, werden diese Daten
       * bereinigt (Kleiner- und Größerzeichen werden ersetzt), um
       * Cross-Site-Scripting zu verhindern.
       * Anschließend werden Sie mittels der Callback-Funktion p_callback
       * an den Aufrufer weitergeleitet.
       */
      .on('end',
          function()
          { var l_data = v_querystring.parse(l_data_string);
            for (var k in l_data)
            { if (l_data.hasOwnProperty(k))
              { l_data[k].replace(/</g, '&lt;');
                l_data[k].replace(/>/g, '&gt;');
              }
            }
            p_callback(l_data);
          }
         );
  }
  // Bei allen übrigen Requests, insbesondere Get-Requests, werden Benutzerdaten ignoriert.
  else
  { p_callback(); }
}

/**
 * Ersetzt der Reihe nach in jedem HTML-String des HTML-Dokuments
 * <code>p_document</code> die Template-Parameter <code>{{KEY}}</code>
 * durch <code>p_data['KEY']</code> und reicht danach den modifizierten
 * HTML-String via <code>p_response</code> an den Clientweiter.
 *
 * @private
 * @param {Array}    p_document Ein Array mit HTML-Template-Strings
 * @param {Object}   p_data     Ein Hasharray (Objekt) mit aktuellen Daten
 * @param {Function} p_response Das Response-Objekt des HTTP-Servers,
 *                              über welches der HTML-Code an den Client
 *                              geschickt wird.
 */
function m_template_to_html(p_document, p_data, p_response)
{ for (var i = 0, n = p_document.length; i < n; i++)
  { var l_line = p_document[i];
    if (p_data)
    { for (var k in p_data)
      { if (p_data.hasOwnProperty(k))
        { l_line = l_line.replace(new RegExp('{{' + k + '}}', 'g'), p_data[k]); }
      }
    }
    p_response.write(l_line+'\n');
  }
}

v_http
  /* Der eigentliche HTTP-Server verarbeitet jede Anfrage au dieselbe Art und Weise:
   * 1. Ein geeigneter HTTP-Header wird an den Client geschickt.
   * 2. Die Benutzerdaten werden mittels m_get_user_data aus dem Request-Objekt p_request extrahiert.
   * 3. Sobald das zugehörige Datenobjekt via Callback-Funktion zur Verfügung steht,
   *    werden im HTML-Template, das der Request-URL zugeordnet ist, die Template-Parameter
   *    durch die aktuellen (bereinigten) Benutzerdaten ersetzt und das so entstandene
   *    HTML-Dokument an den Client geschickt.
   */
  .createServer
    ( function(p_request, p_response)
      { p_response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        m_get_user_data
          (p_request,
           function(p_data)
           { m_template_to_html(v_documents[p_request.url] || v_documents.error, p_data, p_response);
             p_response.end();
           }
          );
      }
     )
  /* Der Server lauscht auf Port 7778 auf Benutzeranfragen. */
  .listen(7778);

console.log("Der Server läuft unter http://localhost:7778/.");