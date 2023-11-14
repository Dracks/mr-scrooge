import * as fs from 'fs';
import beautify from 'js-beautify';
import * as path from 'path';

import { Migration } from './types';

function padWithLeadingZeros(num: number, totalLength:number):string {
  return String(num).padStart(totalLength, '0');
}

export const writeMigration = (
    revision: number,
    migration: Migration,
    migrationsDir: string,
    name = '',
    comment = '',
) => {
    let _commands = `var migrationCommands = [ \n${  migration.commandsUp.join(', \n')  } \n];\n`;
    const _actions = ` * ${  migration.consoleOut.join('\n * ')}`;

    _commands = beautify(_commands);
    const info = {
        revision,
        name,
        created: new Date(),
        comment,
    };

    const template = `'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
${_actions}
 *
 **/

var info = ${JSON.stringify(info, null, 4)};

${_commands}

module.exports = {
    pos: 0,
    up: function({context: queryInterface}, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
          async function next() {
            if (index < migrationCommands.length) {
                let command = migrationCommands[index];
                console.log("[#" + index + "] execute: " + command.fn);
                index++;
                queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
            }
            else
                resolve();
        }
            next();
        });
    },
    info: info
};
`;

    name = name.replace(' ', '_');
    const filename = path.join(migrationsDir, `${padWithLeadingZeros(revision, 6) + (name != '' ? `-${name}` : '')  }.js`);

    fs.writeFileSync(filename, template);

    return { filename, info };
};
