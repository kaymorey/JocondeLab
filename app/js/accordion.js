(function($)
{
    function resizeAccordion(content, items, settings, parameters) {
        var width  = content.width(),
        height = content.height();

        var maxWidth = width - (settings.nbImages - 1) * parameters.minWidth;
        var closeWidth = Math.floor(settings.contentWidth / settings.nbImages);

        settings.contentWidth = width;
        settings.contentHeight = height;
        settings.maxWidth = maxWidth;

        items.height(settings.contentHeight);
        items.find('img').height(settings.contentHeight);

        if(settings.openIndex == -1) {
            items.width(Math.floor(settings.contentWidth / settings.nbImages));
            items.each(function(index) {
                $(this).css({
                    'left': closeWidth * index +'px'
                });
            });
        }
        else {

        }    
    }
    $.fn.accordion = function(options)
    {
        var defauts = {
            "minWidth": 30
        };  
           
        parameters = $.extend(defauts, options);

        var width  = this.width(),
        height = this.height();

        var nbImages = this.find('li').find('img').length;
        items = this.find('li');
        content = this;

        var maxWidth = width - (nbImages - 1) * parameters.minWidth;

        var settings = {
            'content': this,
            'contentWidth': width,
            'contentHeight': height,
            'maxWidth': maxWidth,
            'nbImages': nbImages,
            'openIndex': -1
        };

        items.height(settings.contentHeight);
        items.find('img').height(settings.contentHeight);

        items.css('opacity', '0.5');

        return items.each(function(index) {
            var closeWidth = Math.floor(settings.contentWidth / settings.nbImages);
            // Last image
            if(index == settings.nbImages - 1) {
                $(this).width(settings.contentWidth - (index * closeWidth));
            }
            else {
                $(this).width(closeWidth);
            }

            $(this).css({
                '-webkit-box-shadow': '-2px -2px 12px 2px black',
                '-moz-box-shadow': '-2px -2px 12px 2px black',
                'box-shadow': '-2px -2px 12px 2px black',
                'left': closeWidth * index +'px'
            });

            $(this).on("mouseover", function() {
                if(settings.openIndex != index) {
                    $(this).css('opacity', '1');
                }
            });
            $(this).on("mouseout", function() {
                if(settings.openIndex != index) {
                    $(this).css('opacity', '0.5');
                }
            });

            $(this).on("click", function() {
                var imageWidth = $(this).find('img').width();
                settings.openIndex = index;
                var openWidth;
                var leftPos = 0;

                if(imageWidth > settings.maxWidth) {
                    openWidth = settings.maxWidth;
                }
                else {
                    openWidth = imageWidth;
                }

                closeWidth = (settings.contentWidth - openWidth) / (settings.nbImages - 1);

                items.each(function(index) {
                    if(index == 0) {
                        leftPos = 0;
                    }
                    else if(index == settings.openIndex + 1) {
                        leftPos += openWidth;
                    }
                    else {
                        leftPos += closeWidth;
                    }

                    $(this).animate({
                        width: closeWidth,
                        left: leftPos
                    }, {duration: 500, queue: false });
                    $(this).css('opacity', '0.5');
                });

                $(this).animate({
                    width: openWidth
                }, {duration: 500, queue: false });
                $(this).css('opacity', '1');

            });

            $(window).bind("resize", function () {
                resizeAccordion(content, items, settings, parameters);
            });
            
        });
    };
})(jQuery);