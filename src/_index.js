import {
    viewport,
    scroll,
    getElement,
    getOffset,
    getRelativeOffset,
    getProgress,
    createMarker,
    getCoordinateFromString
} from "./utils";


;(function(ScrollSnooper){
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
     * @param elements
     * @param atLeastPixel
     * @returns {{isFound: boolean, el: undefined, index: undefined, pixel: number}}
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
                const newVisible = ScrollSnooper.getTheMostVisible(option.trigger, option.atLeastPixel);
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