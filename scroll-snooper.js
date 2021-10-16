/**!
 * Scroll Snooper v0.0.1
 * https://github.com/phucbm/scroll-snooper
 */
class ScrollSnooper{
    constructor(element){
        this.element = element;

        // status
        this.isEnter = false;
        this.isEnterFull = false;

        // on scroll
        window.addEventListener('scroll', () => {
            this.update();
        });
    }


    /**
     * Is In Viewport
     * @param proportion true if at least [n]% of the element is in the viewport
     * @returns {boolean}
     */
    isInViewport(proportion = 0){
        return this.visibility().proportion >= proportion && this.visibility().pixel > 0;
    };


    /**
     * Visibility
     * @returns {{proportion: number, pixel: number}}
     */
    visibility(){
        const offset = this.offset();
        const visible_bottom = Math.max(0, Math.min(offset.h, -1 * offset.top_bottom));
        const visible_top = Math.max(0, Math.min(offset.h, offset.bottom_top));
        const pixel = Math.min(visible_bottom, visible_top, ScrollSnooper.viewport().h);
        const proportion = pixel / offset.h;

        return {pixel, proportion};
    }


    /**
     * Element offset
     */
    offset(){
        const x = this.element.offsetLeft;
        const y = this.element.offsetTop;
        const w = this.element.offsetWidth;
        const h = this.element.offsetHeight;

        // distance from [anchor] of element to [anchor] of viewport
        const top_top = y - ScrollSnooper.scroll().top;
        const top_bottom = top_top - ScrollSnooper.viewport().h;
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
    };


    /**
     * On events
     * @param event
     * @param callback
     */
    on(event, callback){
        switch(event){
            case 'enter':
                this.element.addEventListener('onEnter', function(e){
                    callback(e);
                }, false);
                break;
            case 'enter:full':
                this.element.addEventListener('onEnterFull', function(e){
                    callback(e);
                }, false);
                break;
            case 'exit':
                this.element.addEventListener('onExit', function(e){
                    callback(e);
                }, false);
                break;
            case 'exit:partial':
                this.element.addEventListener('onExitPartial', function(e){
                    callback(e);
                }, false);
                break;
        }
    }


    /**
     * Events
     * @type {Event}
     */
    static onEnter = new Event('onEnter');
    static onEnterFull = new Event('onEnterFull');
    static onExit = new Event('onExit');
    static onExitPartial = new Event('onExitPartial');


    /**
     * Scroll Update
     */
    update(){
        // Event: enter, exit
        if(this.isInViewport()){
            if(!this.isEnter){
                this.isEnter = true;
                this.element.dispatchEvent(ScrollSnooper.onEnter);
            }
        }else{
            if(this.isEnter){
                this.isEnter = false;
                this.element.dispatchEvent(ScrollSnooper.onExit);
            }
        }

        // Event: enterFull, exitPartial
        if(this.visibility().proportion >= 1){
            if(!this.isEnterFull){
                this.isEnterFull = true;
                this.element.dispatchEvent(ScrollSnooper.onEnterFull);
            }
        }else{
            if(this.isEnterFull){
                this.element.dispatchEvent(ScrollSnooper.onExitPartial);
                this.isEnterFull = false;
            }
        }
    }


    /**
     * Viewport size
     * @returns {{w: number, h: number}}
     */
    static viewport(){
        return {
            w: (window.innerWidth || document.documentElement.clientWidth),
            h: (window.innerHeight || document.documentElement.clientHeight)
        };
    };


    /**
     * Scroll position
     * @returns {{top: number, left: number}}
     */
    static scroll(){
        return {
            left: (window.pageXOffset || document.documentElement.scrollLeft) - (document.documentElement.clientLeft || 0),
            top: (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
        };
    }
}