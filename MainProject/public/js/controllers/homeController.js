var homeController = function () {
    $('#link-logout').hide();

    function all(context) {
        templates.get('home')
            .then(function (template) {
                context.$element().html(template());

                var slider = new Vue({
                    el: '#image-slider',
                    data: {
                        slides: 5
                    },
                    components: {
                        'carousel-3d': Carousel3d.Carousel3d,
                        'slide': Carousel3d.Slide
                    }
                });
            });
    }

    return {
        all: all
    };
} ();