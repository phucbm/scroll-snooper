/**!
 * Scroll Snooper v1.0.0
 * https://github.com/phucbm/scroll-snooper
 * MIT License - Copyright (c) 2021 Minh-Phuc Bui
 */
;(function(ScrollSnooper){
    /**
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
     * Is jQuery element
     * @param element : HTMLElement
     * @returns {boolean}
     */
    function isjQueryElement(element){
        return typeof jQuery !== 'undefined' && element instanceof jQuery;
    }


    /**
     * Get element
     * Compatible with jQuery
     * @param element : HTMLElement
     * @returns {*}
     */
    function getElement(element = undefined){
        // is jQuery element
        if(isjQueryElement(element)){
            return element.get()[0];
        }

        return element;
    }


    /**
     * Get element offsets
     * https://github.com/jquery/jquery/blob/d0ce00cdfa680f1f0c38460bc51ea14079ae8b07/src/offset.js#L87
     * @param element : HTMLElement
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
     * @param element : HTMLElement
     * @returns {{top_bottom: number, center_bottom: number, w: number, top_top: number, x: number, h: number, y: number, bottom_top: number, center_top: number, bottom_bottom: number}}
     */
    function getRelativeOffset(element){
        const left = getOffset(element).left;
        const top = getOffset(element).top;
        const offsetWidth = element.offsetWidth;
        const offsetHeight = element.offsetHeight;

        // distance from [anchor] of element to [anchor] of viewport
        const top_top = top - scroll().top;
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
            left, top, offsetWidth, offsetHeight,
        };
    }


    /**
     * Convert string to coordinate value
     * @param string : string | "top bottom"
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
     * @param element : HTMLElement
     * @param coordinateString : string | "top bottom"
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
     * @param element : HTMLElement
     * @param coordinateStringStart : string | "top bottom"
     * @param coordinateStringEnd : string | "top bottom"
     * @returns {number}
     */
    function getProgress(element, coordinateStringStart, coordinateStringEnd){
        if(typeof element === 'undefined') return 0;

        const distanceStart = getDistance(element, coordinateStringStart);
        const distanceEnd = getDistance(element, coordinateStringEnd);
        return distanceStart * -1 / (distanceEnd - distanceStart);
    }


    /**
     * Is In Viewport
     * @param element : HTMLElement
     * @param proportion :number | returns true if at least [n]% of the element is in the viewport
     * @returns {boolean}
     */
    ScrollSnooper.isInViewport = (element, proportion = 0) => {
        const progress = getProgress(getElement(element), 'top bottom', 'bottom top');
        const isInViewport = progress > 0 && progress <= 1;
        const isValidProportion = ScrollSnooper.visibility(element).proportion >= proportion;

        return isValidProportion && isInViewport;
    }


    /**
     * Get element's visibility
     * @param element : HTMLElement
     * @returns {{proportion: number, pixel: number}}
     */
    ScrollSnooper.visibility = element => {
        element = getElement(element);
        const offset = getRelativeOffset(element);

        const visible_bottom = Math.max(0, Math.min(element.offsetHeight, -1 * offset.top_bottom));
        const visible_top = Math.max(0, Math.min(element.offsetHeight, offset.bottom_top));
        const pixel = Math.min(visible_bottom, visible_top, viewport().h);
        const proportion = pixel / element.offsetHeight;

        return {pixel, proportion};
    };


    /**
     * Get the most visible element
     * @param elements : HTMLElement
     * @param atLeastPixel : number
     * @returns {*&{el: (*|jQuery|HTMLElement)}}
     */
    ScrollSnooper.getTheMostVisible = (elements, atLeastPixel = 0) => {
        let mostVisibleElement = undefined, maxVisibility = {pixel: 0},
            isFound = false,
            index = 0, maxIndex = undefined;
        for(const element of elements){
            const visibility = ScrollSnooper.visibility(element);
            if(visibility.pixel >= atLeastPixel && visibility.pixel > maxVisibility.pixel){
                maxVisibility = visibility;
                mostVisibleElement = element;
                maxIndex = index;
                isFound = true;
            }
            index++;
        }
        if(typeof jQuery !== 'undefined' && isFound){
            mostVisibleElement = isjQueryElement(mostVisibleElement) ? mostVisibleElement : jQuery(mostVisibleElement)
        }
        return {
            isFound, index: maxIndex,
            el: mostVisibleElement,
            ...maxVisibility
        };
    };


    /**
     * Create
     * @param config : object
     */
    ScrollSnooper.create = (config) => {
        const option = {
            ...{
                trigger: undefined,
                start: 'top bottom',
                end: 'bottom top',
                visibility: false, // Get visibility value
                onEnter: data => {
                },
                onLeave: data => {
                },
                onScroll: data => {
                },
                // Get the most visible
                isGetTheMostVisible: false,
                atLeastPixel: 0,
                onChange: data => {
                },
                onFound: data => {
                },
            }, ...config
        };
        let isEnter = false, lastMostVisible = undefined;
        const element = getElement(option.trigger);

        // function update
        const update = (e) => {
            const progress = getProgress(element, option.start, option.end);
            let _data = {
                trigger: element,
                progress: progress,
                isInViewport: progress > 0,
                timeStamp: e.timeStamp,
                type: e.type
            };

            // Get visibility value
            if(option.visibility){
                _data = {..._data, visibility: ScrollSnooper.visibility(element)};
            }

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

            // Feature: Get the most visible
            if(option.isGetTheMostVisible){
                const newVisible = ScrollSnooper.getTheMostVisible(option.trigger, option.atLeastPixel);

                if(typeof lastMostVisible === 'undefined' || newVisible.index !== lastMostVisible.index){
                    lastMostVisible = newVisible;

                    // Event: change visible element
                    option.onChange({..._data, mostVisible: newVisible});

                    // Event: found new visible element
                    if(newVisible.isFound){
                        option.onFound({..._data, mostVisible: newVisible});
                    }
                }
            }
        };

        // trigger update
        window.addEventListener('load', e => update(e));
        window.addEventListener('scroll', e => update(e));
        window.addEventListener('resize', e => update(e));
    }

})(window.ScrollSnooper = window.ScrollSnooper || {});