var fs = require('fs');

exports.getParams = getParams;

function getParams (href, cb) {
	var title, content;
	switch(href) {
		case 'index': 
		    title = 'Accueil';
		    content = 'accueil.html';
		    break;

		case 'presentation':
		    title = 'Présentation';
		    content = 'presentation.html';
		    break;
		
		case 'news':
		    title = 'Actualités';
		    content = 'news.html';
		    break;
		    
		case 'downloads':
		    title = 'Téléchargements';
		    content = 'downloads.html';
		    break;

		case 'bibliography':
		    title = 'Bibliographie';
		    content = 'bibliography.html';
		    break;

		case 'about':
		    title = 'À propos';
		    content = 'about.html';
		    break;

		case 'npm':
		    title = 'Node Packages Modules';
		    content = 'npm.html'
		    break;
    }

    if(title) {
    	fs.readFile(__dirname + '/views/' + content, {encoding: 'UTF-8'}, function(err, data) {
    		if(err) {
				content = 'Error 500: something went horribly wrong. Please reload the page';
			} else {
				content = data
			}
			cb({title: title, content: content});
    	})
    } else {
    	cb({title: 'Error 404', content: 'Error 404: this page doesn\'t exist'});
    }
}
