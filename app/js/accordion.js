(function($)
{
    $.fn.accordion = function()
    {
        var SCREEN_WIDTH  = $(window).width(),
        SCREEN_HEIGHT = $(window).height();

        var nbImages = this.find('li').find('img').length;
        this.height(SCREEN_HEIGHT/1.5);
        console.log(this);

        return this.find('li').each(function(index) {
            var realWidth = SCREEN_WIDTH/nbImages;
            var width = Math.floor(SCREEN_WIDTH/nbImages);
            if(index == nbImages - 1) {
                $(this).width(SCREEN_WIDTH - (index * width));
            }
            else {
                $(this).width(width);
            }
            
        });
    };
})(jQuery);