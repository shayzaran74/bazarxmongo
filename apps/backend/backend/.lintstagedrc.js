const path = require('path');

module.exports = {
  '*.ts': [
    'eslint --fix',
    'tsc --noEmit',
  ],
};