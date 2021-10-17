/**!
 * Scroll Snooper v0.0.2
 * https://github.com/phucbm/scroll-snooper
 */
;(function(ScrollSnooper){
    /**
     * Private
     * Element offset
     */
    function offset(element){
        const x = element.offsetLeft;
        const y = element.offsetTop;
        const w = element.offsetWidth;
        const h = element.offsetHeight;

        // distance from [anchor] of element to [anchor] of viewport
        const top_top = y - scroll().top;
        const top_bottom = top_top - viewport().h;
        const bottom_bottom = top_bottom + h;
        const bottom_top = top_top + h;
        const center_top = bottom_top - h * 0.5;
        const center_bottom = top_bottom + h * 0.5;

        return {
            top_top,
            top_bottom,
            bottom_bottom,
            bottom_top,
            center_top,
            center_bottom,
            x, y, w, h,
        };
    }

    /**
     * Private
     * Viewport size
     * @returns {{w: number, h: number}}
     */
    function viewport(){
        return {
            w: (window.innerWidth || document.documentElement.clientWidth),
            h: (window.innerHeight || document.documentElement.clientHeight)
        };
    }


    /**
     * Private
     * Scroll position
     * @returns {{top: number, left: number}}
     */
    function scroll(){
        return {
            left: (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0),
            top: (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
        };
    }


    /**
     * Public
     * Is In Viewport
     * @param element
     * @param proportion true if at least [n]% of the element is in the viewport
     * @returns {boolean}
     */
    ScrollSnooper.isInViewport = (element, proportion = 0) => {
        return ScrollSnooper.visibility(element).progress >= proportion && ScrollSnooper.visibility(element).pixel > 0;
    }


    /**
     * Public
     * Visibility
     * @returns {{progress: number, pixel: number}}
     */
    ScrollSnooper.visibility = function(element){
        const _offset = offset(element);
        const visible_bottom = Math.max(0, Math.min(_offset.h, -1 * _offset.top_bottom));
        const visible_top = Math.max(0, Math.min(_offset.h, _offset.bottom_top));
        const pixel = Math.min(visible_bottom, visible_top, viewport().h);
        const progress = pixel / _offset.h;

        return {pixel, progress};
    }


    /**
     * Public
     * Create
     * @param config
     */
    ScrollSnooper.create = (config) => {
        const option = {
            ...{
                trigger: '',
                start: 'top bottom',
                end: 'bottom top',
                onEnter: data => {
                },
                onLeave: data => {
                },
                onEnterFull: data => {
                },
                onLeavePartial: data => {
                },
                onScroll: data => {
                }
            }, ...config
        };
        let isEnter = false, isEnterFull = false;

        // on scroll
        window.addEventListener('scroll', (e) => {
            const _isInViewport = ScrollSnooper.isInViewport(option.trigger);
            const _visibility = ScrollSnooper.visibility(option.trigger);
            const _data = {
                trigger: option.trigger,
                progress: _visibility.progress,
                pixel: _visibility.pixel,
                isInViewport: _isInViewport,
                timeStamp: e.timeStamp
            };

            // Event: scroll
            option.onScroll(_data);

            // Event: enter, exit
            if(_isInViewport){
                if(!isEnter){
                    isEnter = true;
                    option.onEnter(_data);
                }
            }else{
                if(isEnter){
                    isEnter = false;
                    option.onLeave(_data);
                }
            }

            // Event: enterFull, exitPartial
            if(_visibility.progress >= 1){
                if(!isEnterFull){
                    isEnterFull = true;
                    option.onEnterFull(_data);
                }
            }else{
                if(isEnterFull){
                    isEnterFull = false;
                    option.onLeavePartial(_data);
                }
            }
        });
    }

})(window.ScrollSnooper = window.ScrollSnooper || {});