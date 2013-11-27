(function($)
{
    $.fn.accordion = function()
    {
        var width  = this.width(),
        height = this.height();

        var nbImages = this.find('li').find('img').length;
        var items = this.find('li');

        var minWidth = 30;
        var maxWidth = width - (nbImages - 1) * minWidth;

        openIndex = -1;

        items.height(height);
        items.find('img').height(height);

        items.css('opacity', '0.5');

        return items.each(function(index) {
            var realWidth = width/nbImages;
            closeWidth = Math.floor(width/nbImages);
            if(index == nbImages - 1) {
                $(this).width(width - (index * closeWidth));
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

                closeWidth = (width - openWidth) / (nbImages - 1);

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