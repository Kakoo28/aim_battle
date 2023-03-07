const CURSOR = document.getElementById('cursor');

window.addEventListener('mousemove', (e) => {
    CURSOR.style.left = e.clientX - 25/2 + 'px';
    CURSOR.style.top = e.clientY - 25/2 + 'px';
})