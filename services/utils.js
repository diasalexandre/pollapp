/*
 * Source code information
 * -----------------------
 * Original author    Alexandre Dias
 * Author email       alexandrermd@gmail.com
 * Company Website    http://www.diasalexandres.com
 * Created            19-03-2014
 * Filename           utils.js
 * Revision            1.0
 * Release status     State:
 *
 * Last modified
 * -----------------------
 * Date: 19-03-2014 Author: Alexandre Dias
 */

var util = require('util'),
	datejs = require('datejs'),
	phpjs = require('phpjs'),
	INICIOANO = '20';

exports.extends = function(source, dest) {
	for (var key in source) {
		if (source.hasOwnProperty(key)) {
			dest[key] = source[key];
		}
	}
	return dest;
};

/**
 * Objeto com funcoes gerais para tratamento de datas
 * @type {Object}
 */
exports.data = {
	/**
	 * Retorna da data de inicio no formato YYMMDD'
	 * @param  {String} data Parametro datainicio,datafim
	 * @return {String}      Retorna data de inicio
	 */
	inicio: function(data) {
		if (data && typeof data == 'string') {
			return data.split(',')[0];
		}
	},
	/**
	 * Retorna da data final no formato YYMMDD'
	 * @param  {String} data Parametro datainicio,datafim
	 * @return {String}      Retorna data final
	 */
	fim: function(data) {
		if (data && typeof data == 'string') {
			return data.split(',')[1];
		}
	},
	/**
	 * Metodo dado uma data de entrada no formato YYMMDD, retorna a data de acordo com o separador e formatado de saida
	 * @param  {String} data      Data de entrada no formato YYMMDD
	 * @param  {String} separator Simbolo que sera o separador da data. Ex com /: DD/MM/YYYY
	 * @param  {String} field     Formato de saida da data. Ex: DDMMYY
	 * @return {String}           Retorna a data de acordo com o formato da data definida
	 */
	formata: function (data, separator,field) {
		var response = '', that = this;
		if (separator && typeof separator == 'string') {
			var temp = [];
			if (data && typeof data == 'string' && data.length === 6) {
				var ano = INICIOANO.concat(data.substring(0,2)),
				mes = data.substring(2,4),
				dia = data.substring(4,6);
				if (field && typeof field == 'string') {
					switch (field) {
						case 'DD':
							temp.push(dia);
							break;
						case 'MM':
							temp.push(mes);
							break;
						case 'DDMM':
							temp.push(dia, mes);
							break;
						case 'DDMMYY':
							temp.push(dia, mes, ano);
							break;
						case 'MMDDYY':
							temp.push(mes, dia, ano);
							break;
						case 'YYMMDD':
							temp.push(ano, mes, dia);
							break;
						case 'DDMMMYY':
							var mesdesc = that.getMes(data);
							temp.push(dia, mesdesc, ano);
							break;
						default:
							temp.push(dia, mes, ano);
					}
				}
			}
			response = temp.join(separator);
		}
		return response;
	},
	/**
	 * Retorna o mes referente da data
	 * @param  {String} data A data no formato YYMMDD
	 * @return {String}      Mes da data referida, inicio do mes.
	 */
	getMes: function(data) {
		var response = '', meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
		if (data && typeof data == 'string' && data.length === 6) {
			var mes = data.substring(2,4);
			try {
				mes = parseInt(mes, 10);
				response = meses[mes - 1];
			} catch(ex) {
				response = mes;
			}
		}
		return response;
	},
	/**
	 * Retorna o dia da semana
	 * @param  {String} data A data no formato YYMMDD
	 * @return {String}      Retorna o dia da semana com as iniciais
	 */
	getDiaSemana: function(data) {
		var that = this, response = '', daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
		if (data && typeof data == 'string' && data.length === 6) {
			var temp = that.formata(data, ',', 'DDMMYY').split(',');
			var weekDay = new Date(parseInt(temp[2],10), parseInt(temp[1],10) - 1, parseInt(temp[0],10)); //data no formato YYYY/MM/DD, -1 no mes pois comeca a conta do 0
			response = daysOfWeek[weekDay.getUTCDay()];
		}
		return response;
	},
	subData: function(data, quantidade) {
		if (typeof data == 'string') {
			var anofull = INICIOANO.concat(data.substring(0,2)),
				ano = data.substring(0,2),
				mes = data.substring(2,4),
				dia = data.substring(4,6);

			var date = new Date(parseInt(anofull, 10), parseInt(mes, 10) - 1, parseInt(dia, 10));
			var sub = parseInt(quantidade, 10) * (-1);
			var finalDate = date.add(sub).days();
			var anofinal = finalDate.getFullYear().toString().replace('20','');
			var mesfinal = (finalDate.getMonth()+1);
			var diafinal = finalDate.getDate();
			if (mesfinal >= 0 && mesfinal <= 9) {
				mesfinal = '0' + mesfinal.toString();
			}
			if (diafinal >= 1 && diafinal <= 9) {
				diafinal = '0' + diafinal.toString();
			}

			return anofinal + mesfinal + diafinal;
		}

		return '';
	},
	subDuasDatas: function(ini, fim) {
		if (typeof ini == 'string') {
			var anoini = ini.split('-')[0];
			var mesini = ini.split('-')[1];
			var diaini = ini.split('-')[2];

			var anofim = fim.split('-')[0];
			var mesfim = fim.split('-')[1];
			var diafim = fim.split('-')[2];

			var dateini = new Date(parseInt(anoini, 10), parseInt(mesini, 10) - 1, parseInt(diaini, 10));
			var datefim = new Date(parseInt(anofim, 10), parseInt(mesfim, 10) - 1, parseInt(diafim, 10));

			return (datefim - dateini);

		}
	},
	formataUTF: function(date, name) {
		if (typeof date == 'object') {
			/*var anoini = ini.split('-')[0];
			var mesini = ini.split('-')[1];
			var diaini = ini.split('-')[2];

			var anofim = fim.split('-')[0];
			var mesfim = fim.split('-')[1];
			var diafim = fim.split('-')[2];

			var dateini = new Date(parseInt(anoini, 10), parseInt(mesini, 10) - 1, parseInt(diaini, 10));
			var datefim = new Date(parseInt(anofim, 10), parseInt(mesfim, 10) - 1, parseInt(diafim, 10));*/

			return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "  " + date.getHours() + ":" + date.getMinutes();
		}
	}
};

/**
 * Recebe um array e retorna a soma de todos os seus elementos
 * @param  {Array} elem Array com numeros que serao somados
 * @return {Integer}      Retorna o total da soma de todos os elementos do array
 */
exports.soma = function(elem) {
	var total = 0;
	if (util.isArray(elem)) {
		elem.forEach( function(value) {
			total = total + value;
		});
	}
	return total;
};

/**
 * Função com entrada de um objeto JSON que representa um SQL Query e retorna a query.
 * @param  {Object} sqlParams Objeto JSON com a representação do SQL Query. Ex: { 'select': ['a', 'b', 'c'], 'from': 'database'};
 * @return {[type]}           [description]
 */
exports.sql = function(sqlParams) {

	function sqlCommand(command) {
		var response = '';
		switch (command) {
			case 'select':
				response = ', ';
				break;
			case 'where':
				response = ' AND ';
				break;
			case 'set':
				response = ', ';
				break;
			case 'limit':
				response = ',';
				break;
			default:
				response = '';
                break;
		}
		return response;
	}

	var response = [];
	if (sqlParams && typeof sqlParams == 'object') {
		for (var key in sqlParams) {
			var separator = sqlCommand(key.toLowerCase());
			response.push(key.toUpperCase());
			response.push(sqlParams[key].join(separator));
		}
	}
	return response.join(' ');
};

exports.normalize = function (str) {
    var pattern = /[^a-zA-Z0-9,\-\ ]/,
        replacement = "",
        symbols = {
            'A' : '&Agrave;|&Aacute;|&Acirc;|&Atilde;|&Auml;|&Aring;',
            'a' : '&agrave;|&aacute;|&acirc;|&atilde;|&auml;|&aring;',
            'C' : '&Ccedil;',
            'c' : '&ccedil;',
            'E' : '&Egrave;|&Eacute;|&Ecirc;|&Euml;',
            'e' : '&egrave;|&eacute;|&ecirc;|&euml;',
            'I' : '&Igrave;|&Iacute;|&Icirc;|&Iuml;',
            'i' : '&igrave;|&iacute;|&icirc;|&iuml;',
            'N' : '&Ntilde;',
            'n' : '&ntilde;',
            'O' : '&Ograve;|&Oacute;|&Ocirc;|&Otilde;|&Ouml;',
            'o' : '&ograve;|&oacute;|&ocirc;|&otilde;|&ouml;',
            'U' : '&Ugrave;|&Uacute;|&Ucirc;|&Uuml;',
            'u' : '&ugrave;|&uacute;|&ucirc;|&uuml;',
            'Y' : '&Yacute;',
            'y' : '&yacute;|&yuml;',
            'a.' : '&ordf;',
            'o.' : '&ordm;'
        };

    str = str.toLowerCase(str);
    str = phpjs.htmlspecialchars(str);
    str = phpjs.htmlentities(str, 'ENT_NOQUOTES', 'UTF-8');

    for (var letter in symbols) {
        var padrao = new RegExp(symbols[letter], 'g');
        str = str.replace(padrao, letter);
    }

    str = str.replace(pattern, replacement, str);

    return str.trim();

};

