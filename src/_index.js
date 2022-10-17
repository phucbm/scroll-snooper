import {uniqueId} from "./utils";


/**
 * Private class
 */
class ScrollSnooper{
    constructor(options){
        this.id = uniqueId();
        this.options = {
            el: undefined,
            ...options
        };

        this.options.el.innerHTML = 'Hello!';
    }
}


/**
 * Private class Controller
 * This class will hold instances of the library's objects
 */
class Controller{
    constructor(){
        this.instances = [];
    }

    add(slider){
        this.instances.push(slider);
    }

    get(id){
        return this.instances.filter(instance => instance.id === id)[0];
    }
}


/**
 * Public library data
 * access via window.ScrollSnooperController
 */
window.ScrollSnooperController = new Controller();


/**
 * Public library object
 * access via window.ScrollSnooper
 */
window.ScrollSnooper = {
    // init new instances
    init: (options = {}) => {
        const selector = options.selector || '[data-scroll-snooper]';

        // init with selector
        document.querySelectorAll(selector).forEach(el => {
            window.ScrollSnooperController.add(new ScrollSnooper({el, ...options}));
        });
    },
    // Get instance object by ID
    get: id => window.ScrollSnooperController.get(id)
};

window.ScrollSnooper.init();