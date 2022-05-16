const { glob } = require('glob');
const { promisify } = require('util');
const ascii = require('ascii-table');
const globPromise = promisify(glob);

module.exports = async (client) => {
  const eventFiles = await globPromise(`${process.cwd()}/src/Events/*.js`);
  eventFiles.map(async (value) => {
    require(value);
  });
};
