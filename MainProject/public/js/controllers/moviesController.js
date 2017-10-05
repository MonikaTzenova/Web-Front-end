var moviesController = function () {
    function all(context) {
        var size = 2,
            page = +context.params['page'] || 0;
        templates.get('movies')
            .then(function (template) {
                var moviesRef = firebase.database().ref('movies');
                moviesRef = moviesRef.orderByChild('timestamp');
                moviesRef.on('value', function (snapshot) {
                    this.data = [];
                    snapshot.forEach(function (child) {
                        this.data.push(child.val());
                    }.bind(this));

                    //pagination
                    var pagesLen = Math.ceil(data.length / size),
                        pages = [],
                        currentPage = page + 1;

                    for (var i = 0; i < pagesLen; i += 1) {
                        pages.push({
                            page: i,
                            displayPage: i + 1
                        });
                    }

                    data = data.slice(page * size, (page + 1) * size);
                    // Handlebars.registerHelper('isActive', function (block) {
                    //     if (this.page === page) {
                    //         return block.fn(this);
                    //     } else {
                    //         return block.inverse(this);
                    //     }
                    // });
                    var numberLinks = 5;
                    Handlebars.registerHelper('pagination', function (currentPage, totalPage, size, options) {
                        var startPage, endPage, context, totalPage = totalPage - 1;

                        if (arguments.length === 3) {
                            options = size;
                            size = 5;
                        }

                        startPage = currentPage - Math.floor(size / 2);
                        endPage = currentPage + Math.floor(size / 2);

                        if (startPage <= 0) {
                            endPage -= (startPage - 1);
                            startPage = 0;
                            endPage = endPage - 1;
                        }

                        if (endPage > totalPage) {
                            endPage = totalPage;
                            if (endPage - size + 1 > 0) {
                                startPage = endPage - size + 1;
                            } else {
                                startPage = 0;
                            }
                        }

                        context = {
                            startFromFirstPage: false,
                            pages: [],
                            endAtLastPage: false,
                        };
                        if (startPage === 0) {
                            context.startFromFirstPage = true;
                        }

                        for (var i = startPage; i <= endPage; i++) {
                            context.pages.push({
                                page: i,
                                display: i + 1,
                                isCurrent: i === currentPage
                            });
                        }
                        if (endPage === totalPage) {
                            context.endAtLastPage = true;
                        }
                        return options.fn(context);
                    });

                    context.$element().html(template({
                        movies: data,
                        pages: pages,
                        page: page,
                        pagesLen: pagesLen,
                        numberLinks: numberLinks,
                        currentPage: currentPage
                    }));
                    //Ratings
                    $(function () {
                        $('.example').each(function () {
                            var x = $(this).attr('data-rating');
                            var review_id = $(this).attr('review-id');
                            $('#example' + review_id).barrating({
                                theme: 'fontawesome-stars',
                                showSelectedRating: true,
                                initialRating: x,
                                readonly: true
                            });
                        });
                    });

                });
            });

    }
    function add(context) {
        templates.get('movie-add')
            .then(function (template) {
                context.$element().html(template());

                var title = document.getElementById('title');
                var producer = document.getElementById('producer');
                var description = document.getElementById('desc');
                var image = document.getElementById('imgUrl');

                $('#btnAdd').on('click', function () {
                    firebase.auth().onAuthStateChanged(firebaseUser => {
                        if (firebaseUser) {
                            //Get user information
                            var userData;
                            var userRef = firebase.database().ref('users').child(firebaseUser.uid);
                            userRef.on('value', function (snapshot) {
                                userData = snapshot.val();
                                console.log(userData);
                            });
                            var inputTitle = title.value;
                            var inputProducer = producer.value;
                            var inputDescription = description.value;
                            var inputImage = image.value;

                            var today = new Date();
                            var options = {
                                year: "numeric", month: "long",
                                day: "numeric", hour: "2-digit", minute: "2-digit"
                            };
                            today = today.toLocaleDateString("bg-BG", options);


                            var refUserMovies = firebase.database().ref();
                            var key = refUserMovies.push().key;
                            refUserMovies.child('users/' + firebaseUser.uid).child('movies/').push({
                                id: key,
                                title: inputTitle,
                                producer: inputProducer,
                                description: inputDescription,
                                image: inputImage,
                                postedBy: userData.username,
                                timestamp: (new Date().toString(), 0 - Date.now()), //Descending order
                                date: today
                            });

                            var refMovies = firebase.database().ref();
                            // Get a key for a new Book.
                            var newMoviesKey = refBooks.push().key;
                            refMovies.child('movies/' + newMoviesKey).set({
                                id: newMoviesKey,
                                title: inputTitle,
                                producer: inputProducer,
                                description: inputDescription,
                                image: inputImage,
                                postedBy: userData.username,
                                timestamp: (new Date().toString(), 0 - Date.now()), //Descending order
                                date: today
                            });

                            toastr.success('Movie added!');
                            context.redirect('#/movies');
                        } else {
                            context.redirect('#/login');
                            toastr.success('Please login');
                        }
                    });
                });

            });
    }

    function byId(context) {
        var id = context.params['id'];
        var data = [];
        var movieRef = firebase.database().ref('movies').child(id);
        movieRef.on('value', function (snapshot) {
            // var a = snapshot.exists();
            var movieVal = snapshot.val();
            data.push(movieVal);
            templates.get('movie')
                .then(function (template) {
                    context.$element().html(template(data));
                    movieRef.off('value');

                    var user = firebase.auth().currentUser;
                    var ratingsExists, ratings = [];
                    movieRef.child('ratings').on('value', function (snapshot) {
                        ratingsExists = snapshot.exists();
                        snapshot.forEach(function (child) {
                            var rateVal = child.val();
                            ratings.push(rateVal);
                        });
                    });
                    console.log(ratings);
                    var sum, avarrage, userVote;
                    if (ratingsExists == true && user) {
                        sum = ratings.map(x => x.userRating).reduce((a, b) => parseInt(a) + parseInt(b));
                        avarrage = sum / ratings.length;
                        console.log(avarrage);
                        function findById(source, id) {
                            for (var i = 0; i < source.length; i++) {
                                if (source[i].userId === id) {
                                    return source[i];
                                }
                            }
                            console.log("Couldn't find user with id: " + id);
                        }

                        userVote = findById(ratings, user.uid);
                        console.log(userVote);
                        movieRef.child('rating').set(avarrage.toFixed(2));
                        if (userVote != undefined) {
                            movieRef.child('userVote').set(userVote.userRating);
                        }
                    }

                    //Ratings
                    $(function () {
                        var x = $('.example').attr('data-rating');
                        var review_id = $('.example').attr('review-id');

                        if (user != null) { //ako imame user
                            if (ratingsExists == true) { //ako ima ratings
                                if (userVote == undefined) { //ako user ne e glasuval
                                    $('.your-rating').hide();
                                    $('#example' + review_id).barrating({
                                        theme: 'fontawesome-stars',
                                        showSelectedRating: true,
                                        initialRating: x,
                                        onSelect: function (value, text) {
                                            if (value) {
                                                console.log(value);
                                            }
                                            $('#rate').on('click', function () {
                                                movieRef.child('ratings').push({
                                                    userId: user.uid,
                                                    userRating: value
                                                });
                                            });
                                        }
                                    });

                                } else { //ako user e glasuval
                                    $('#example' + review_id).barrating({
                                        theme: 'fontawesome-stars',
                                        showSelectedRating: true,
                                        initialRating: x,
                                        readonly: true
                                    });
                                    $('#rate').hide();
                                    $('.tooltiptext').hide();
                                }
                            } else { //if ratings doesnt exist you can rate
                                $('#example' + review_id).barrating({
                                    theme: 'fontawesome-stars',
                                    showSelectedRating: true,
                                    initialRating: x,
                                    onSelect: function (value, text) {
                                        if (value) {
                                            console.log(value);
                                        }

                                        $('#rate').on('click', function () {
                                            movieRef.child('ratings').push({
                                                userId: user.uid,
                                                userRating: value
                                            });
                                        });

                                    }

                                });
                            }//end if ratingsExists
                        } else { //ako nqma user
                            $('.your-rating').hide();
                            $('.tooltiptext').hide();
                            $('#example' + review_id).barrating({
                                theme: 'fontawesome-stars',
                                showSelectedRating: true,
                                initialRating: x,
                                readonly: true
                            });

                            $('#rate').on('click', function () {
                                toastr.info('You have to logged in to vote!');
                                context.redirect('#/login');
                            });
                        }
                    });
                });
        });
    }

    function addPost(context) {
        templates.get('post-add')
            .then(function (template) {
                context.$element().html(template());

                var inputComment = document.getElementById('textComment');
                $('#addComment').on('click', function () {
                    firebase.auth().onAuthStateChanged(firebaseUser => {
                        var input = inputComment.value;
                        var key;
                        var id = context.params['id'];
                        if (firebaseUser) {
                            var moviesRef = firebase.database().ref('movies').child(id);
                            moviesRef.on('value', function (snapshot) {
                                var moviesVal = snapshot.val();
                                key = Object.keys(moviesVal);
                            });

                            var today = new Date();
                            today = today.toLocaleDateString("bg-BG");
                            //Get user information
                            var userData;
                            var userRef = firebase.database().ref('users').child(firebaseUser.uid);
                            userRef.on('value', function (snapshot) {
                                userData = snapshot.val();
                            });
                            //Get book information
                            var movieData;
                            var moviesRef = firebase.database().ref('movies').child(id);
                            moviesRef.on('value', function (snapshot) {
                                movieData = snapshot.val();
                            });
                            //Save to /books/bookId/childID/posts/postID
                            var movieRef = firebase.database().ref('movies').child(id).child('posts').push({
                                message: input,
                                postedBy: userData.username,
                                date: today,
                                photoUrl: userData.photoUrl,
                                movieId: movieData.id,
                                movieProducer: movieData.producer,
                                movieTitle: movieData.title
                            });
                            //Save to /users/userId/posts/postId
                            var refUserPosts = firebase.database().ref();
                            refUserPosts.child('users/' + firebaseUser.uid).child('posts/').push({
                                message: input,
                                postedBy: userData.username,
                                date: today,
                                photoUrl: userData.photoUrl,
                                movieId: movieData.id,
                                movieProducer: movieData.producer,
                                movieTitle: movieData.title
                            });

                            toastr.success('Comment added!');
                            context.redirect('#/movies');

                        } else {
                            context.redirect('#/login');
                            toastr.success('To Add Comment You Have To Logged in!');
                        }
                    });
                });
            });
    }

    return {
        all: all,
        add: add,
        getById: byId,
        addPost: addPost
    };
} ();