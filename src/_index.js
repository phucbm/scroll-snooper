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
    // Helper function to get scroll position based on orientation
    const getScrollPosition = (orientation) => {
        const scrollPos = scroll();
        return orientation === 'horizontal' ? scrollPos.left : scrollPos.top;
    };

    // Helper function to get viewport size based on orientation
    const getViewportSize = (orientation) => {
        const viewportSize = viewport();
        return orientation === 'horizontal' ? viewportSize.w : viewportSize.h;
    };

    // Helper function to convert user-friendly terms to start/end
    const convertToStartEnd = (position, orientation) => {
        if(orientation === 'vertical'){
            return position === 'top' ? 'start' : 'end';
        }else{
            return position === 'left' ? 'start' : 'end';
        }
    };

    /**
     * Is In Viewport
     * @param element : HTMLElement
     * @param proportion :number | returns true if at least [n]% of the element is in the viewport
     * @param orientation : string | 'vertical' or 'horizontal'
     * @returns {boolean}
     */
    ScrollSnooper.isInViewport = (element, proportion = 0, orientation = 'vertical') => {
        const startPosition = orientation === 'vertical' ? 'top bottom' : 'left right';
        const endPosition = orientation === 'vertical' ? 'bottom top' : 'right left';
        const progress = getProgress(getElement(element), startPosition, endPosition, orientation);
        const isInViewport = progress > 0 && progress <= 1;
        const isValidProportion = ScrollSnooper.visibility(element, orientation).proportion >= proportion;
        console.log('isValidProportion', ScrollSnooper.visibility(element, orientation).proportion, 'progress', progress)

        return isValidProportion && isInViewport;
    }


    /**
     * Get element's visibility
     * @param element : HTMLElement
     * @param orientation : string | 'vertical' or 'horizontal'
     * @returns {{proportion: number, pixel: number}}
     */
    ScrollSnooper.visibility = (element, orientation = 'vertical') => {
        element = getElement(element);
        const offset = getRelativeOffset(element, orientation);

        const isHorizontal = orientation === 'horizontal';
        const elementSize = isHorizontal ? element.offsetWidth : element.offsetHeight;
        const viewportSize = getViewportSize(orientation);

        const visible_end = Math.max(0, Math.min(elementSize, -1 * (isHorizontal ? offset.left_right : offset.top_bottom)));
        const visible_start = Math.max(0, Math.min(elementSize, isHorizontal ? offset.right_left : offset.bottom_top));
        const pixel = Math.min(visible_end, visible_start, viewportSize);
        const proportion = pixel / elementSize;
        console.log('offset', offset, 'visible_start', visible_start)

        return {pixel, proportion};
    };


    /**
     * Get the most visible element
     * @param elements
     * @param atLeastPixel
     * @param orientation : string | 'vertical' or 'horizontal'
     * @returns {{isFound: boolean, el: undefined, index: undefined, pixel: number}}
     */
    ScrollSnooper.getTheMostVisible = (elements, atLeastPixel = 0, orientation = 'vertical') => {
        let mostVisibleElement = undefined, maxVisibility = {pixel: 0},
            isFound = false,
            index = 0, maxIndex = undefined;
        for(const element of elements){
            const visibility = ScrollSnooper.visibility(element, orientation);
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
                orientation: 'vertical', // Default orientation
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

        // Set start and end based on the orientation
        option.start = option.start || (option.orientation === 'vertical' ? 'top bottom' : 'left right');
        option.end = option.end || (option.orientation === 'vertical' ? 'bottom top' : 'right left');

        let isEnter = false, lastMostVisible = undefined, previousPosition = getScrollPosition(option.orientation);
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
                const newVisible = ScrollSnooper.getTheMostVisible(option.trigger, option.atLeastPixel, option.orientation);
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
                const progress = getProgress(element, option.start, option.end, option.orientation);
                const currentPosition = getScrollPosition(option.orientation);
                let _data = {
                    trigger: element,
                    progress: progress,
                    direction: currentPosition > previousPosition ? -1 : 1,
                    isInViewport: progress > 0 && progress < 1
                };
                previousPosition = currentPosition;

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
                    const offset = getOffset(element);
                    const isHorizontal = option.orientation === 'horizontal';
                    const elementSize = isHorizontal ? element.offsetWidth : element.offsetHeight;
                    const startOffset = elementSize * markers.start.element;
                    const endOffset = elementSize * markers.end.element;

                    // element milestone
                    markers.elementStart.style[isHorizontal ? 'left' : 'top'] = `${(isHorizontal ? offset.left : offset.top) + startOffset}px`;
                    markers.elementEnd.style[isHorizontal ? 'left' : 'top'] = `${(isHorizontal ? offset.left : offset.top) + endOffset}px`;

                    // element range
                    markers.elementStart.style[isHorizontal ? 'width' : 'height'] = `${endOffset - startOffset}px`;
                }

                // Get visibility value
                if(option.visibility){
                    _data = {..._data, visibility: ScrollSnooper.visibility(element, option.orientation)};
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