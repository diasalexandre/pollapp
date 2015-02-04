/*
 * Source code information
 * -----------------------
 * Original author    Alexandre Dias
 * Author email       alexandrermd@gmail.com
 * Company Website    http://www.diasalexandres.com
 * Created            19-03-2014
 * Filename           mysql.js
 * Revision            1.0
 * Release status     State:
 *
 * Last modified
 * -----------------------
 * Date: 19-03-2014 Author: Alexandre Dias
 */

var mysql = require('mysql'),
	fs = require('fs'),
	DBFILE = './databases.json', //arquivo com a configuração do banco a ser acessado;
	db = { }, //objeto de manipulação do BANCO DE DADOS
	databases = { }, //objeto com as informações do BANCO
	atualdb = { },
	dbSameConnect = null;

/**
 * @description Metodo para carregar o arquivo de configuracao dos banco de dados
 */
var initDB = function() {
	console.log("Carregando arquivo databases.json");
	try {
		databases = require(DBFILE);
		console.log("Arquivo carregado. Os bancos sao: %s", JSON.stringify(databases));
	} catch (ex) {
		console.log(ex);
		console.error("Error ao carregar o arquivo JSON com as configuracoes dos banco de dados");
	}
};

/**
 * Metodo para recuperar as informações do banco em que foi passado na url de requisicao
 * @param  {String} name nome do banco
 * @return {Object}      objeto com as configurações do banco
 */
var getDatabase = function(name) {
	if (name && typeof name == 'string') {
		if (databases[name] === undefined) {
			console.error("Nome da loja nao existe!");
			return undefined;
		} else {
			return databases[name];
		}
	}
};

/**
 * Método para fazer o setup do banco e criar o pool
 * @param  {Object} configurações do banco de dados
 */
var setup = function(database) {
	if (database && typeof database == 'object') {
		if (database === undefined) {
			console.error('Nao foi encontrado o arquivo de configuração para o banco.');
		} else {
            var dbs = Object.keys(db),
                store = database.label;

            if (dbs.length === 0 || dbs.indexOf(store) === -1) {
                database.connectionLimit = 100;
                db[store] = mysql.createPool(database);
            }
        }
	}
};

/**
 * Metodo para comandos que podem ser executadas por mais de uma conexao
 * @param  {Object}   database Objeto com informacoes da loja para conectar ao banco
 * @param  {String}   query    QUERY Sql
 * @param  {Function} callback Funcao de callback a ser executada apos a consulta sql
 */
var find = function(database, query, callback) {
	setup.call(this, database);
	console.log('QUERY: %s', query);
	if (query && typeof query == 'string') {
        var store = database.label;

        db[store].getConnection(function (err, conn) {
            conn.query(query, function (err, rows) {
                conn.release();
                callback.call(this, err, rows);
            });
        });
	}
};

/**
 * Save entries in the database
 * @param  {Object} database the database configurations
 * @param  {String} query the query to execute
 * @param  {Function} callback callback to execute after execution of the query
 */
var save = function(database, query, callback) {
	setup.call(this, database);
	console.log('QUERY: %s', query);
	if (query && typeof query == 'string') {
        var store = database.label;

        db[store].getConnection(function (err, conn) {
            conn.query(query, function (err, rows) {
                conn.release();
                callback.call(this, err, rows);
            });
        });
	}
};

//---------------------------------//
// METODOS Publicos
//---------------------------------//
exports.find = find;
exports.init = initDB;
exports.save = save;
exports.getDatabase = getDatabase;

