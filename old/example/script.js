// Scene 1
Scroll
Snooper.create({
    trigger: document.querySelector('.scene-1'),
    start: 'top bottom',
    end: 'bottom bottom',
    onScroll: data => {
        const progress = ratio => Math.floor(ratio * Math.min(1, data.progress));

        const block = document.querySelector('.scene-1 .spinning-face');
        block.style.borderRadius = `${progress(50)}%`;
        block.style.transform = `scale(${data.progress},${data.progress}) rotate(${progress(720)}deg)`;
        block.style.backgroundColor = `rgba(${progress(220)}, ${progress(20)}, ${progress(60)}, 1)`;

        document.querySelector('.scene-1 .bg i').style.transform = `translateX(${Math.max(0, Math.min(100, data.progress * 100))}%)`;
    }
});

// Scene 2
// events
function updateEvent(element){
    element.classList.add("on");
    setTimeout(() => {
        element.classList.remove("on");
    }, 500);
}

Scroll
Snooper.create({
    trigger: document.querySelector('.scene-2 .shark'),
    start: 'top bottom',
    end: 'bottom top',
    visibility: true,
    onEnter: data => {
        updateEvent(document.querySelector('.scene-2 .onEnter'));
    },
    onLeave: data => {
        updateEvent(document.querySelector('.scene-2 .onLeave'));
    },
    onScroll: data => {
        updateEvent(document.querySelector('.scene-2 .onScroll'));

        document.querySelector('.scene-2 [data-progress]').innerHTML = data.progress.toFixed(2);
        document.querySelector('.scene-2 [data-pixel]').innerHTML = `${data.visibility.pixel}px`;
        document.querySelector('.scene-2 [data-proportion]').innerHTML = data.visibility.proportion.toFixed(2);
    }
});

// Scene 3
Scroll
Snooper.create({
    trigger: document.querySelector('.scene-3 .phoebe img'),
    markers: true,
    start: 'top 90%',
    end: 'bottom center',
    onEnter: data => {
        document.querySelector('body').classList.add('scene-3-show');
    },
    onLeave: data => {
        document.querySelector('body').classList.remove('scene-3-show');
    },
    onScroll: data => {
        document.querySelector('.scene-3 [data-progress]').innerHTML = data.progress.toFixed(2);
    }
});

// Infinite scroll
Scroll
Snooper.create({
    trigger: document.querySelector('body'),
    start: 'top top',
    end: 'bottom bottom',
    onScroll: data => {
        if(data.progress === 1){
            window.scrollTo(0, 0)
        }
    }
})