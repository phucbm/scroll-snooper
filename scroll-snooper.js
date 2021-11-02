/**!
 * Scroll Snooper v0.0.4
 * https://github.com/phucbm/scroll-snooper
 */
;(function(ScrollSnooper){
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
     * Get element
     * Compatible with jQuery
     * @param element
     * @returns {*}
     */
    function getElement(element){
        // is jQuery element
        if(typeof jQuery !== 'undefined' && element instanceof jQuery){
            return element.get()[0];
        }

        return element;
    }


    /**
     * Get element offsets
     * https://github.com/jquery/jquery/blob/d0ce00cdfa680f1f0c38460bc51ea14079ae8b07/src/offset.js#L87
     * @param element
     * @returns {{top: *, left: *}|{top: number, left: number}}
     */
    function getOffset(element){
        if(!element.getClientRects().length){
            return {top: 0, left: 0};
        }

        const rect = element.getBoundingClientRect();
        const win = element.ownerDocument.defaultView;
        return {
            top: rect.top + win.pageYOffset,
            left: rect.left + win.pageXOffset
        };
    }


    /**
     * Get element relative offsets
     * @param element
     * @returns {{top_bottom: number, center_bottom: number, w: number, top_top: number, x: number, h: number, y: number, bottom_top: number, center_top: number, bottom_bottom: number}}
     */
    function getRelativeOffset(element){
        const x = element.offsetLeft;
        const y = element.offsetTop;
        const offsetWidth = element.offsetWidth;
        const offsetHeight = element.offsetHeight;

        // distance from [anchor] of element to [anchor] of viewport
        const top_top = y - scroll().top;
        const top_bottom = top_top - viewport().h;
        const bottom_bottom = top_bottom + offsetHeight;
        const bottom_top = top_top + offsetHeight;
        const center_top = bottom_top - offsetHeight * 0.5;
        const center_bottom = top_bottom + offsetHeight * 0.5;

        return {
            top_top,
            top_bottom,
            bottom_bottom,
            bottom_top,
            center_top,
            center_bottom,
            x, y, offsetWidth, offsetHeight,
        };
    }


    /**
     * Convert string to coordinate value
     * @param string
     * @returns {{viewport, element}}
     */
    function getCoordinateFromString(string){
        const positionStrings = {
            top: 0,
            center: 0.5,
            bottom: 1
        };
        const element = positionStrings[string.split(' ')[0]];
        const viewport = positionStrings[string.split(' ')[1]];

        return {element, viewport};
    }


    /**
     * Distance from an anchor of element to an anchor of viewport
     * @param element
     * @param coordinateString
     * @returns {number}
     */
    function getDistance(element, coordinateString){
        const coordinate = getCoordinateFromString(coordinateString);
        const elementAnchor = getOffset(element).top + element.offsetHeight * coordinate.element;
        const viewportAnchor = scroll().top + viewport().h * coordinate.viewport;
        return elementAnchor - viewportAnchor;
    }


    /**
     * Get element progress
     * @param element
     * @param coordinateStringStart
     * @param coordinateStringEnd
     * @returns {number}
     */
    function getProgress(element, coordinateStringStart, coordinateStringEnd){
        const distanceStart = getDistance(element, coordinateStringStart);
        const distanceEnd = getDistance(element, coordinateStringEnd);
        return distanceStart * -1 / (distanceEnd - distanceStart);
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
                onScroll: data => {
                }
            }, ...config
        };
        let isEnter = false, isEnterFull = false;
        const element = getElement(option.trigger);

        // function update
        const update = (e) => {
            const progress = getProgress(element, option.start, option.end);
            const _data = {
                trigger: element,
                progress: progress,
                isInViewport: progress > 0,
                timeStamp: e.timeStamp,
                type: e.type
            };

            // Event: scroll
            option.onScroll(_data);

            // Event: enter, exit
            if(progress > 0 && progress <= 1){
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
        };

        // trigger update
        window.addEventListener('load', e => update(e));
        window.addEventListener('scroll', e => update(e));
    }


    /**
     * Public
     * Is In Viewport
     * @param element
     * @param proportion returns true if at least [n]% of the element is in the viewport
     * @returns {boolean}
     */
    ScrollSnooper.isInViewport = (element, proportion = 0) => {
        const progress = getProgress(getElement(element), 'top bottom', 'bottom top');
        const isInViewport = progress > 0 && progress <= 1;
        const isValidProportion = ScrollSnooper.visibility(element).proportion >= proportion;

        return isValidProportion && isInViewport;
    }


    /**
     * Public
     * Get element's visibility
     * @param element
     * @returns {{proportion: number, pixel: number}}
     */
    ScrollSnooper.visibility = (element) => {
        element = getElement(element);
        const offset = getRelativeOffset(element);

        const visible_bottom = Math.max(0, Math.min(element.offsetHeight, -1 * offset.top_bottom));
        const visible_top = Math.max(0, Math.min(element.offsetHeight, offset.bottom_top));
        const pixel = Math.min(visible_bottom, visible_top, viewport().h);
        const proportion = pixel / element.offsetHeight;

        return {pixel, proportion};
    };

})(window.ScrollSnooper = window.ScrollSnooper || {});