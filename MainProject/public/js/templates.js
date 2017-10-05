var templates = (function (params) {
    function get(name) {
        var promise = new Promise(function (resolve, reject) {
            var url = 'templates/' + name + '.handlebars';
            $.get(url, function (html) {
                var template = Handlebars.compile(html);
                resolve(template);
            });
        });
        return promise;
    }
    return {
        get: get
    };
}());