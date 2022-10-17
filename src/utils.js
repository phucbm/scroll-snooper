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
 * @returns {{top_bottom: number, center_bottom: number, top: *, left: *, offsetHeight: number, top_top: number, offsetWidth: number, bottom_top: number, center_top: number, bottom_bottom: number}}
 */
export function getRelativeOffset(element){
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
export function getPositionFromString(string, referenceHeight = viewport().h){
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
export function getCoordinateFromString(string, elHeight = viewport().h){
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
export function getDistance(element, coordinateString){
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
export function getProgress(element, coordinateStringStart, coordinateStringEnd){
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
export function createMarker(isViewport = true, isStart = true, viewportPosition = 0){
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