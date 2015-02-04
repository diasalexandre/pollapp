#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var services = path.join(path.dirname(fs.realpathSync(__filename)), '../services');
require(services + '/main.js');