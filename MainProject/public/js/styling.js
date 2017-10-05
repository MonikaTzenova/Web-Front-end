//styles
(function() {
    var toggleClasses = function() {
        var wi = $(window).width();
        if (wi < 950) {
            $('.row-fixed').each(function(index, el) {
                $(el).removeClass('triggered');
            });
            $('.navbar-collapse').removeClass('center-block');

            if (wi < 768) {
                $('body').addClass('mobile');
            }

            if (wi > 768) {

                $('body').removeClass('mobile');
            }
        } else if (wi > 951) {
            $('.row-fixed').each(function(index, el) {
                $(el).addClass('triggered');
            });
            $('.navbar-collapse').addClass('center-block');

            if (wi > 768) {

                $('body').removeClass('mobile');
            }
        }
    };

    $(document).ready(function($) {
        templates.get('header').then(function(data) {
            $('#header').html(data);
            templates.get('footer').then(function(data) {
                $('#footer').html(data);
                toggleClasses();
            });
        });

    });

    $(window).resize(function(event) {
        toggleClasses();
    });
})();