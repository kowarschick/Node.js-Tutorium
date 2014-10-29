// see http://nodejs.org/api/stream.html

"use strict";

var v_in  = process.stdin,
    v_out = process.stdout,
    v_prompt = 'Name oder "Ende": ';

// Schreibe Text in die Konsole OHNE Zeilenumbruch.
function write(p_info)
{ v_out.write(p_info); }

// Warte auf Input-Events.
v_in.resume();

console.log('Hallo, Welt!');
write(v_prompt);

// Strg-D wird nicht abgefangen. Das wird in den Uses Cases
// aber auch nicht gefordert.
v_in.on('data',
          function(p_input)
          { p_input = p_input.toString().trim();
            if (p_input === 'Ende' || p_input === '"Ende"')
            { console.log('Servus!');
              process.exit();
            }
            console.log('Hallo, ' + p_input + '!');
            write(v_prompt);
          }
         );
