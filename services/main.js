/*
 * Source code information
 * -----------------------
 * Original author    Alexandre Dias, Diascom
 * Author email       alexandrermd@gmail.com
 * Company Website    http://www.diasalexandres.com
 * Created            06/03/2014
 * Filename           main.js
 * Revision            1.0
 * Release status     State:
 *
 * Last modified
 * -----------------------
 * Date: 06-03-2014 Author: Alexandre Dias
 * Description: The first version of diascom Copyright
 *
 * pollapp-webservice (c) 2013 Diascom. All rights reserved.
 */

/**
 * @module dashboard
 * @class main
 */
var restify = require('restify'), //modulo Rest API
    certame = require('./certame'), //Modulo para busca
    db = require('./db/mysql'), //modulo para controle do banco de dados
    utils = require('./utils'), //modulo de funcoes gerais
    config = require('./config'), //modulo para uso do cache
    service = config.ServiceConfig;

db.init(); //inicia o banco de dados

/**
 * Retrieve information about the database from a specific store
 * @param  {String} loja
 * @return {Object}      An object with information for connect with MySql Database
 */
var getDatabase = function(loja) {
	if (loja && typeof loja == 'string') {
		return db.getDatabase(loja);
	}
};

/**
 * Return the default object
 * @method Response
 * @return {Object} default
 */
var Response = function() {
	return {'code': 200, 'message': 'Sucesso!'};
};

/**
 * Set the header responde server and send the answer for the client
 * @method sendResponse
 * @param  {Object}   message An object with data and status code about the request
 * @param  {Object}   res     Restify Object
 * @param  {Function} next    Restify Function
 * @return {Object}
 */
var sendResponse = function(message, res, next) {
	// res.contentType = 'json';
	res.header("Content-Type", "application/json; charset=utf-8");
	res.send(200, message);
	return next();
};

var ERROR = {
	interno: 'Ocorreu um erro. Por favor, tente novamente em breve ou entre em contato alexandrermd@gmail.com'
};

//Criar o servidor Restify
var server = restify.createServer({name: service.name});
server.use(restify.fullResponse());
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.pre(restify.pre.userAgentConnection());

/**
 * Function to validate all request that the client sended.
 * @method requestValid
 * @param  {Object} req Restify Object Request
 * @return {Object}     Object with the request response.
 */
var requestValid = function(req) {
	var response = {
		'valid': true,
		obj: {
			'code': 0,
			'message': ''
		},
		loja: '',
		lojaObj: undefined
	};
	if (req.params.store === undefined) {
		response.valid = false;
		response.obj.code = 404;
		response.obj.message = 'Não existe a url que você tentou acessar, verifique se o nome da loja está definido e em seguida tente /webservice/v1/:loja';
		console.error('[Error API]: %s', response.obj.message);
	} else {
		var loja = req.params.store;
		var lojaObj = getDatabase(loja);
		if (lojaObj === undefined) {
			response.obj.code = 404;
			response.obj.message = 'Não existe a loja que você tentou acessar, verifique se o nome da loja e tente /webservice/v1/:loja';
			console.error('[Error API]: %s', response.message);
			response.valid = false;
		} else {
			response.loja = loja;
			response.lojaObj = lojaObj;
		}
	}

	return response;
};

/**
 * Get the available stores.
 * @param  {Object}   req  Restify Request Object
 * @param  {Object}   res  Restify Response Object
 * @param  {Function} next
 */
server.get('/webservice/v1/bancos', function(req, res, next) {
	var response = new Response();
    try  {
        stores = require('./db/databases.json');
    } catch (e) {
        response = [];
    }

    sendResponse(Object.keys(stores), res, next);
});


//Rotas para webservice
//---------------------------------//
// Busca
//---------------------------------//
/**
 * Access busca methods
 * @param  {Object}   req  Restify Request Object
 * @param  {Object}   res  Restify Response Object
 * @param  {Function} next
 */
server.get('/webservice/v1/:store/certames', function(req, res, next) {
	var response = new Response(),
		isFail = false,
		request = requestValid(req);

	if (request.valid) {
		certame.findCertames(request.lojaObj, req.params, function(err,data) {
			if (err) {
				console.error(err);
				response.code = 500;
				response.message = ERROR.interno;
				console.error('[Error API]: %s', response.message);
			} else {
				response = utils.extends(data, response);
			}
			sendResponse(response, res, next);
		});
	} else {
		isFail = true;
		response = request.obj;
	}

	if (isFail) {
		sendResponse(response, res, next);
	}
});

/**
 * Access busca methods
 * @param  {Object}   req  Restify Request Object
 * @param  {Object}   res  Restify Response Object
 * @param  {Function} next
 */
server.get('/webservice/v1/:store/certames/:id', function(req, res, next) {
	var response = new Response(),
		isFail = false,
		request = requestValid(req);

	if (request.valid) {
		certame.findCandidatos(request.lojaObj, req.params, function(err,data) {
			if (err) {
				console.error(err);
				response.code = 500;
				response.message = ERROR.interno;
				console.error('[Error API]: %s', response.message);
			} else {
				response = utils.extends(data, response);
			}
			sendResponse(response, res, next);
		});
	} else {
		isFail = true;
		response = request.obj;
	}

	if (isFail) {
		sendResponse(response, res, next);
	}
});

/**
 * Access busca methods
 * @param  {Object}   req  Restify Request Object
 * @param  {Object}   res  Restify Response Object
 * @param  {Function} next
 */
server.get('/webservice/v1/:store/certames/resultado/:id', function(req, res, next) {
	var response = new Response(),
		isFail = false,
		request = requestValid(req);

	if (request.valid) {
		certame.findResultado(request.lojaObj, req.params, function(err,data) {
			if (err) {
				console.error(err);
				response.code = 500;
				response.message = ERROR.interno;
				console.error('[Error API]: %s', response.message);
			} else {
				response = utils.extends(data, response);
			}
			sendResponse(response, res, next);
		});
	} else {
		isFail = true;
		response = request.obj;
	}

	if (isFail) {
		sendResponse(response, res, next);
	}
});

/**
 * Creating a certame
 * @param  {Object}   req Object with request params
 * @param  {Object}   res Object with response params
 * @param  {Function} next [description]
 */
server.post('/webservice/v1/:store/certames', function (req, res, next) {
    var response = new Response(),
        request = requestValid(req),
        isFail = false;

    if (request.valid) {
        /*var result = certame.validate(req, 'post');

        if (result.valid) {*/
            certame.createcertame(request.lojaObj, req.body, function(err, data) {
                if (err) {
                    console.error(err);
                    response.status = 500;
                    response.message = 'Ocorreu um erro interno. Por favor, tente novamente em breve. Ou comunique alexandrermd@gmail.com';
                    console.error('[Error API]: %s', response.message);
                } else {
                    response = utils.extends(data, response);
                }

                sendResponse(response, res, next);
            });
        /*} else {
            isFail = true;
            response = result;
        }*/
    } else {
        isFail = true;
        response = request.obj;
    }

    if (isFail) {
        sendResponse(response, res, next);
    }
});


/**
 * Voting in candidate
 * @param  {Object}   req Object with request params
 * @param  {Object}   res Object with response params
 * @param  {Function} next [description]
 */
server.post('/webservice/v1/:store/certames/voto', function (req, res, next) {
    var response = new Response(),
        request = requestValid(req),
        isFail = false;

    if (request.valid) {
        /*var result = certame.validate(req, 'post');

        if (result.valid) {*/
            certame.voto(request.lojaObj, req.params, function(err, data) {
                if (err) {
                    console.error(err);
                    response.status = 500;
                    response.message = 'Ocorreu um erro interno. Por favor, tente novamente em breve. Ou comunique alexandrermd@gmail.com';
                    console.error('[Error API]: %s', response.message);
                } else {
                    response = utils.extends(data, response);
                }

                sendResponse(response, res, next);
            });
        /*} else {
            isFail = true;
            response = result;
        }*/
    } else {
        isFail = true;
        response = request.obj;
    }

    if (isFail) {
        sendResponse(response, res, next);
    }
});


//Start Rest Service API
server.listen(service.port, function() {
	console.log('%s listening at %s', service.name, service.url);
});
