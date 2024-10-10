/**
 * Viewport size
 * @returns {{w: number, h: number}}
 */
export function viewport(){
    return {
        w: (window.innerWidth || document.documentElement.clientWidth),
        h: (window.innerHeight || document.documentElement.clientHeight)
    };
}

/**
 * Scroll position
 * @returns {{top: number, left: number}}
 */
export function scroll(){
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
export function isjQueryElement(element){
    return typeof jQuery !== 'undefined' && element instanceof jQuery;
}


/**
 * Get element
 * Compatible with jQuery
 * @param element : HTMLElement
 * @returns {*}
 */
export function getElement(element = undefined){
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
export function getOffset(element){
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
 * @param orientation : string | 'vertical' or 'horizontal'
 * @returns {{top_bottom: number, center_bottom: number, top: *, left: *, offsetHeight: number, top_top: number, offsetWidth: number, bottom_top: number, center_top: number, bottom_bottom: number}}
 */
export function getRelativeOffset(element, orientation = 'vertical'){
    const left = getOffset(element).left;
    const top = getOffset(element).top;
    const offsetWidth = element.offsetWidth;
    const offsetHeight = element.offsetHeight;

    const scrollPos = scroll();
    const viewportSize = viewport();

    if(orientation === 'vertical'){
        // distance from [anchor] of element to [anchor] of viewport
        const top_top = top - scrollPos.top;
        const top_bottom = top_top - viewportSize.h;
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
    }else{
        // Horizontal orientation
        const left_left = left - scrollPos.left;
        const left_right = left_left - viewportSize.w;
        const right_right = left_right + offsetWidth;
        const right_left = left_left + offsetWidth;
        const center_left = right_left - offsetWidth * 0.5;
        const center_right = left_right + offsetWidth * 0.5;

        return {
            left_left,
            left_right,
            right_right,
            right_left,
            center_left,
            center_right,
            left, top, offsetWidth, offsetHeight,
        };
    }
}


/**
 * Get position from string
 * @param string : string
 * @param referenceSize
 * @returns {number|*}
 */
export function getPositionFromString(string, referenceSize = viewport().h){
    const positionStrings = {
        top: 0,
        left: 0,
        center: 0.5,
        bottom: 1,
        right: 1
    };
    let position = positionStrings[string];

    if(typeof position === 'number') return position;

    // percentage
    if(string.includes('%')) return parseInt(string) / 100;

    // pixel
    if(string.includes('px')) return parseInt(string) / referenceSize;

    return position;
}


/**
 * Convert string to coordinate value
 * @param string : string | "top bottom" or "left right"
 * @param elSize
 * @returns {{viewport, element}}
 */
export function getCoordinateFromString(string, elSize = viewport().h){
    const split = string.split(' ');
    const element = getPositionFromString(split[0], elSize);
    const viewport = getPositionFromString(split[1]);

    return {element, viewport};
}


/**
 * Distance from an anchor of element to an anchor of viewport
 * @param element : HTMLElement
 * @param coordinateString : string | "top bottom" or "left right"
 * @param orientation : string | 'vertical' or 'horizontal'
 * @returns {number}
 */
export function getDistance(element, coordinateString, orientation = 'vertical'){
    const coordinate = getCoordinateFromString(coordinateString, orientation === 'vertical' ? element.offsetHeight : element.offsetWidth);
    const elementAnchor = orientation === 'vertical'
        ? getOffset(element).top + element.offsetHeight * coordinate.element
        : getOffset(element).left + element.offsetWidth * coordinate.element;
    const viewportAnchor = orientation === 'vertical'
        ? scroll().top + viewport().h * coordinate.viewport
        : scroll().left + viewport().w * coordinate.viewport;
    return elementAnchor - viewportAnchor;
}


/**
 * Get element progress
 * @param element : HTMLElement
 * @param coordinateStringStart : string | "top bottom" or "left right"
 * @param coordinateStringEnd : string | "bottom top" or "right left"
 * @param orientation : string | 'vertical' or 'horizontal'
 * @returns {number}
 */
export function getProgress(element, coordinateStringStart, coordinateStringEnd, orientation = 'vertical'){
    if(typeof element === 'undefined') return 0;

    const distanceStart = getDistance(element, coordinateStringStart, orientation);
    const distanceEnd = getDistance(element, coordinateStringEnd, orientation);
    return distanceStart * -1 / (distanceEnd - distanceStart);
}


/**
 * Create marker element
 * @param isViewport : boolean
 * @param isStart : boolean
 * @param viewportPosition
 * @param orientation : string | 'vertical' or 'horizontal'
 * @returns {HTMLDivElement}
 */
export function createMarker(isViewport = true, isStart = true, viewportPosition = 0, orientation = 'vertical'){
    // create element
    const markerElement = document.createElement('div');

    // add style
    const color = isStart ? '#6495edff' : '#dc143cff';
    markerElement.style.cssText = `${orientation === 'vertical' ? 'right' : 'bottom'}:0; z-index:99999; ${orientation === 'vertical' ? 'width:40px; height:0;' : 'height:40px; width:0;'} pointer-events:none; font-size:14px;`;
    markerElement.style.position = isViewport ? 'fixed' : 'absolute';
    markerElement.style.backgroundColor = !isViewport && isStart ? 'rgba(100,149,237,0.1)' : '';
    markerElement.style.color = color;
    markerElement.style[orientation === 'vertical' ? 'borderTop' : 'borderLeft'] = `1px solid ${color}`;

    // append to body
    document.body.appendChild(markerElement);

    // add label
    const label = document.createElement('span');
    label.innerText = isStart ? 'start' : 'end';
    markerElement.appendChild(label);

    // align label in viewport
    if(isViewport && viewportPosition > 0.9 || !isViewport && !isStart){
        label.style.cssText = `position:absolute; ${orientation === 'vertical' ? 'bottom:0; left:0;' : 'top:0; right:0;'}`;
    }

    return markerElement;
}