function toggleNavbar() {
    var iconNavbar = document.querySelector('.nav .icon');
    var isClickInside = iconNavbar.contains(event.target);

    if (!isClickInside) {
        var navbarOptions = document.querySelector('.social-media');
        navbarOptions.style.display = 'none';
    }
}

function checkScreenSize() {
    if (window.matchMedia("(max-width: 500px)").matches) {
        document.addEventListener('click', toggleNavbar);

        var icon = document.querySelector('.nav .icon');
        icon.addEventListener('click', function() {
            var navbarOptions = document.querySelector('.social-media');
            if (navbarOptions.style.display === 'flex') {
                navbarOptions.style.display = 'none';
            } else {
                navbarOptions.style.display = 'flex';
            }
        });
    } else {
        document.removeEventListener('click', toggleNavbar);
    }
}

checkScreenSize();

window.addEventListener('resize', checkScreenSize);