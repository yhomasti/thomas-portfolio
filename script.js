//Script.js file in the main directory


function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}


// Thought bubble text rotation
document.addEventListener('DOMContentLoaded', function() {
    const thoughtBubble = document.querySelector('.thought-bubble-text');
    const thoughtTexts = [
        "What am I listening to now?",
        "Wonder what Thomas likes to listen to?",
        "What's on Thomas's playlist?",
        "Curious about my music taste? Don't be dissapointed!",
        "What song is stuck in my head?"
    ];
    
    let currentTextIndex = 0;
    
    function rotateThoughtText() {
        if (thoughtBubble && !document.querySelector('.section__pic-container.spotify-enhanced:hover')) {
            currentTextIndex = (currentTextIndex + 1) % thoughtTexts.length;
            thoughtBubble.textContent = thoughtTexts[currentTextIndex];
        }
    }
    
    setInterval(rotateThoughtText, 10000);
});

// CURSOR TRAIL EFFECT
let mouseX = 0, mouseY = 0;
let trails = [];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    createTrail(mouseX, mouseY);
});

function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    // Remove trail after animation
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
    }, 800);
}

//floating particle thingies
function createParticles() {
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);
    
    function addParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        //particles have random sizes
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(particle);
        
        //remove particles after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 20000);
    }
    
    //particles
    setInterval(addParticle, 500);
}

//scroll animation
function initScrollReveal() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

//typing animation (this does not work)
function initSmoothTitle() {
    const title = document.querySelector('.title');
    if (title) {
        //animation happens automatically via CSS, no JS needed
        console.log('Smooth title animation initialized');
    }
}

//animation for skills
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const percentage = entry.target.dataset.percentage || '80';
                entry.target.style.width = percentage + '%';
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

//the 3d tilt thing
function init3DTilt() {
    const cards = document.querySelectorAll('.details-container');
    
    cards.forEach(card => {
        card.classList.add('project-card-3d');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
    });
}

//the button effects
function enhanceButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.classList.add('btn-enhanced');
    });
}

//paralax button
function initParallaxBg() {
    const bg = document.createElement('div');
    bg.className = 'parallax-bg';
    document.body.insertBefore(bg, document.body.firstChild);
}

document.addEventListener('DOMContentLoaded', function() {
    
    
    // Then add the new pizzazz effects
    createParticles();
    initScrollReveal();
    initSmoothTitle();
    animateSkillBars();
    init3DTilt();
    enhanceButtons();
    initParallaxBg();
    
    // Delay some effects for dramatic entrance
    setTimeout(() => {
        document.body.style.overflow = 'visible';
    }, 1000);
});


//MORE NAVIGATION STUFF THIS IS JUST A TEST
function enhanceNavigation() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Subtle scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Active section highlighting
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}


// Enhanced thought bubble and dark overlay effects
document.addEventListener('DOMContentLoaded', function() {
    const profileContainer = document.querySelector('.section__pic-container.spotify-enhanced');
    const body = document.body;
    
    if (profileContainer) {
        const darkOverlay = document.createElement('div');
        darkOverlay.className = 'dark-overlay';
        darkOverlay.id = 'dark-overlay';
        body.appendChild(darkOverlay);
        
        profileContainer.addEventListener('mouseenter', function() {
            darkOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
            
            const spotifyTooltip = document.querySelector('.spotify-tooltip');
            if (spotifyTooltip) {
                spotifyTooltip.style.filter = 'brightness(1.2) contrast(1.1)';
                spotifyTooltip.style.boxShadow = `
                    0 25px 80px rgba(29, 185, 84, 0.8),
                    0 0 0 3px rgba(255, 255, 255, 0.6),
                    0 0 80px rgba(255, 255, 255, 0.5)
                `;
            }
        });
        
        profileContainer.addEventListener('mouseleave', function() {
            darkOverlay.style.background = 'rgba(0, 0, 0, 0)';
            
            const spotifyTooltip = document.querySelector('.spotify-tooltip');
            if (spotifyTooltip) {
                spotifyTooltip.style.filter = '';
                spotifyTooltip.style.boxShadow = '';
            }
        });
    }
    
    const thoughtBubble = document.querySelector('.thought-bubble-text');
    const thoughtTexts = [
        "What am I listening to now?",
        "Wonder what Thomas likes to listen to?",
        "What's on Thomas's playlist?",
        "Curious about my music taste? Don't be dissapointed!",
        "What song is stuck in my head?"
    ];
    
    let currentTextIndex = 0;
    
    function rotateThoughtText() {
        if (thoughtBubble && profileContainer && !profileContainer.matches(':hover')) {
            currentTextIndex = (currentTextIndex + 1) % thoughtTexts.length;
            thoughtBubble.textContent = thoughtTexts[currentTextIndex];
        }
    }
    
    setInterval(rotateThoughtText, 10000);
});