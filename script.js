document.addEventListener('DOMContentLoaded', () => {
    // --- GitHub Project Fetching ---
    const projectsContainer = document.getElementById('projects-container');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const reposToFetch = [
        'Sumukhms/edugram', 
        'Sumukhms/newsmonkey', 
        'Sumukhms/weather', 
        'Sumukhms/Color-Detection-OpenCV'
    ];

    const fetchRepoData = async (repoName) => {
        const response = await fetch(`https://api.github.com/repos/${repoName}`);
        if (!response.ok) throw new Error(`Failed to fetch ${repoName}`);
        return response.json();
    };

    const fetchAllProjects = async () => {
        try {
            const results = await Promise.allSettled(reposToFetch.map(repo => fetchRepoData(repo)));
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    setTimeout(() => {
                        projectsContainer.appendChild(createProjectCard(result.value));
                        initializeObserver();
                    }, index * 100); // Staggered animation
                } else {
                    console.error('A repository failed to load:', result.reason);
                }
            });
            
            if (results.every(r => r.status === 'rejected')) {
                throw new Error('Failed to load any projects');
            }
        } catch (error) {
            errorMessage.textContent = '⚠️ Could not load projects from GitHub. Please try again later.';
            errorMessage.classList.remove('hidden');
            console.error('Error fetching projects:', error);
        } finally {
            loader.style.display = 'none';
        }
    };

    const createProjectCard = (repo) => {
        const card = document.createElement('div');
        card.className = 'project-card glass rounded-2xl overflow-hidden flex flex-col shadow-xl reveal';
        
        const techStack = repo.language ? `
            <div class="flex items-center gap-2 mt-3">
                <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">${repo.language}</span>
                ${repo.stargazers_count > 0 ? `<span class="text-yellow-500 text-sm">⭐ ${repo.stargazers_count}</span>` : ''}
            </div>
        ` : '';
        
        const demoButton = repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" 
               class="glass text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-white transition-all">
                Live Demo →
            </a>
        ` : '';
        
        card.innerHTML = `
            <div class="p-6 flex-grow">
                <h3 class="text-2xl font-bold gradient-text mb-3">${repo.name}</h3>
                <p class="text-gray-600 leading-relaxed">${repo.description || "A project built with passion and dedication."}</p>
                ${techStack}
            </div>
            <div class="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 flex flex-wrap gap-3 justify-center">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" 
                   class="btn-primary text-white px-6 py-3 rounded-full font-semibold">
                    <span>View Code</span>
                </a>
                ${demoButton}
            </div>
        `;
        
        return card;
    };
    
    // --- Scroll Animation Observer ---
    const initializeObserver = () => {
        const revealElements = document.querySelectorAll('.reveal:not(.visible)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => observer.observe(el));
    };
    
    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide header on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const icon = mobileMenuBtn.querySelector('svg');
        if (mobileMenu.classList.contains('active')) {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        } else {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        }
    });
    
    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('svg');
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        });
    });
    
    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // --- Parallax Effect for Hero Section ---
    const hero = document.getElementById('hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (hero && scrolled < hero.offsetHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // --- Initialize ---
    fetchAllProjects();
    initializeObserver();
    
    // Add active state to navigation based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('text-orange-500');
            link.classList.add('text-gray-700');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.remove('text-gray-700');
                link.classList.add('text-orange-500');
            }
        });
    });
});