// see http://stackoverflow.com/questions/8128578/reading-value-from-console-interactively
// see http://nodejs.org/api/readline.html

"use strict";

var v_readline = require('readline');
var v_rl       = v_readline.createInterface
                            ({ input:  process.stdin,
                               output: process.stdout
                            });

console.log('Hallo, Welt!');

v_rl.setPrompt('Name oder "Ende": ');
v_rl.prompt();
v_rl.on('line',
        function(p_input)
        { if (p_input === 'Ende' || p_input === '"Ende"')
          { v_rl.close(); }
          console.log('Hallo, ' + p_input + '!');
          v_rl.prompt();
        }
       )
    .on('close',
        function()
        { console.log('Servus!');
          process.exit();
        }
       );

