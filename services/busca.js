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
var db = require('./db/mysql'),
    utils = require('./utils'),
    numeral = require('numeral'),
    diff = require('node-diff'),
    net = require('net')
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
var getResponseFindQuery = function() {
    return {
        'busca': [ ],
        'clicks': [ ],
        'mobile': [ ],
        'total': {
            'busca': {
                'total': 0,
                'formatado': 0
            },
            'clicks': {
                'total': 0,
                'formatado': 0
            },
            'por': {
                'total': 0,
                'formatado': 0
            }
        },
        'media': {
            'busca': {
                'total': 0,
                'formatado': 0
            },
            'clicks': {
                'total': 0,
                'formatado': 0
            },
            'por': {
                'total': 0,
                'formatado': 0
            }
        }
    };
};

/**
 * Return object response format for findResultado
 * @method getResponseResultado
 * @return {Object} Object JSON with Query response format
 */
var getResponseResultado = function() {
    return {
        'dados': []
    };
};

/**
 * Return object response format for getProduto method
 * @method getResponseProduto
 * @return {Object} Object JSON with Query response format
 */
var getResponseProduto = function() {
    return {
        'clicks': [],
        'produtos': [],
        'total': {
            'clicks': {
                'total': 0,
                'formatado': 0
            },
            'produtos': {
                'total': 0,
                'formatado': 0
            }
        },
        'media': {
            'clicks': {
                'total': 0,
                'formatado': 0
            },
            'produtos': {
                'total': 0,
                'formatado': 0
            }
        }
    };
};

/**
 * Define o parametro de total e media para a requisicao urlbase/busca
 * @method setTotalMediaFindQuery
 * @param {Object} response    Objeto json com os campos de respostas
 * @param {Integer} totalBusca  Total de cont na busca
 * @param {Integer} totalClicks Total de clicks
 * @param {Integer} quantidade  Quantidade total
 */
var setTotalMediaFindQuery = function(response, totalBusca, totalClicks, quantidade) {
    response.total.busca.total = totalBusca;
    response.total.busca.formatado = numeral(totalBusca).format('0,0').replace(/,/g,'.');
    response.total.clicks.total = totalClicks;
    response.total.clicks.formatado = numeral(totalClicks).format('0,0').replace(/,/g,'.');
    response.total.por.total = (totalClicks/totalBusca);
    response.total.por.formatado = numeral(totalClicks/totalBusca).format('0.00');

    if (quantidade > 0) {
        var mediaBusca = totalBusca/quantidade;
        var mediaClicks = totalClicks/quantidade;

        response.media.busca.total = mediaBusca;
        response.media.busca.formatado = numeral(mediaBusca).format('0,0').replace(/,/g,'.');
        response.media.clicks.total = mediaClicks;
        response.media.clicks.formatado = numeral(mediaClicks).format('0,0').replace(/,/g,'.');
        response.media.por.total = (totalClicks/totalBusca);
        response.media.por.formatado = numeral(totalClicks/totalBusca).format('0.00');
    }

    return response;

};

/**
 * Retorna o vetor com as respostas validas de getBuscas
 * @method setBuscas
 * @param {Array} rows Resultado da consulta ao banco
 * @return {Array} dados
 */
var setBuscas = function(rows, maxvalue, pageInit) {
    var dados = [ ],
        index = 0,
        paginaInicio = parseInt(pageInit, 10),
        perc = '2%';

    if (paginaInicio > 0) {
        index = paginaInicio;
    }    

    rows.forEach(function (elem) {
        perc = '2%';
        index++;

        if (index === 1 && maxvalue === 0) {
            maxvalue = elem.soma;
        }

        var rate = (elem.clicks/parseInt(elem.soma, 10)).toFixed(2);

        if (maxvalue > 0) {
            perc = numeral(elem.soma/maxvalue).format('0%');
        }

        if (elem.redir == 1) {
            rate = '&#10132;';
        }

        if (elem.clicks === null) {
            elem.clicks = 0;
        }

        if (perc == '0%' || perc == '1%' || perc === null || perc === undefined) {
            perc = '2%';
        }

        dados.push({
            'pos': index,
            'idQuery': elem.idquery,
            'query': elem.query,
            'perc': perc,
            'total': numeral(elem.soma).format('0,0').replace(/,/g,'.'),
            'qtd': elem.soma,
            'clicks': elem.clicks,
            'rate': rate
        });
    });

    return dados;
};

/**
 * Retorna o vetor com as respostas validas de getBuscas
 * @method setNotFound
 * @param {Array} rows Resultado da consulta ao banco
 * @return {Array} dados
 */
var setNotFound = function(rows, maxvalue, pageInit) {

    var dados = [ ],
        index = 0,
        paginaInicio = parseInt(pageInit, 10),
        perc = '2%';

    if (paginaInicio > 0) {
        index = paginaInicio;
    }    

    rows.forEach(function (elem) {
        perc = '2%';
        index++;

        if (index === 1 && maxvalue === 0) {
            maxvalue = elem.soma;
        }

        var result = '';

        if (maxvalue > 0) {
            perc = numeral(elem.soma/maxvalue).format('0%');
        }

        if (perc == '0%' || perc == '1%') {
            perc = '2%';
        }

        if (elem.aprox == 1) {
            result = '≃';
        } else {
            result = 'ø';
        }

        dados.push({
            'pos': index,
            'query': elem.query,
            'qtd': elem.soma,
            'qtdFormatado': numeral(elem.soma).format('0,0').replace(/,/g,'.'),
            'perc': perc,
            'resultado': result
        });
    });

    return dados;
};

/**
 * Retorna o vetor com as respostas validas de getClicks
 * @method setClicks
 * @param {Array} rows Resultado da consulta ao banco
 * @return {Array} dados
 */
var setClicks = function(rows, maxvalue, pageInit) {

    var dados = [ ],
        index = 0,
        paginaInicio = parseInt(pageInit, 10),
        produto = '', 
        perc = '2%';        

    if (paginaInicio > 0) {
        index = paginaInicio;
    }    

    rows.forEach(function (elem) {
        perc = '2%';
        index++;

        if (index === 1 && maxvalue === 0) {
            maxvalue = elem.soma;
        }

        if (maxvalue > 0) {
            perc = numeral(elem.soma/maxvalue).format('0%');
        }

        if (perc == '0%' || perc == '1%') {
            perc = '2%';
        }

        if (elem.nome !== null) {
            produto = elem.nome;
        } else {
            produto = elem.idproduto.toString();
        }

        dados.push({
            'pos': index,
            'idQuery': elem.idquery,
            'idProduto': elem.idproduto,
            'clicks': numeral(elem.soma).format('0,0').replace(/,/g,'.'),
            'total': elem.soma,
            'nomeFormatado': produto.substring(0,40),
            'nome': produto,
            'categoria': elem.categoria,
            'img': elem.figura,
            'perc': perc
        });
    });

    return dados;
};

/**
 * Retorna o vetor com as respostas validas de getCorrecoes
 * @method setCorrecoes
 * @param {Array} rows Resultado da consulta ao banco
 * @return {Array} dados
 */
var setCorrecoes = function(rows, maxvalue, pageInit) {

    var dados = [ ],
        index = 0,
        paginaInicio = parseInt(pageInit, 10),
        perc = '2%';   

    if (paginaInicio > 0) {
        index = paginaInicio;
    }                

    rows.forEach(function (elem) {
        perc = '2%';         
        index++;

        if (index === 1 && maxvalue === 0) {
            maxvalue = elem.soma_cont;
        }

        if (maxvalue > 0) {
            perc = numeral(elem.soma_cont/maxvalue).format('0%');
        }

        if (perc == '0%' || perc == '1%') {
            perc = '2%';
        }

        var queryTAG = diff(elem.query_orig, elem.query);

        dados.push({
            'pos': index,
            'idQuery': elem.idquery,
            'idQueryOriginal': elem.idquery_orig,
            'query': queryTAG,
            'queryOriginal': queryTAG,
            'queryOriginalComplete': elem.query_orig,
            'queryComplete': elem.query,
            'qtd': numeral(elem.soma_cont).format('0,0').replace(/,/g,'.'),
            'clicks': numeral(elem.soma_clicks).format('0,0').replace(/,/g,'.'),
            'total': elem.soma_cont,
            'perc': perc
        });

    });

    return dados;
};

//---------------------------------//
// METODOS PUBLICOS
//---------------------------------//

/**
 * Metodo para validar os dados de entrada da busca
 * @method isValidBusca
 * @param  {Object}  params Objeto com os parametros a serem validados
 * @return {Object}        A propriedade valid e booleano
 */
exports.isValidBusca = function(params) {
    var termo = params.q,
        data = params.data,
        ids = params["ids"],
        isValid = true,
        response = {
        'code': 200,
        'message': 'success'
    };

    if (termo === undefined || termo.trim() === '') {
        response.code = 404;
        response.message = 'O parametro [q] precisa ser enviado.';
        isValid = false;
    }

    if (data === undefined || data.trim() === '' || data.split(',').length <= 1) {
        response.code = 404;
        response.message = 'O parametro data precisa ser enviado no formato data=inicio,fim (YYMMDD)';
        isValid = false;
    }

    return {
        'valid': isValid,
        'response': response
    };
};

/**
 * Metodo para validar os dados de entrada da busca
 * @method isValidBusca
 * @param  {Object}  params Objeto com os parametros a serem validados
 * @return {Object}        A propriedade valid e booleano
 */
exports.isValidBuscaTops = function(params) {
    var termo = params.q,
        data = params.data,
        pages = params.pages,
        max = params.max,
        ids = params["ids"],
        isValid = true,
        response = {
        'code': 200,
        'message': 'success'
    };

    if (termo === undefined || termo.trim() === '') {
        response.code = 404;
        response.message = 'O parametro [q] precisa ser enviado.';
        isValid = false;
    }

    if (max === undefined || max.trim() === '') {
        response.code = 404;
        response.message = 'O parametro [max] precisa ser enviado.';
        isValid = false;
    }    

    if (data === undefined || data.trim() === '' || data.split(',').length <= 1) {
        response.code = 404;
        response.message = 'O parametro [data] precisa ser enviado no formato data=inicio,fim (YYMMDD)';
        isValid = false;
    }

    if (pages === undefined || pages.trim() === '' || pages.split(',').length <= 1) {
        response.code = 404;
        response.message = 'O parametro [pages] precisa ser enviado no formato data=inicio,fim (YYMMDD)';
        isValid = false;
    }

    return {
        'valid': isValid,
        'response': response
    };
};

/**
 * Metodo para recuperar dados de um termo. Antigo busca_json.php
 * @method findCertames
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findCertames = function(database, params, callback) {
    callback = callback || noop;
    var response = getResponseFindQuery(), //recupera o objeto JSON com a estrutura de resposta
    //cria a QUERY SQL para recuperar informações do banco de compilado_buscas
        selectBuscas = utils.sql({
            'select': ['*'],
            'from': ['certames'],
            'order by': ['created']
        });
    //chamada para o banco
    db.find(database, selectBuscas, function(err, result) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        result.forEach( function(elem) {
            response.busca.push({
                'certame': elem.certame,
                'valid_date': elem.data
            });
        });

        callback.call(this, err, response); 
    });
};

/**
 * Metodo para recuperar dadosde produtos relacionados a um termo. Antigo busca_json.php
 * @method findQueryProducts
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findQueryProducts = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        response = getResponseFindQuery(), //recupera o objeto JSON com a estrutura de resposta
        pageInit = utils.data.inicio(params.pages),
        pageFim = utils.data.fim(params.pages),
        maxvalue = (typeof params.max == 'string') ? parseInt(params.max, 10) : params.max;

    //Query SQL para recuperar informacoes de clicks na oferta
    var selectClicks = '';
    if (database.label === 'mobly') {
        selectClicks = utils.sql({
            'select': ['compilado_clicks.idproduto', 'compilado_clicks.query', 'compilado_clicks.idquery', 'oferta.nome',
                        'oferta.id', 'oferta.categoria', 'oferta.figura', 'sum(compilado_clicks.cont) as soma'],
            'from': ['compilado_clicks'],
            'left join': ['oferta'],
            'on': ['compilado_clicks.idproduto = oferta.id_original'],
            'where': ['data >= 120724', 'data >= {datainicio}'.replace('{datainicio}',inicio),'data <= {datafim}'.replace('{datafim}', fim),
                        'compilado_clicks.idquery=\'{termo}\''.replace('{termo}', termo)],
            'group by': ['idproduto'],
            'order by': ['soma DESC'],
            'limit': [pageInit, pageFim]
        });
    } else {
        selectClicks = utils.sql({
            'select': ['compilado_clicks.idproduto', 'compilado_clicks.query', 'compilado_clicks.idquery', 'oferta.nome',
                        'oferta.id', 'oferta.categoria', 'oferta.figura', 'sum(compilado_clicks.cont) as soma'],
            'from': ['compilado_clicks'],
            'left join': ['oferta'],
            'on': ['compilado_clicks.idproduto = oferta.id'],
            'where': ['data >= 120724', 'data >= {datainicio}'.replace('{datainicio}',inicio),'data <= {datafim}'.replace('{datafim}', fim),
                        'compilado_clicks.idquery=\'{termo}\''.replace('{termo}', termo)],
            'group by': ['idproduto'],
            'order by': ['soma DESC'],
            'limit': [pageInit, pageFim]
        });
    }
    //chamada para o banco de dados
    db.find(database, selectClicks, function(err, result) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        var index = 0,
            paginaInicio = parseInt(pageInit, 10);

        if (paginaInicio > 0) {
            index = paginaInicio;
        }        

        result.forEach(function (elem) {
            var percent = 0;
            index++;

            if (index === 1 && maxvalue === 0) {
                maxvalue = elem.soma;
            }            

            if (maxvalue !== 0) {
                percent = numeral(elem.soma/maxvalue).format('0%');//((elem.soma * 100) / maxValue);
            }
            var nome = elem.nome;

            if (nome === null) {
                nome = elem.idproduto.toString();
            }

            if (percent == "0%" || percent == "1%") {
                percent = "2%";
            }

            response.clicks.push({
                'pos': index,
                'id': elem.idproduto,
                'nome': nome,
                'nomeLimitado': nome.substring(0,20),
                'query': elem.query,
                'categoria': elem.categoria,
                'img': elem.figura,
                'total': elem.soma,
                'formatado': numeral(elem.soma).format('0,0').replace(/,/g,'.'),
                'perc': percent
            });
        });
        callback.call(this, err, response);     
    });        
};

/**
 * Metodo para recuperar dados de um termo para top buscas.
 * @method findResultadoBusca
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findResultadoBusca = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        pageInit = utils.data.inicio(params.pages),
        pageFim = utils.data.fim(params.pages),
        response = getResponseResultado(), //recupera o objeto JSON com a estrutura de resposta
        maxvalue = (typeof params.max == 'string') ? parseInt(params.max, 10) : params.max;        

    var sqlBusca = utils.sql({
        'select': ['idquery', 'query', 'redir', 'cont','sum(cont) AS soma', 'clicks'],
        'from': ['compilado_buscas'],
        'where': ['query LIKE \'%' + termo + '%\'',
            'data >= {datainicio}'.replace('{datainicio}',inicio),'data <= {datafim}'.replace('{datafim}', fim)],
        'group by': ['idquery, redir'],
        'order by': ['soma DESC'],
        'limit': [pageInit, pageFim]
    });

    db.find(database, sqlBusca, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }
        
        response.dados = setBuscas.call(this, rows, maxvalue, pageInit);
        
        callback.call(this, err, response);
    });  
};

/**
 * Metodo para recuperar dados de um termo para top notfound.
 * @method findResultadoNotFound
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findResultadoNotFound = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        pageInit = utils.data.inicio(params.pages),
        pageFim = utils.data.fim(params.pages),
        response = getResponseResultado(), //recupera o objeto JSON com a estrutura de resposta
        maxvalue = (typeof params.max == 'string') ? parseInt(params.max, 10) : params.max;        

    var sqlNotFound = utils.sql({
        'select': ['query', 'aprox', 'sum(cont) AS soma'],
        'from': ['compilado_buscas_notfound'],
        'where': ['query LIKE \'%' + termo + '%\'',
            'data >= {datainicio}'.replace('{datainicio}',inicio),'data <= {datafim}'.replace('{datafim}', fim)],
        'group by': ['idquery'],
        'order by': ['soma DESC'],
        'limit': [pageInit, pageFim]
    });

    db.find(database, sqlNotFound, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }
        
        response.dados = setNotFound.call(this, rows, maxvalue, pageInit);

        callback.call(this, err, response);
    });
};

/**
 * Metodo para recuperar dados de um termo para top clicks.
 * @method findResultadoClicks
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findResultadoClicks = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        pageInit = utils.data.inicio(params.pages),
        pageFim = utils.data.fim(params.pages),
        response = getResponseResultado(), //recupera o objeto JSON com a estrutura de resposta
        maxvalue = (typeof params.max == 'string') ? parseInt(params.max, 10) : params.max;        

    var sqlClicks = '';

    if (database.label === 'mobly') {
        sqlClicks = utils.sql({
            'select': ['compilado_clicks.idproduto', 'compilado_clicks.query', 'compilado_clicks.idquery', 'oferta.nome', 'oferta.id', 'oferta.categoria', 'oferta.figura', 'sum(compilado_clicks.cont) AS soma'],
            'from': ['compilado_clicks'],
            'left join': ['oferta'],
            'on': ['compilado_clicks.idproduto = oferta.id_original'],
            'where': ['data >= 120724', 'data >= {datainicio}'.replace('{datainicio}',inicio),
                'data <= {datafim}'.replace('{datafim}', fim),
                'compilado_clicks.query LIKE \'%' + termo + '%\''],
            'group by': ['idproduto'],
            'order by': ['soma DESC'],
            'limit': [pageInit, pageFim]
        });

    } else {
        sqlClicks = utils.sql({
            'select': ['compilado_clicks.idproduto', 'compilado_clicks.query', 'compilado_clicks.idquery', 'oferta.nome', 'oferta.id', 'oferta.categoria', 'oferta.figura', 'sum(compilado_clicks.cont) AS soma'],
            'from': ['compilado_clicks'],
            'left join': ['oferta'],
            'on': ['compilado_clicks.idproduto = oferta.id'],
            'where': ['data >= 120724', 'data >= {datainicio}'.replace('{datainicio}',inicio),
                'data <= {datafim}'.replace('{datafim}', fim),
                'compilado_clicks.query LIKE \'%' + termo + '%\''],
            'group by': ['idproduto'],
            'order by': ['soma DESC'],
            'limit': [pageInit, pageFim]
        });
    }

    db.find(database, sqlClicks, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }
        
        response.dados = setClicks.call(this, rows, maxvalue, pageInit);
        callback.call(this, err, response);
    });
};  

/**
 * Metodo para recuperar dados de um termo para top correcoes.
 * @method findResultadoCorrecoes
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.findResultadoCorrecoes = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        pageInit = utils.data.inicio(params.pages),
        pageFim = utils.data.fim(params.pages),
        response = getResponseResultado(), //recupera o objeto JSON com a estrutura de resposta
        maxvalue = (typeof params.max == 'string') ? parseInt(params.max, 10) : params.max;

    var sqlCorrecoes = utils.sql({
        'select': ['idquery_orig', 'query_orig', 'idquery', 'query', 'sum(cont) soma_cont', 'sum(clicks) soma_clicks'],
        'from': ['compilado_correcoes'],
        'where': ['query LIKE \'%' + termo + '%\'',
            'data >= {datainicio}'.replace('{datainicio}',inicio),'data <= {datafim}'.replace('{datafim}', fim)],
        'group by': ['idquery, idquery_orig'],
        'order by': [' soma_cont DESC, soma_clicks DESC'],
        'limit': [pageInit, pageFim]
    });

    db.find(database, sqlCorrecoes, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }
        
        response.dados = setCorrecoes.call(this, rows, maxvalue, pageInit);
        callback.call(this, err, response);
    });
};

/**
 * Metodo para recuperar dados de um produto.
 * @method getProduto
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.getProduto = function(database, params, callback) {
    callback = callback || noop;
    var termo = params.q, //parametro idquery
        inicio = utils.data.inicio(params.data), //data inicio
        fim = utils.data.fim(params.data), //data final
        response = getResponseProduto(),
        fireCALLBACK = 2;

    var sqlClicks = utils.sql({
        'select': ['data', 'sum(cont) soma', 'query', 'idproduto', 'idquery'],
        'from': ['compilado_clicks'],
        'where': ['data >= 120724', 'idproduto=\'{termo}\''.replace('{termo}', termo),
            'data >= {datainicio}'.replace('{datainicio}',inicio), 'data <= {datafim}'.replace('{datafim}', fim)],
        'group by': ['data'],
        'order by': ['data']
    });

    var sqlProdutos = utils.sql({
        'select': ['idquery','query','sum(cont) soma'],
        'from': ['compilado_clicks'],
        'where': ['data >= 120724', 'idproduto=\'{termo}\''.replace('{termo}', termo),
            'data >= {datainicio}'.replace('{datainicio}',inicio), 'data <= {datafim}'.replace('{datafim}', fim)],
        'group by': ['idquery'],
        'order by': ['soma DESC']
    });

    db.find(database, sqlClicks, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }
        fireCALLBACK--;
        var totalClicks = 0;
        var quantidade = 0;
        rows.forEach( function(elem) {
            quantidade++;
            totalClicks = totalClicks + elem.soma;
            var data = elem.data.toString();
            var full = utils.data.formata(data, '.', 'DDMMYY');
            var diasemana = utils.data.getDiaSemana(data);
            var graph = utils.data.formata(data, '.', 'DDMM');
            response.clicks.push({
                'data': {
                    'full': full,
                    'dia': diasemana,
                    'graph': graph
                },
                'idQuery': elem.idquery,
                'query': elem.query,
                'clicks': elem.soma,
                'formatado': numeral(elem.soma).format('0,0').replace(/,/g,'.')
            });
            response.total.clicks.total = totalClicks;
            response.total.clicks.formatado = numeral(totalClicks).format('0,0').replace(/,/g,'.');
            if (quantidade > 0) {
                response.media.clicks.formatado = numeral(totalClicks/quantidade).format('0,0').replace(/,/g,'.');
                response.media.clicks.total = (totalClicks/quantidade);
            }
        });

        if (fireCALLBACK === 0) {
            callback.call(this, err, response);
        }
    });

    db.find(database, sqlProdutos, function(err, rows) {
        if (err) {
            callback.call(this, err, response);
            return;
        }

        fireCALLBACK--;

        var totalClicks = 0,
            quantidade = 0,
            maxvalue = 0;

        rows.forEach(function(elem) {
            totalClicks = totalClicks + elem.soma;
            quantidade++;

            if (quantidade === 1) {
                maxvalue = elem.soma;
            }

            var perc = '2%';

            if (maxvalue > 0) {
                perc = numeral(elem.soma/maxvalue).format('0%');
            }

            if (perc == '0%' || perc == '1%') {
                perc = '2%';
            }

            response.produtos.push({
                'pos': quantidade,
                'idQuery': elem.idquery,
                'query': elem.query,
                'clicks': elem.soma,
                'formatado': numeral(elem.soma).format('0,0').replace(/,/g,'.'),
                'perc': perc
            });
        });

        response.total.produtos.total = totalClicks;
            response.total.produtos.formatado = numeral(totalClicks).format('0,0').replace(/,/g,'.');
            if (quantidade > 0) {
                response.media.produtos.formatado = numeral(totalClicks/quantidade).format('0,0').replace(/,/g,'.');
                response.media.produtos.total = (totalClicks/quantidade);
            }

        if (fireCALLBACK === 0) {
            callback.call(this, err, response);
        }
    });
};

/**
 * Metodo para recuperar dados de um produto no xml da loja
 * @method getXML
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.getXML = function(database, params, callback) {
    var data = '',
        client = net.connect({ port: database.socketPort, host: database.socketHost }, function() {
            client.write(JSON.stringify(params));
        });

    client.on('data', function(res) {
        data += res;
        client.end();
    });

    client.on('end', function() {
        data = JSON.parse(data);
        data.fails = [];
        var idLists = params.id_list;
        if (data.error !== undefined) {
            callback.call(this, data.msg, null);
        } else {
            if (data.products.length > 0) {
                /*If id_lists is biggest than data.products because an ID was not found*/
                if (idLists.length > data.products.length) {
                    var sizeIdLists = idLists.length, sizeProducts = data.products.length, i = 0, j = 0;
                    for (i; i < sizeIdLists; i++) {
                        var response = false, idTemp = idLists[i];
                        for(j; j < sizeProducts; j++) {
                            var idProduct = data.products[j].id;
                            if (idTemp == idProduct) {
                                response = true;
                                break;
                            }
                        }
                        if (response === false) {
                            data.fails.push(idTemp);
                        }
                    }
                } else {
                    var xml = data.products[0].full_node;
                    var entities = new Entities();
                    data.products[0].full_node = entities.encode(xml);
                }
            }
            callback.call(this, null, data);
        }
    });
};

/**
 * Metodo para normalizar o termo de entrada.
 * @method findQuery
 * @param  {Object}   database Objeto com informacoes do banco de dados a ser coletado
 * @param  {Object}   params   Objeto JSON com parâmetros para recuperar informações de um termo
 * @param  {Function} callback Função que será executada após a chamada
 */
exports.normalize = function (values) {
    var arr = values.split(","),
        aux = [];

    for (var i = 0, max = arr.length; i < max; i++) {
        if (typeof(parseInt(arr[i], 10)) === 'number') {
            aux.push(arr[i]);
        }
    }

    return {"id_list": aux, "full_node": true};
};
