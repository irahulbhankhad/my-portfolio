// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const torchIcon = themeToggle ? themeToggle.querySelector('i') : null;
const themeProfileImages = document.querySelectorAll('img[data-light-src][data-dark-src]');
const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme', next);
        applyTheme(next);
    });
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    updateThemeProfileImages(isDark);

    if (!themeToggle) {
        return;
    }

    themeToggle.classList.toggle('torch-on', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Turn torch off' : 'Turn torch on');

    if (torchIcon) {
        torchIcon.classList.toggle('fa-fire-flame-curved', !isDark);
        torchIcon.classList.toggle('fa-fire', isDark);
    }
}

function updateThemeProfileImages(isDark) {
    themeProfileImages.forEach((img) => {
        const nextSrc = isDark ? img.dataset.darkSrc : img.dataset.lightSrc;
        if (nextSrc && img.getAttribute('src') !== nextSrc) {
            img.setAttribute('src', nextSrc);
        }
    });
}


const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const contactForm = document.getElementById('contactForm');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section');
const navLinksItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinksItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Projects Filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');

            if (filter === 'all' || filter === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Add fadeIn animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize Real GitHub Calendar
// This targets your .calendar-grid div and pulls data for 'irahulbhankhad'
// Initialize Real GitHub Calendar without extra stats
const githubSection = document.querySelector('#github[data-github-username]');
const githubUsername = githubSection?.dataset.githubUsername || 'irahulbhankhad';

if (typeof GitHubCalendar === 'function') {
    GitHubCalendar(".calendar-grid", githubUsername, {
        responsive: true,
        tooltips: true,
        global_stats: false // This removes the "Longest streak", "Total contributions", etc.
    });
}

// GitHub stats cards: auto-connect these values from your GitHub profile
loadGitHubStatsCards(githubUsername);

async function loadGitHubStatsCards(username) {
    const reposNode = document.getElementById('githubRepos');
    const contributionsNode = document.getElementById('githubContributions');
    const starsNode = document.getElementById('githubStars');
    const linesNode = document.getElementById('githubLines');

    if (!reposNode || !contributionsNode || !starsNode || !linesNode) {
        return;
    }

    try {
        const [profile, repos, events] = await Promise.all([
            fetchGitHubUser(username),
            fetchGitHubRepos(username),
            fetchRecentGitHubEvents(username)
        ]);

        const repoCount = profile.public_repos ?? repos.length;
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const estimatedLines = estimateLinesFromRepoSize(repos);
        const recentContributions = countRecentContributions(events);

        reposNode.textContent = formatCompact(repoCount);
        contributionsNode.textContent = formatCompact(recentContributions);
        starsNode.textContent = formatCompact(totalStars);
        linesNode.textContent = formatCompact(estimatedLines);
        linesNode.title = 'Estimated from public repository size';
    } catch (error) {
        console.warn('Failed to load GitHub stats cards:', error);
    }
}

async function fetchGitHubUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('Could not fetch GitHub user profile');
    return response.json();
}

async function fetchGitHubRepos(username) {
    const repos = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`);
        if (!response.ok) throw new Error('Could not fetch GitHub repositories');

        const batch = await response.json();
        repos.push(...batch);

        if (batch.length < perPage) break;
        page += 1;
    }

    return repos;
}

async function fetchRecentGitHubEvents(username) {
    const pages = [1, 2, 3];
    const requests = pages.map(page => fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`));
    const responses = await Promise.all(requests);

    const allEvents = [];
    for (const response of responses) {
        if (!response.ok) continue;
        const batch = await response.json();
        allEvents.push(...batch);
    }

    return allEvents;
}

function countRecentContributions(events) {
    const contributionEvents = new Set([
        'PullRequestEvent',
        'IssuesEvent',
        'IssueCommentEvent',
        'PullRequestReviewEvent',
        'PullRequestReviewCommentEvent',
        'CreateEvent'
    ]);

    return events.reduce((sum, event) => {
        if (event.type === 'PushEvent') {
            return sum + (event.payload?.commits?.length || 0);
        }

        return sum + (contributionEvents.has(event.type) ? 1 : 0);
    }, 0);
}

function estimateLinesFromRepoSize(repos) {
    // GitHub repo.size is in KB. Convert to a rough line-count estimate.
    const totalKb = repos.reduce((sum, repo) => sum + (repo.size || 0), 0);
    const bytesPerLineEstimate = 35;
    return Math.round((totalKb * 1024) / bytesPerLineEstimate);
}

function formatCompact(value) {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(Math.max(0, value));
}

// Animate progress bars on scroll
const progressBars = document.querySelectorAll('.progress');
const skillSection = document.querySelector('#skills');

const animateProgressBars = () => {
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target === skillSection) {
                animateProgressBars();
            }
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Contact Form Handling
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Simple validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Notification System
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideIn 0.3s ease forwards;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;

    // Add animation keyframes
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(notificationStyle);

    // Add to DOM
    document.body.appendChild(notification);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Counter Animation for Stats
const stats = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const animateStats = () => {
    if (statsAnimated) return;

    stats.forEach(stat => {
        const target = stat.textContent;
        const numericValue = parseInt(target);

        if (!isNaN(numericValue)) {
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + (target.includes('+') ? '+' : '');
                }
            }, 30);
        }
    });

    statsAnimated = true;
};

// Trigger stats animation when about section is visible
const aboutSection = document.querySelector('#about');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
        }
    });
}, { threshold: 0.5 });

statsObserver.observe(aboutSection);

// Typing Effect for Hero Section
const tagline = document.querySelector('.tagline');
const originalText = tagline.textContent;
tagline.textContent = '';

let charIndex = 0;
const typeWriter = () => {
    if (charIndex < originalText.length) {
        tagline.textContent += originalText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 50);
    }
};

// Start typing effect after a delay
setTimeout(typeWriter, 1000);

// Floating Cards Parallax Effect
const floatingCards = document.querySelectorAll('.floating-card');

window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    floatingCards.forEach((card, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;

        card.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});

// Reset floating cards position when mouse leaves
document.addEventListener('mouseleave', () => {
    floatingCards.forEach(card => {
        card.style.transform = 'translate(0, 0)';
    });
});

// Lazy Loading for Images
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('loaded');
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Add loaded class styles
const lazyLoadStyle = document.createElement('style');
lazyLoadStyle.textContent = `
    img {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    img.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(lazyLoadStyle);

// Scroll to top button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.classList.add('scroll-to-top');
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 5px 20px rgba(37, 99, 235, 0.4);
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.visibility = 'visible';
    } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.visibility = 'hidden';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Console log for developers
console.log('%c Data Analytics Portfolio ', 'background: #2563eb; color: white; padding: 10px; font-size: 20px; border-radius: 5px;');
console.log('%c Created with ❤️ by Rahul Bhankhad ', 'background: #1e293b; color: white; padding: 10px; font-size: 14px; border-radius: 5px;');
