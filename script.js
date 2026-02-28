// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const torchIcon = themeToggle ? themeToggle.querySelector('i') : null;
const themeProfileImages = document.querySelectorAll('img[data-light-src][data-dark-src]');
let githubActivityChart = null;
let githubActivitySeries = null;
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
    updateGitHubActivityChartTheme(isDark);

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

const orbitSymbols = Array.from(document.querySelectorAll('.profile-image-container .orbit-symbol'));
const reduceMotionPref = window.matchMedia('(prefers-reduced-motion: reduce)');

if (orbitSymbols.length && !reduceMotionPref.matches) {
    initRandomOrbitAnimation(orbitSymbols);
}

function initRandomOrbitAnimation(symbols) {
    const configs = symbols.map((symbol, index) => {
        const innerPass = index % 3 === 0;
        const baseRadius = innerPass ? (70 + Math.random() * 60) : (125 + Math.random() * 105);
        const phase = Math.random() * Math.PI * 2;

        return {
            symbol,
            baseRadius,
            phase,
            speed: (index % 2 === 0 ? 1 : -1) * (0.34 + Math.random() * 0.5),
            wobbleA: 10 + Math.random() * 24,
            wobbleB: 8 + Math.random() * 20,
            wobbleSpeedA: 0.55 + Math.random() * 0.55,
            wobbleSpeedB: 0.45 + Math.random() * 0.6,
            driftX: 8 + Math.random() * 18,
            driftY: 8 + Math.random() * 18,
            depthShift: Math.random() * Math.PI * 2,
            tilt: 0.52 + Math.random() * 0.36,
            glyphSpin: (Math.random() - 0.5) * 26
        };
    });

    const start = performance.now();

    const animate = (now) => {
        const t = (now - start) / 1000;

        configs.forEach((config) => {
            const theta = config.phase + t * config.speed;
            const radiusNoise = Math.sin(t * config.wobbleSpeedA + config.phase) * config.wobbleA +
                Math.cos(t * config.wobbleSpeedB + config.depthShift) * config.wobbleB;
            const radius = config.baseRadius + radiusNoise;

            const x = Math.cos(theta) * radius + Math.sin(t * 0.95 + config.phase) * config.driftX;
            const y = Math.sin(theta * config.tilt) * radius * 0.72 + Math.cos(t * 0.82 + config.depthShift) * config.driftY;
            const depth = Math.sin(theta + config.depthShift);
            const isFront = depth > 0;
            const scale = isFront ? 1.18 : 0.9;
            const rotate = config.glyphSpin * depth;

            config.symbol.style.setProperty('--tx', `${x}px`);
            config.symbol.style.setProperty('--ty', `${y}px`);
            config.symbol.style.zIndex = isFront ? '3' : '1';
            config.symbol.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
            config.symbol.classList.toggle('is-front', isFront);
            config.symbol.classList.toggle('is-back', !isFront);
        });

        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
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
const githubSection = document.querySelector('#github[data-github-username], #github.github-section');
const githubUsername = resolveGitHubUsername();

function resolveGitHubUsername() {
    const attrUsername = githubSection?.dataset.githubUsername?.trim();
    if (attrUsername) {
        return attrUsername;
    }

    const githubProfileLink = document.querySelector('a[href^="https://github.com/"], a[href^="http://github.com/"]');
    if (githubProfileLink) {
        try {
            const url = new URL(githubProfileLink.href);
            const candidate = url.pathname.split('/').filter(Boolean)[0];
            if (candidate) {
                return candidate;
            }
        } catch (error) {
            console.warn('Failed to parse GitHub username from profile link:', error);
        }
    }

    return 'irahulbhankhad';
}

if (typeof GitHubCalendar === 'function') {
    GitHubCalendar(".calendar-grid", githubUsername, {
        responsive: true,
        tooltips: true,
        global_stats: false // This removes the "Longest streak", "Total contributions", etc.
    });
    cleanGitHubCalendarNoise();
}

loadTopRepositories(githubUsername);

// GitHub stats cards: auto-connect these values from your GitHub profile
loadGitHubStatsCards(githubUsername);

window.addEventListener('load', () => {
    refreshContributionCountFromCalendar();
    refreshGitHubActivityChartFromCalendar();
});

async function loadGitHubStatsCards(username) {
    const reposNode = document.getElementById('githubRepos');
    const contributionsNode = document.getElementById('githubContributions');
    const starsNode = document.getElementById('githubStars');
    const linesNode = document.getElementById('githubLines');

    if (!reposNode || !contributionsNode || !starsNode || !linesNode) {
        return;
    }

    const [profileResult, reposResult, eventsResult] = await Promise.allSettled([
        fetchGitHubUser(username),
        fetchGitHubRepos(username),
        fetchRecentGitHubEvents(username)
    ]);

    const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
    const repos = reposResult.status === 'fulfilled' ? reposResult.value : [];
    const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];

    const hasProfile = profileResult.status === 'fulfilled' && !!profile;
    const hasRepos = reposResult.status === 'fulfilled' && Array.isArray(repos);
    const hasEvents = eventsResult.status === 'fulfilled' && Array.isArray(events);

    if (profileResult.status === 'rejected') {
        console.warn('Failed to load GitHub user profile:', profileResult.reason);
    }

    if (reposResult.status === 'rejected') {
        console.warn('Failed to load GitHub repositories:', reposResult.reason);
    }

    if (eventsResult.status === 'rejected') {
        console.warn('Failed to load GitHub events:', eventsResult.reason);
    }

    if (hasProfile || hasRepos) {
        const repoCount = profile?.public_repos ?? repos.length;
        reposNode.textContent = formatCompact(repoCount);
    }

    if (hasRepos) {
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const estimatedLines = estimateLinesFromRepoSize(repos);
        starsNode.textContent = formatCompact(totalStars);
        linesNode.textContent = formatCompact(estimatedLines);
        linesNode.title = 'Estimated from public repository size';
    }

    if (hasEvents) {
        contributionsNode.textContent = formatCompact(countRecentContributions(events));
    }

    // Always render chart so the panel is never blank.
    renderGitHubActivityChart(hasEvents ? events : []);
    refreshContributionCountFromCalendar();
    refreshGitHubActivityChartFromCalendar();
}

async function loadTopRepositories(username) {
    const cached = getCachedTopRepos(username);
    if (cached?.length) {
        renderTopRepositories(cached);
    }

    try {
        const repos = await fetchTopGitHubRepos(username);
        if (repos.length) {
            renderTopRepositories(repos);
            cacheTopRepos(username, repos);
            return;
        }
    } catch (error) {
        console.warn('Failed to load top repos from search API:', error);
    }

    try {
        const repos = await fetchGitHubRepos(username);
        if (repos.length) {
            renderTopRepositories(repos);
            cacheTopRepos(username, repos);
            return;
        }
    } catch (error) {
        console.warn('Failed to load top repos from repos API:', error);
    }

    if (!cached?.length) {
        renderTopRepositoriesUnavailable(username);
    }
}

async function fetchTopGitHubRepos(username) {
    const query = encodeURIComponent(`user:${username} fork:false`);
    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=6`);
    if (!response.ok) {
        throw new Error(`Could not fetch top repositories (status ${response.status})`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    return items.slice(0, 3);
}

function getTopReposCacheKey(username) {
    return `portfolio-top-repos-${username}`;
}

function getCachedTopRepos(username) {
    try {
        const raw = localStorage.getItem(getTopReposCacheKey(username));
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        const fetchedAt = Number(parsed?.fetchedAt || 0);
        const repos = Array.isArray(parsed?.repos) ? parsed.repos : [];
        const maxAge = 1000 * 60 * 60 * 6; // 6 hours
        if (!repos.length || Date.now() - fetchedAt > maxAge) {
            return null;
        }

        return repos;
    } catch (error) {
        console.warn('Failed to read top repos cache:', error);
        return null;
    }
}

function cacheTopRepos(username, repos) {
    try {
        localStorage.setItem(getTopReposCacheKey(username), JSON.stringify({
            fetchedAt: Date.now(),
            repos
        }));
    } catch (error) {
        console.warn('Failed to cache top repos:', error);
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

function renderTopRepositories(repos) {
    const repoGrid = document.getElementById('topReposGrid');
    if (!repoGrid) {
        return;
    }

    const candidates = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => {
            if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            if ((b.forks_count || 0) !== (a.forks_count || 0)) {
                return (b.forks_count || 0) - (a.forks_count || 0);
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        })
        .slice(0, 3);

    if (!candidates.length) {
        repoGrid.innerHTML = `
            <div class="repo-card reveal-item is-visible">
                <h4><i class="fas fa-book"></i> No public repositories found</h4>
                <p>Unable to load repositories right now. Please try again later.</p>
            </div>
        `;
        return;
    }

    repoGrid.innerHTML = candidates.map((repo, index) => {
        const language = repo.language || 'Other';
        const description = repo.description || 'No description provided.';
        const languageColor = getLanguageColor(language);

        return `
            <article class="repo-card reveal-item reveal-delay-${index % 4} is-visible">
                <h4>
                    <i class="fas fa-book"></i>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-title-link">${escapeHtml(repo.name)}</a>
                </h4>
                <p>${escapeHtml(description)}</p>
                <div class="repo-stats">
                    <span><i class="fas fa-star"></i> ${formatCompact(repo.stargazers_count || 0)}</span>
                    <span><i class="fas fa-code-branch"></i> ${formatCompact(repo.forks_count || 0)}</span>
                    <span class="language-dot" style="background:${languageColor};"></span> ${escapeHtml(language)}
                </div>
            </article>
        `;
    }).join('');
}

function renderTopRepositoriesUnavailable(username) {
    const repoGrid = document.getElementById('topReposGrid');
    if (!repoGrid) {
        return;
    }

    repoGrid.innerHTML = `
        <div class="repo-card reveal-item is-visible">
            <h4><i class="fas fa-book"></i> Repositories unavailable right now</h4>
            <p>GitHub API is temporarily unavailable. Please refresh in a moment or view directly on
            <a href="https://github.com/${escapeHtml(username)}?tab=repositories" target="_blank" rel="noopener noreferrer" class="repo-title-link">GitHub</a>.</p>
        </div>
    `;
}

function getLanguageColor(language) {
    const palette = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        SQL: '#e34c26',
        Java: '#b07219',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Jupyter: '#DA5B0B'
    };

    if (palette[language]) {
        return palette[language];
    }

    // Stable fallback color for unknown languages
    let hash = 0;
    for (let i = 0; i < language.length; i += 1) {
        hash = language.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 52%)`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function cleanGitHubCalendarNoise() {
    const calendar = document.querySelector('.calendar-grid');
    if (!calendar) {
        return;
    }

    const blockedLines = new Set([
        'skip to contributions year list',
        'learn how we count contributions'
    ]);

    const pruneNoise = () => {
        calendar.querySelectorAll('a, p, span, div, h2, h3, small').forEach((element) => {
            const text = element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
            if (!text) {
                return;
            }

            if (blockedLines.has(text) && element.children.length === 0) {
                element.remove();
            }
        });

        calendar.querySelectorAll('.contrib-column, .contrib-footer').forEach((node) => node.remove());
        refreshContributionCountFromCalendar();
        refreshGitHubActivityChartFromCalendar();
    };

    pruneNoise();
    const observer = new MutationObserver(pruneNoise);
    observer.observe(calendar, { childList: true, subtree: true });

    // Stop observing after content settles to avoid unnecessary work.
    setTimeout(() => {
        pruneNoise();
        observer.disconnect();
    }, 12000);
}

function refreshContributionCountFromCalendar() {
    const contributionsNode = document.getElementById('githubContributions');
    if (!contributionsNode) {
        return;
    }

    const totalContributions = getContributionTotalFromCalendar(365);
    if (totalContributions > 0) {
        contributionsNode.textContent = formatCompact(totalContributions);
    }
}

function getContributionTotalFromCalendar(days) {
    const series = buildDailyContributionSeriesFromCalendar(days);
    if (!series) {
        return 0;
    }

    return series.values.reduce((sum, value) => sum + Number(value || 0), 0);
}

function renderGitHubActivityChart(events, forcedSeries = null) {
    const chartNode = document.getElementById('githubActivityChart');
    if (!chartNode) {
        return;
    }

    const rawSeries = forcedSeries || selectGitHubActivitySeries(events);
    const series = buildPowerBIStyleSeries(rawSeries);
    githubActivitySeries = series;
    const palette = getGitHubChartPalette(document.body.classList.contains('dark-theme'));
    const maxTrendValue = Math.max(0, ...series.values);
    const suggestedMax = maxTrendValue > 0 ? Number((maxTrendValue * 1.2).toFixed(2)) : 1;

    if (typeof Chart === 'undefined') {
        drawFallbackActivityChart(chartNode, series, palette);
        return;
    }

    if (githubActivityChart) {
        githubActivityChart.destroy();
    }

    try {
        githubActivityChart = new Chart(chartNode, {
            type: 'line',
            data: {
                labels: series.labels,
                datasets: [{
                    label: '7-day Activity Trend',
                    data: series.values,
                    borderColor: palette.line,
                    borderWidth: 3,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round',
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: palette.point,
                    pointBorderColor: palette.line,
                    fill: false,
                    tension: 0.45,
                    cubicInterpolationMode: 'monotone'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: palette.tooltipBg,
                        titleColor: palette.tooltipText,
                        bodyColor: palette.tooltipText,
                        callbacks: {
                            title: (items) => {
                                const index = items?.[0]?.dataIndex ?? 0;
                                return series.fullLabels[index] || '';
                            },
                            label: (context) => {
                                const index = context?.dataIndex ?? 0;
                                const rawValue = Number(series.rawValues?.[index] || 0);
                                const trendValue = Number(context.raw || 0);
                                return `Trend: ${trendValue.toFixed(2)} | Activity: ${rawValue}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: palette.ticks,
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            callback: (value, index) => (index % 14 === 0 ? series.shortLabels[index] : '')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax,
                        grid: {
                            color: palette.grid
                        },
                        ticks: {
                            color: palette.ticks,
                            precision: 2,
                            callback: (value) => Number(value).toString(),
                            maxTicksLimit: 5
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Chart.js rendering failed. Using fallback chart.', error);
        githubActivityChart = null;
        drawFallbackActivityChart(chartNode, series, palette);
    }
}

function drawFallbackActivityChart(canvas, series, palette) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const wrap = canvas.parentElement;
    const width = Math.max(280, Math.floor(wrap?.clientWidth || canvas.clientWidth || 420));
    const height = Math.max(180, Math.floor(wrap?.clientHeight || canvas.clientHeight || 235));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const margin = { top: 16, right: 10, bottom: 26, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const values = series?.values?.length ? series.values : [0];
    const maxValue = Math.max(1, ...values);
    const xStep = values.length > 1 ? chartWidth / (values.length - 1) : chartWidth;

    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i += 1) {
        const y = margin.top + (chartHeight * i) / gridLines;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
    }

    const points = values.map((value, index) => {
        const x = margin.left + (xStep * index);
        const y = margin.top + chartHeight - (Math.max(0, value) / maxValue) * chartHeight;
        return { x, y };
    });

    if (points.length) {
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.fillStyle = palette.ticks;
    ctx.font = '12px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', margin.left - 8, margin.top + chartHeight);
    ctx.fillText(maxValue >= 1 ? String(Number(maxValue.toFixed(1))) : String(Number(maxValue.toFixed(2))), margin.left - 8, margin.top);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labels = series?.shortLabels || [];
    for (let i = 0; i < labels.length; i += 14) {
        const x = margin.left + (xStep * i);
        ctx.fillText(labels[i], x, margin.top + chartHeight + 6);
    }
}

function buildPowerBIStyleSeries(baseSeries) {
    if (!baseSeries || !Array.isArray(baseSeries.values) || baseSeries.values.length === 0) {
        return {
            labels: [],
            shortLabels: [],
            fullLabels: [],
            values: [],
            rawValues: []
        };
    }

    const windowSize = 7;
    const smoothed = baseSeries.values.map((_, index) => {
        const start = Math.max(0, index - windowSize + 1);
        let sum = 0;
        let count = 0;

        for (let i = start; i <= index; i += 1) {
            sum += Number(baseSeries.values[i] || 0);
            count += 1;
        }

        return count > 0 ? Number((sum / count).toFixed(2)) : 0;
    });

    return {
        ...baseSeries,
        values: smoothed,
        rawValues: [...baseSeries.values]
    };
}

function selectGitHubActivitySeries(events) {
    const eventSeries = buildDailyContributionSeries(events, 90);
    if (eventSeries.values.some((value) => value > 0)) {
        return eventSeries;
    }

    const calendarSeries = buildDailyContributionSeriesFromCalendar(90);
    return calendarSeries || eventSeries;
}

function buildDailyContributionSeries(events, days) {
    const contributionsByDay = new Map();

    events.forEach((event) => {
        const dateKey = event.created_at?.slice(0, 10);
        if (!dateKey) {
            return;
        }

        const current = contributionsByDay.get(dateKey) || 0;
        contributionsByDay.set(dateKey, current + getEventActivityWeight(event));
    });

    const labels = [];
    const shortLabels = [];
    const fullLabels = [];
    const values = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);

        const key = day.toISOString().slice(0, 10);
        const shortLabel = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const fullLabel = day.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        labels.push(key);
        shortLabels.push(shortLabel);
        fullLabels.push(fullLabel);
        values.push(contributionsByDay.get(key) || 0);
    }

    return { labels, shortLabels, fullLabels, values };
}

function buildDailyContributionSeriesFromCalendar(days) {
    const calendar = document.querySelector('.calendar-grid');
    if (!calendar) {
        return null;
    }

    const cells = Array.from(
        calendar.querySelectorAll('[data-date][data-count], rect.day[data-date], .day[data-date]')
    );

    if (!cells.length) {
        return null;
    }

    const contributionsByDay = new Map();
    cells.forEach((cell) => {
        const date = cell.getAttribute('data-date');
        if (!date) {
            return;
        }

        const rawCount = cell.getAttribute('data-count') ?? cell.dataset.count;
        const explicitCount = Number(rawCount);
        const level = Number(cell.getAttribute('data-level') ?? cell.dataset.level ?? 0);
        const count = Number.isFinite(explicitCount) ? explicitCount : (Number.isFinite(level) ? level : 0);

        contributionsByDay.set(date, Math.max(0, count));
    });

    if (!contributionsByDay.size) {
        return null;
    }

    const labels = [];
    const shortLabels = [];
    const fullLabels = [];
    const values = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);

        const key = day.toISOString().slice(0, 10);
        labels.push(key);
        shortLabels.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        fullLabels.push(day.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
        values.push(contributionsByDay.get(key) || 0);
    }

    return { labels, shortLabels, fullLabels, values };
}

function refreshGitHubActivityChartFromCalendar() {
    const calendarSeries = buildDailyContributionSeriesFromCalendar(90);
    if (!calendarSeries || !calendarSeries.values.some((value) => value > 0)) {
        return;
    }

    if (isSameSeriesAsCurrentChart(calendarSeries)) {
        return;
    }

    renderGitHubActivityChart([], calendarSeries);
}

function isSameSeriesAsCurrentChart(series) {
    if (!githubActivityChart) {
        return false;
    }

    const chartLabels = githubActivityChart.data?.labels || [];
    const chartValues = githubActivityChart.data?.datasets?.[0]?.data || [];

    if (chartLabels.length !== series.labels.length || chartValues.length !== series.values.length) {
        return false;
    }

    for (let i = 0; i < chartLabels.length; i += 1) {
        if (chartLabels[i] !== series.labels[i] || Number(chartValues[i]) !== Number(series.values[i])) {
            return false;
        }
    }

    return true;
}

function getEventActivityWeight(event) {
    const type = event?.type;

    if (type === 'PushEvent') {
        return event.payload?.commits?.length || 0;
    }

    const weightedTypes = new Set([
        'PullRequestEvent',
        'IssuesEvent',
        'IssueCommentEvent',
        'PullRequestReviewEvent',
        'PullRequestReviewCommentEvent',
        'CreateEvent',
        'ReleaseEvent'
    ]);

    return weightedTypes.has(type) ? 1 : 0;
}

function getGitHubChartPalette(isDark) {
    if (isDark) {
        return {
            line: '#fbbf24',
            fill: 'rgba(251, 191, 36, 0.2)',
            point: '#fde68a',
            grid: 'rgba(148, 163, 184, 0.22)',
            ticks: '#cbd5e1',
            tooltipBg: '#081126',
            tooltipText: '#f8fafc'
        };
    }

    return {
        line: '#2563eb',
        fill: 'rgba(37, 99, 235, 0.18)',
        point: '#1d4ed8',
        grid: 'rgba(100, 116, 139, 0.2)',
        ticks: '#475569',
        tooltipBg: '#0f172a',
        tooltipText: '#f8fafc'
    };
}

function updateGitHubActivityChartTheme(isDark) {
    if (!githubActivityChart) {
        const chartNode = document.getElementById('githubActivityChart');
        if (chartNode && githubActivitySeries) {
            drawFallbackActivityChart(chartNode, githubActivitySeries, getGitHubChartPalette(isDark));
        }
        return;
    }

    const palette = getGitHubChartPalette(isDark);
    const dataset = githubActivityChart.data.datasets[0];

    dataset.borderColor = palette.line;
    dataset.backgroundColor = palette.fill;
    dataset.pointBackgroundColor = palette.point;
    dataset.pointBorderColor = palette.line;

    githubActivityChart.options.plugins.tooltip.backgroundColor = palette.tooltipBg;
    githubActivityChart.options.plugins.tooltip.titleColor = palette.tooltipText;
    githubActivityChart.options.plugins.tooltip.bodyColor = palette.tooltipText;

    githubActivityChart.options.scales.x.ticks.color = palette.ticks;
    githubActivityChart.options.scales.y.ticks.color = palette.ticks;
    githubActivityChart.options.scales.y.grid.color = palette.grid;
    githubActivityChart.update('none');
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

// Premium staggered reveal for major UI blocks
const revealTargets = document.querySelectorAll(
    '.about .stat, .skill-category, .tool-item, .project-card, .github-card, .repo-card, .certificate-card, .contact-item, .contact-form'
);

if (revealTargets.length) {
    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-item', `reveal-delay-${index % 4}`);
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
}

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
floatingCards.forEach((card, index) => {
    card.style.setProperty('--mx', '0px');
    card.style.setProperty('--my', '0px');
    card.style.animationDelay = `${index * 0.35}s`;
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
