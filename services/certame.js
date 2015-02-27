/*
 * Source code information
 * -----------------------
 * Original author    Alexandre Dias, diascom
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
 * pollapp-webservice (c) 2014 Diascom. All rights reserved.
 */

/**
 * @module dashboard
 * @class busca
 */
var util = require('util'),
    db = require('./db/mysql'),
    utils = require('./utils'),
    numeral = require('numeral'),
    diff = require('node-diff'),
    net = require('net'),
    moment = require('moment'),
    Entities = require('html-entities').XmlEntities;

//Para sempre referenciar um callback
var noop = function () {};

var QUANTIDADE_MENOR_LIMITE = 20, //menor quantidade
    QUANTIDADE_DEFAULT = 10; //quantidade de itens por paginas

//---------------------------------//
// METODOS Privados
//---------------------------------//

/**
 * Return object response format for findQuery method
 * @method getResponseFindQuery
 * @return {Object} Object JSON with Query response format
 */
var getResponseFindCertames = function() {
    return {
        'dados': [ ]
    };
};

/**
 * Return object response format for findQuery method
 * @method getResponseFindQuery
 * @return {Object} Object JSON with Query response format
 */
var getResponseFindResultado = function() {
    return {
        'total': 0,
        'certame': "",
        'candidatos': [ ]
    };
};

/**
 * Metodo para recuperar dados de um termo. Antigo busca_json.php
 * @method findQuery
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findCertames = function(database, params, callback) {
    callback = callback || noop;
    var response = getResponseFindCertames(), //recupera o objeto JSON com a estrutura de resposta
        date = new Date(),
    //cria a QUERY SQL para recuperar informações do banco de compilado_buscas
        selectBuscas = utils.sql({
            'select': ['*'],
            'from': ['certames'],
            'where': ['data >= "{datestart}"'.replace('{datestart}', date.toJSON())],
            'order by': ['created']
        });
    //chamada para o banco
    db.find(database, selectBuscas, function(err, result) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        result.forEach( function(elem) {
            response.dados.push({
                'id_certame': elem.id_certame,
                'certame': elem.certame,
                'valid_date': elem.data
            });
        });

        callback.call(this, err, response); 
    });
};

/**
 * Metodo para recuperar dados de um termo. Antigo busca_json.php
 * @method findQuery
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findCandidatos = function(database, params, callback) {
    callback = callback || noop;
    var response = getResponseFindCertames(), //recupera o objeto JSON com a estrutura de resposta
        date = new Date(),
        id = params.id,
    //cria a QUERY SQL para recuperar informações do banco de compilado_buscas
        selectBuscas = utils.sql({
            'select': ['*'],
            'from': ['candidatos'],
            'where': ['id_certame = {certame}'.replace('{certame}', id)],
            'order by': ['candidato']
        });
    //chamada para o banco
    db.find(database, selectBuscas, function(err, result) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        result.forEach( function(elem) {
            response.dados.push({
                'id_candidato': elem.id_candidatos,
                'candidato': elem.candidato
            });
        });

        callback.call(this, err, response); 
    });
};

/**
 * Metodo para recuperar dados de um termo. Antigo busca_json.php
 * @method findQuery
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findResultado = function(database, params, callback) {
    callback = callback || noop;
    var response = getResponseFindResultado(), //recupera o objeto JSON com a estrutura de resposta
        date = new Date(),
        id = params.id,
    //cria a QUERY SQL para recuperar informações do banco de compilado_buscas
        selectBuscas = utils.sql({
            'select': ['count(*) as total', 'certames.certame as nome'],
            'from': ['votos'],
            'join': ['certames'],
            'where': ['votos.id_certame = {certame}'.replace('{certame}', id)]
        });
    //chamada para o banco
    db.find(database, selectBuscas, function(err, result) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        result.forEach(function(elem) {
            response.total = elem.total;
            response.certame = elem.nome;
        });

        var max = parseFloat(response.total, 10);

        selectBuscas2 = utils.sql({
            'select': ['candidatos.id_candidatos, candidatos.candidato, count(votos.id_candidatos) as votos'],
            'from': ['candidatos'],
            'left join': ['votos'],
            'on': ['votos.id_candidatos = candidatos.id_candidatos'],
            'where': ['candidatos.id_certame = {certame}'.replace('{certame}', id)],
            'group by': ['candidatos.id_candidatos']
        });        

        db.find(database, selectBuscas2, function(err, result2) {
            if (err) {
                callback.call(this, err, response);
                return;
            }

            result2.forEach(function(elem2) {
                var perc = numeral(parseFloat(elem2.votos)/max).format('0.00%');
                response.candidatos.push({
                    'id_candidato': elem2.id_candidatos,
                    'candidato': elem2.candidato,
                    'votos': elem2.votos,
                    'perc': perc
                });
            });        

            callback.call(this, err, response); 
        });
    });
};

/**
 * @method create
 * @desc Inserts an element into the database
 * @param  {Object}   database Object with all properties to connect database
 * @param  {Object}   body the post body document
 * @param  {Function} callback A function that will be call every time
 */
exports.voto = function(database, body, callback) {
    var response = getResponseFindCertames(),
        query = '',
        fields = [],
        values = [];

    delete(body.store);

    query = 'SELECT * FROM votos WHERE id_votante LIKE "{id_votante}" AND id_certame = {id_certame} LIMIT 1';
    query = query.replace('{id_votante}', body.id_votante);
    query = query.replace('{id_certame}', body.id_certame);

    callback = callback || noop;

    db.find(database, query, function (err, rows) {
        if (rows.length === 0) {
            query = 'INSERT INTO votos (%s) VALUES (%s)';

            Object.keys(body).forEach(function (key) {
                var val = body[key];

                if (typeof val == 'string') {
                    values.push("'" + val + "'");
                } else {
                    values.push(val);
                }

                fields.push(key);
            });

            query = util.format(query, fields.join(', '), values.join(', '));

            db.save(database, query, function (err, result) {
                if (err) {
                    callback.call(this, err, response);
                    return;
                }

                response.dados = result.affectedRows;
                callback.call(this, err, response);
                return;
            });
        } else {
            response.code = 201;
            response.message = 'Voto já registrado.';
            callback.call(this, err, response);
        }
    });
};

/**
 * @method create
 * @desc Inserts an element into the database
 * @param  {Object}   database Object with all properties to connect database
 * @param  {Object}   body the post body document
 * @param  {Function} callback A function that will be call every time
 */
exports.createcertame = function(database, body, callback) {
    var response = getResponseFindCertames(),
        query = '',
        fields = [],
        values = [];

    body.data = moment(body.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss');;

    query = 'SELECT * FROM certames WHERE certame LIKE "{certame}" AND data = "{data}" LIMIT 1';
    query = query.replace('{certame}', body.certame);
    query = query.replace('{data}', body.data);

    callback = callback || noop;

    db.find(database, query, function (err, rows) {
        if (rows.length === 0) {
            query = 'INSERT INTO certames (%s) VALUES (%s)';

            Object.keys(body).forEach(function (key) {
                var val = body[key];

                if (typeof val == 'string') {
                    values.push("'" + val + "'");
                } else {
                    values.push(val);
                }

                fields.push(key);
            });

            query = util.format(query, fields.join(', '), values.join(', '));

            db.save(database, query, function (err, result) {
                if (err) {
                    callback.call(this, err, response);
                    return;
                }

                response.dados = result.affectedRows;
                callback.call(this, err, response);
                return;
            });
        } else {
            response.code = 201;
            response.message = 'Certame já registrado.';
            callback.call(this, err, response);
        }
    });
};
