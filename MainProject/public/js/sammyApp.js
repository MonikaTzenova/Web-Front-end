(function () {
    var sammyApp = Sammy('#content', function () {
        this.get('#/', function () {
            this.redirect('#/home');
        });
        this.get('#/home', homeController.all);
        this.get('#/about', aboutController.all);

        this.get('#/login', usersController.login);
        this.get('#/signup', usersController.signup);
        this.get('#/logout', usersController.logout);
        this.get('#/profile', usersController.currentUser);

        this.get('#/movies', moviesController.all);
        this.get('#/movies/add', moviesController.add);
        this.get('#/movies/:page', moviesController.all);
        this.get('#/movies/id/:id', moviesController.getById);
        this.get('#/movies/id/:id/posts/add', moviesController.addPost);


    });
    $(function () {
        sammyApp.run('#/');
    });
} ());