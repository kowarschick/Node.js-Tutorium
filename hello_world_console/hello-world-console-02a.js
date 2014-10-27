// see http://nodejs.org/api/stream.html

"use strict";

var l_in  = process.stdin,
    l_out = process.stdout,
    l_prompt = 'Name oder "Ende": ';

// Schreibe Text in die Konsole OHNE Zeilenumbruch.
function write(p_info)
{ l_out.write(p_info); }

// Warte auf Input-Events.
l_in.resume();

console.log('Hallo, Welt!');
write(l_prompt);

// Strg-D wird nicht abgefangen. Das wird in den Uses Cases
// aber auch nicht gefordert.
l_in.on('data',
          function(p_input)
          { p_input = p_input.toString().trim();
            if (p_input === 'Ende' || p_input === '"Ende"')
            { console.log('Servus!');
              process.exit();
            }
            console.log('Hallo, ' + p_input + '!');
            write(l_prompt);
          }
         );
