import {uniqueId} from "./utils";


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
     * Get position from string
     * @param string : string
     * @param referenceHeight
     * @returns {number|*}
     */
    function getPositionFromString(string, referenceHeight = viewport().h){
        const positionStrings = {
            top: 0,
            center: 0.5,
            bottom: 1
        };
        let position = positionStrings[string];

        if(typeof position === 'number') return position;

        // percentage
        if(string.includes('%')) return parseInt(string) / 100;

        // pixel
        if(string.includes('px')) return parseInt(string) / referenceHeight;

        return position;
    }


    /**
     * Convert string to coordinate value
     * @param string : string | "top bottom"
     * @param elHeight
     * @returns {{viewport, element}}
     */
    function getCoordinateFromString(string, elHeight){
        const split = string.split(' ');
        const element = getPositionFromString(split[0], elHeight);
        const viewport = getPositionFromString(split[1]);

        return {element, viewport};
    }


    /**
     * Distance from an anchor of element to an anchor of viewport
     * @param element : HTMLElement
     * @param coordinateString : string | "top bottom"
     * @returns {number}
     */
    function getDistance(element, coordinateString){
        const coordinate = getCoordinateFromString(coordinateString, element.offsetHeight);
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
     * Create marker element
     * @param isViewport : boolean
     * @param isStart : boolean
     * @param viewportPosition
     * @returns {HTMLDivElement}
     */
    function createMarker(isViewport = true, isStart = true, viewportPosition = 0){
        // create element
        const markerElement = document.createElement('div');

        // add style
        const color = isStart ? '#6495edff' : '#dc143cff';
        markerElement.style.cssText = 'right:0; z-index:99999; width:40px; height:0; pointer-events:none; font-size:14px;';
        markerElement.style.position = isViewport ? 'fixed' : 'absolute';
        markerElement.style.backgroundColor = !isViewport && isStart ? 'rgba(100,149,237,0.1)' : '';
        markerElement.style.color = color;
        markerElement.style.borderTop = `1px solid ${color}`;

        // append to body
        document.body.appendChild(markerElement);

        // add label
        const label = document.createElement('span');
        label.innerText = isStart ? 'start' : 'end';
        markerElement.appendChild(label);

        // align label in viewport
        if(isViewport && viewportPosition > 0.9 || !isViewport && !isStart){
            label.style.cssText = 'position:absolute; bottom:0; left:0;';
        }

        return markerElement;
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
        const isValidProportion = Scroll
        Snooper.visibility(element).proportion >= proportion;

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
     * @param elements
     * @param atLeastPixel
     * @returns {{isFound: boolean, el: undefined, index: undefined, pixel: number}}
     */
    ScrollSnooper.getTheMostVisible = (elements, atLeastPixel = 0) => {
        let mostVisibleElement = undefined, maxVisibility = {pixel: 0},
            isFound = false,
            index = 0, maxIndex = undefined;
        for(const element of elements){
            const visibility = Scroll
            Snooper.visibility(element);
            if(visibility.pixel >= atLeastPixel && visibility.pixel > maxVisibility.pixel){
                maxVisibility = visibility;
                mostVisibleElement = element;
                maxIndex = index;
                isFound = true;
            }
            index++;
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
                markers: false,
                progressOutOfView: false, // Set true to receive progress event on every update
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
        let isEnter = false, lastMostVisible = undefined, previousPosition = scroll().top;
        const element = getElement(option.trigger);

        // create markers
        const markers = {};
        if(option.markers){
            markers.start = getCoordinateFromString(option.start);
            markers.end = getCoordinateFromString(option.end);

            // viewport start
            markers.viewportStart = createMarker(true, true, markers.start.viewport);
            markers.viewportStart.style.top = `${markers.start.viewport * 100}%`;

            // viewport end
            markers.viewportEnd = createMarker(true, false, markers.end.viewport);
            markers.viewportEnd.style.top = `${markers.end.viewport * 100}%`;

            // element start/end
            markers.elementStart = createMarker(false, true);
            markers.elementEnd = createMarker(false, false);
        }

        // function update
        const update = () => {
            // Feature: Get the most visible
            if(option.isGetTheMostVisible){
                const newVisible = Scroll
                Snooper.getTheMostVisible(option.trigger, option.atLeastPixel);
                if(typeof lastMostVisible === 'undefined' || newVisible.index !== lastMostVisible.index){
                    lastMostVisible = newVisible;

                    // Event: change visible element
                    option.onChange({mostVisible: newVisible});

                    // Event: found new visible element
                    if(newVisible.isFound){
                        option.onFound({...newVisible});
                    }
                }
            }else{
                const progress = getProgress(element, option.start, option.end);
                let _data = {
                    trigger: element,
                    progress: progress,
                    direction: scroll().top > previousPosition ? -1 : 1,
                    isInViewport: progress > 0 && progress < 1
                };
                previousPosition = scroll().top;

                // Event: enter, exit
                if(_data.isInViewport){
                    if(!isEnter){
                        isEnter = true;
                        option.onEnter(_data);
                    }
                }else{
                    if(isEnter){
                        isEnter = false;
                        option.onLeave(_data);
                    }else{
                        if(!option.progressOutOfView){
                            // only run update when element is between start and end
                            return false;
                        }
                    }
                }

                // Update markers
                if(option.markers){
                    const offsetTop = getOffset(element).top;
                    const startOffset = element.offsetHeight * markers.start.element;
                    const endOffset = element.offsetHeight * markers.end.element;

                    // element milestone
                    markers.elementStart.style.top = `${offsetTop + startOffset}px`;
                    markers.elementEnd.style.top = `${offsetTop + endOffset}px`;

                    // element range
                    markers.elementStart.style.height = `${endOffset - startOffset}px`;
                }

                // Get visibility value
                if(option.visibility){
                    _data = {..._data, visibility: ScrollSnooper.visibility(element)};
                }

                // Event: scroll
                option.onScroll(_data);
            }
        };

        // trigger update using rAF
        let flag = null;
        const getFlag = () => JSON.stringify({...scroll(), ...viewport()});
        const fire = () => {
            if(flag !== getFlag()){
                update();
                flag = getFlag();
            }
            window.requestAnimationFrame(fire);
        }
        window.requestAnimationFrame(fire);
    }

})(window.ScrollSnooper = window.ScrollSnooper || {});