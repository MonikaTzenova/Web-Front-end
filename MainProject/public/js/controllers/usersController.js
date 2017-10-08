var usersController = function() {
    function login(context) {
        templates.get('login')
            .then(function(template) {
                context.$element().html(template());

                // Get Elemnets
                const txtEmail = document.getElementById('txtEmail');
                const txtPassword = document.getElementById('txtPassword');
                const btnLogin = document.getElementById('btnLogin');
                const btnSignUp = document.getElementById('btnSignUp');
                const btnLogout = document.getElementById('btnLogout');

                // add login event
                btnLogin.addEventListener('click', e => {
                    // Get email and pass
                    const email = txtEmail.value;
                    const pass = txtPassword.value;
                    const auth = firebase.auth();
                    // Sign in
                    const promise = auth.signInWithEmailAndPassword(email, pass);
                    promise.then(e => toastr.success('User logged in!'));
                    promise.catch(e => toastr.error(e.message));
                });
                firebase.auth().onAuthStateChanged(firebaseUser => {
                    if (firebaseUser) {
                        console.log('logged in');
                        context.redirect('#/');
                        $('#btnLogin').hide();
                        $('#link-login').hide();
                        $('#link-logout').show();
                    } else {
                        $('#btnLogout').hide();
                        $('#link-logout').hide();
                        console.log('not logged in');
                    }
                });
            });
    }

    function register(context) {
        templates.get('signup')
            .then(function(template) {
                context.$element().html(template());

                const txtEmail = document.getElementById('txtEmail');
                const txtPassword = document.getElementById('txtPassword');
                const btnLogin = document.getElementById('btnLogin');
                const btnSignUp = document.getElementById('btnSignUp');
                const btnLogout = document.getElementById('btnLogout');
                const txtUsername = document.getElementById('uname');

                btnSignUp.addEventListener('click', e => {
                    var email = txtEmail.value;
                    var pass = txtPassword.value;
                    var username = txtUsername.value;
                    var auth = firebase.auth();

                    const promise = auth.createUserWithEmailAndPassword(email, pass);

                    promise.catch(e => console.log(e.message));
                    promise.then(e => console.log('registred'));
                    promise.then(e => toastr.success('User registred!'));
                    //Saving data
                    firebase.auth().onAuthStateChanged(firebaseUser => {
                        if (firebaseUser) {
                            console.log(username);
                            var refUser = firebase.database().ref();
                            refUser.child('users/' + firebaseUser.uid).set({
                                username: username,
                                email: email
                            });
                        }
                    });

                });

            });
    }
    function logout(context) {
        const btnLogout = document.getElementById('link-logout');
        btnLogout.addEventListener('click', e => {
            firebase.auth().signOut();
            toastr.success('Logged out');
            context.redirect('#/login');

            $('#btnLogin').show();
            $('#link-logout').hide();
            $('#link-login').show();
        });

    }
    function currentUser(context) {
        templates.get('profile')
            .then(function(template) {
                var user = firebase.auth().currentUser;
                var uid, userData;
                if (user != null) {
                    uid = user.uid;
                    var userRef = firebase.database().ref('users').child(uid);
                    userRef.on('value', function(snapshot) {
                        userData = snapshot.val();
                        context.$element().html(template(userData));
                    });
                } else {
                    toastr.info('You have to logged in!');
                    context.redirect('#/login');
                }
            });
    }

    return {
        login: login,
        signup: register,
        logout: logout,
        currentUser: currentUser
    };
} ();
