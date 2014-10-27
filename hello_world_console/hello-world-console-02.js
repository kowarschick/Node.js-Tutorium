// see http://stackoverflow.com/questions/8128578/reading-value-from-console-interactively
// see http://nodejs.org/api/readline.html

"use strict";

var l_readline = require('readline');
var l_rl       = l_readline.createInterface
                            ({ input:  process.stdin,
                               output: process.stdout
                            });

console.log('Hallo, Welt!');

l_rl.setPrompt('Name oder "Ende": ');
l_rl.prompt();
l_rl.on('line',
        function(p_input)
        { if (p_input === 'Ende' || p_input === '"Ende"')
          { l_rl.close(); }
          console.log('Hallo, ' + p_input + '!');
          l_rl.prompt();
        }
       )
    .on('close',
        function()
        { console.log('Servus!');
          process.exit();
        }
       );

