(function($)
{
    $.fn.accordion = function()
    {
        var SCREEN_WIDTH  = $(window).width(),
        SCREEN_HEIGHT = $(window).height();

        var nbImages = this.find('li').find('img').length;
        var items = this.find('li');

        var minWidth = 30;
        var maxWidth = SCREEN_WIDTH - nbImages / SCREEN_WIDTH;

        openIndex = -1;

        this.height(SCREEN_HEIGHT/1.5);
        items.height(SCREEN_HEIGHT/1.5);
        items.css('opacity', '0.5');

        return this.find('li').each(function(index) {
            var realWidth = SCREEN_WIDTH/nbImages;
            closeWidth = Math.floor(SCREEN_WIDTH/nbImages);
            if(index == nbImages - 1) {
                $(this).width(SCREEN_WIDTH - (index * closeWidth));
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
                if(openIndex != index) {
                    $(this).css('opacity', '1');
                }
            });
            $(this).on("mouseout", function() {
                if(openIndex != index) {
                    $(this).css('opacity', '0.5');
                }
            });

            $(this).on("click", function() {
                var imageWidth = $(this).find('img').width();
                openIndex = index;
                var openWidth;
                var leftPos = 0;

                if(imageWidth > maxWidth) {
                    openWidth = maxWidth;
                }
                else {
                    openWidth = imageWidth;
                }

                closeWidth = (SCREEN_WIDTH - openWidth) / (nbImages - 1);

                items.each(function(index) {
                    if(index == 0) {
                        leftPos = 0;
                    }
                    else if(index == openIndex + 1) {
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
            })
            
        });
    };
})(jQuery);