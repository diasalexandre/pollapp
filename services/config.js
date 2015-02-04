try{
    var s = require('./confs/service.json');
} catch (e) {
    console.log('Cannot find the file service.json.');
    process.exit(1);
}

s.service.fullpath = s.service.path + s.service.version;
s.service.url = 'http://' + s.service.host + ':' + s.service.port + s.service.fullpath;

exports.ServiceConfig = s.service;
exports.RedisConfig = s.redis;
