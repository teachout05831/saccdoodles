/* ============================================
   Premium Doodles - Main JavaScript
   Frontend functionality and rendering
   ============================================ */

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadSiteContent();
    initPage();
});

// Load dynamic site content
function loadSiteContent() {
    const content = DB.siteContent.get();

    // Update business info throughout the site
    const business = content.business || {};

    // Update phone numbers
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        if (business.phone) {
            link.href = `tel:+1${business.phone.replace(/\D/g, '')}`;
            // Update text if it contains a phone number pattern
            if (link.textContent.match(/\d{3}.*\d{3}.*\d{4}/)) {
                link.textContent = link.textContent.replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, business.phone);
            }
        }
    });

    // Update social media links
    document.querySelectorAll('.social-links a[aria-label="Instagram"]').forEach(link => {
        if (business.instagram) link.href = business.instagram;
    });
    document.querySelectorAll('.social-links a[aria-label="TikTok"]').forEach(link => {
        if (business.tiktok) link.href = business.tiktok;
    });
    document.querySelectorAll('.social-links a[aria-label="Facebook"]').forEach(link => {
        if (business.facebook) link.href = business.facebook;
    });

    // Update footer content
    const footer = content.footer || {};
    const footerBrand = document.querySelector('.footer-brand p');
    if (footerBrand && footer.tagline) {
        footerBrand.textContent = footer.tagline;
    }
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright && footer.copyright) {
        footerCopyright.textContent = footer.copyright;
    }

    // Update footer contact info
    const footerContact = document.querySelector('.footer-contact');
    if (footerContact) {
        const phoneP = footerContact.querySelector('p:first-of-type');
        const emailP = footerContact.querySelector('p:last-of-type');
        if (phoneP && business.phone) {
            const svg = phoneP.querySelector('svg');
            phoneP.innerHTML = '';
            if (svg) phoneP.appendChild(svg);
            phoneP.appendChild(document.createTextNode(' ' + business.phone));
        }
        if (emailP && business.email) {
            const svg = emailP.querySelector('svg');
            emailP.innerHTML = '';
            if (svg) emailP.appendChild(svg);
            emailP.appendChild(document.createTextNode(' ' + business.email));
        }
    }
}

// Initialize navigation
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && !e.target.closest('.nav-container')) {
            navLinks.classList.remove('active');
            mobileMenuBtn?.classList.remove('active');
        }
    });

    // Update active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize page-specific content
function initPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    switch (page) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'our-dogs.html':
            loadDogsPage();
            break;
        case 'available-puppies.html':
            loadPuppiesPage();
            break;
        case 'about.html':
            loadAboutPage();
            break;
        case 'guardian-home.html':
            loadGuardianPage();
            break;
        case 'contact.html':
            loadContactPage();
            initContactForm();
            break;
    }
}

// Load about page content
function loadAboutPage() {
    const content = DB.siteContent.get();
    const about = content.about || {};
    const saccMeaning = content.saccMeaning || {};
    const values = content.values || {};

    // Get all sections
    const sections = document.querySelectorAll('.section');

    // First section - Meet the breeder
    if (sections[0]) {
        const bioSection = sections[0];
        const title = bioSection.querySelector('.section-title');
        if (title && about.breederName) {
            title.innerHTML = `<span class="script-font">Meet</span>\n                        ${escapeHtml(about.breederName)}`;
        }

        // Update breeder photo placeholder
        const photoPlaceholder = bioSection.querySelector('.about-image .image-placeholder');
        if (photoPlaceholder && about.breederPhoto) {
            photoPlaceholder.parentElement.innerHTML = `<img src="${about.breederPhoto}" alt="${escapeHtml(about.breederName)}" style="width: 100%; border-radius: var(--radius-lg);">`;
        }

        // Update bio paragraphs
        const aboutContent = bioSection.querySelector('.about-content');
        if (aboutContent) {
            const paragraphs = aboutContent.querySelectorAll('p');
            if (paragraphs[0] && about.fullBio) paragraphs[0].textContent = about.fullBio;
            if (paragraphs[1] && about.fullBio2) paragraphs[1].textContent = about.fullBio2;
            if (paragraphs[2] && about.fullBio3) paragraphs[2].textContent = about.fullBio3;
        }
    }

    // Second section - Philosophy (has bg-secondary)
    if (sections[1]) {
        const philSection = sections[1];

        // Update philosophy photo placeholder
        const photoPlaceholder = philSection.querySelector('.about-image .image-placeholder');
        if (photoPlaceholder && about.philosophyPhoto) {
            photoPlaceholder.parentElement.innerHTML = `<img src="${about.philosophyPhoto}" alt="Our Philosophy" style="width: 100%; border-radius: var(--radius-lg);">`;
        }

        // Update philosophy paragraphs
        const aboutContent = philSection.querySelector('.about-content');
        if (aboutContent) {
            const paragraphs = aboutContent.querySelectorAll('p');
            if (paragraphs[0] && about.philosophy1) paragraphs[0].textContent = about.philosophy1;
            if (paragraphs[1] && about.philosophy2) paragraphs[1].textContent = about.philosophy2;
            if (paragraphs[2] && about.philosophy3) paragraphs[2].textContent = about.philosophy3;
        }
    }

    // Third section - SACC Meaning (dogs-section)
    const saccSection = document.querySelector('.dogs-section');
    if (saccSection) {
        const valueCards = saccSection.querySelectorAll('.value-card');
        const saccData = [saccMeaning.s, saccMeaning.a, saccMeaning.c1, saccMeaning.c2];
        valueCards.forEach((card, index) => {
            if (saccData[index]) {
                const wordEl = card.querySelector('h3');
                const descEl = card.querySelector('p');
                if (wordEl && saccData[index].word) wordEl.textContent = saccData[index].word;
                if (descEl && saccData[index].description) descEl.textContent = saccData[index].description;
            }
        });
    }

    // Fourth section - Our Values
    if (sections[3]) {
        const valuesSection = sections[3];
        const valueCards = valuesSection.querySelectorAll('.value-card');
        const valuesData = [values.value1, values.value2, values.value3];
        valueCards.forEach((card, index) => {
            if (valuesData[index]) {
                const titleEl = card.querySelector('h3');
                const descEl = card.querySelector('p');
                if (titleEl && valuesData[index].title) titleEl.textContent = valuesData[index].title;
                if (descEl && valuesData[index].description) descEl.textContent = valuesData[index].description;
            }
        });
    }
}

// Load guardian page content
function loadGuardianPage() {
    const content = DB.siteContent.get();
    const guardian = content.guardian || {};

    // Update hero section
    const heroTitle = document.querySelector('.guardian-hero .hero-title');
    if (heroTitle && guardian.pageTitle) {
        heroTitle.innerHTML = `<span class="script-font">Become a</span>\n                ${escapeHtml(guardian.pageTitle)}`;
    }

    const heroSubtitle = document.querySelector('.guardian-hero .hero-subtitle');
    if (heroSubtitle && guardian.pageSubtitle) {
        heroSubtitle.textContent = guardian.pageSubtitle;
    }

    // Update "What is a Guardian Home" section
    const whatIsSection = document.querySelector('#what-is');
    if (whatIsSection) {
        const sectionTitle = whatIsSection.querySelector('.section-title');
        if (sectionTitle && guardian.introTitle) {
            sectionTitle.innerHTML = `<span class="script-font">What is a</span>\n                        ${escapeHtml(guardian.introTitle.replace('What is a ', ''))}`;
        }

        // Update intro text (first paragraph)
        const aboutContent = whatIsSection.querySelector('.about-content');
        if (aboutContent && guardian.introText) {
            const firstP = aboutContent.querySelector('p');
            if (firstP) firstP.innerHTML = guardian.introText;
        }
    }

    // The benefits and requirements on this page are hard-coded as detailed cards
    // To make them fully editable, we would need to restructure the HTML
    // For now, the site settings are available for future use
}

// Load contact page content
function loadContactPage() {
    const content = DB.siteContent.get();
    const contact = content.contact || {};
    const business = content.business || {};

    // Update page title
    const pageTitle = document.querySelector('.page-header h1, .contact-hero .hero-title');
    if (pageTitle && contact.pageTitle) {
        if (pageTitle.querySelector('.script-font')) {
            pageTitle.innerHTML = `<span class="script-font">Get in</span>\n                ${escapeHtml(contact.pageTitle)}`;
        } else {
            pageTitle.textContent = contact.pageTitle;
        }
    }

    // Update page subtitle
    const pageSubtitle = document.querySelector('.page-header p, .contact-hero .hero-subtitle');
    if (pageSubtitle && contact.pageSubtitle) {
        pageSubtitle.textContent = contact.pageSubtitle;
    }

    // Update form intro
    const formIntro = document.querySelector('.contact-form-intro, .form-intro');
    if (formIntro && contact.formIntro) {
        formIntro.textContent = contact.formIntro;
    }

    // Update contact details
    const phoneLink = document.querySelector('.contact-info a[href^="tel:"]');
    if (phoneLink && business.phone) {
        phoneLink.href = `tel:+1${business.phone.replace(/\D/g, '')}`;
        phoneLink.textContent = business.phone;
    }

    const emailLink = document.querySelector('.contact-info a[href^="mailto:"]');
    if (emailLink && business.email) {
        emailLink.href = `mailto:${business.email}`;
        emailLink.textContent = business.email;
    }

    const locationText = document.querySelector('.contact-location, .contact-info .location');
    if (locationText && business.location) {
        locationText.textContent = business.location;
    }
}

// Load home page content
function loadHomePage() {
    const featuredDogsGrid = document.getElementById('featured-dogs');
    const availablePuppiesGrid = document.getElementById('available-puppies');
    const testimonialsGrid = document.getElementById('testimonials-grid');
    const testimonialsEmpty = document.getElementById('testimonials-empty');

    // Load dynamic site content
    const content = DB.siteContent.get();
    const homepage = content.homepage || {};
    const about = content.about || {};

    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && homepage.heroTitle) {
        // Preserve the script-font span structure
        const scriptSpan = heroTitle.querySelector('.script-font');
        heroTitle.innerHTML = '';
        if (scriptSpan) {
            heroTitle.appendChild(scriptSpan);
            heroTitle.appendChild(document.createTextNode('\n                ' + homepage.heroTitle));
        } else {
            heroTitle.innerHTML = `<span class="script-font">Welcome to</span>\n                ${escapeHtml(homepage.heroTitle)}`;
        }
    }
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && homepage.heroSubtitle) {
        heroSubtitle.textContent = homepage.heroSubtitle;
    }

    // Update hero background if set
    const hero = document.querySelector('.hero');
    if (hero && homepage.heroImage) {
        hero.style.backgroundImage = `url('${homepage.heroImage}')`;
    }

    // Update section titles - Dogs section
    const dogsSection = document.querySelector('.dogs-section');
    if (dogsSection) {
        const title = dogsSection.querySelector('.section-title');
        const subtitle = dogsSection.querySelector('.section-subtitle');
        if (title && homepage.dogsSection?.title) {
            title.innerHTML = `<span class="script-font">Meet</span>\n                ${escapeHtml(homepage.dogsSection.title)}`;
        }
        if (subtitle && homepage.dogsSection?.subtitle) {
            subtitle.textContent = homepage.dogsSection.subtitle;
        }
    }

    // Update section titles - Puppies section
    const puppiesSection = document.querySelector('.puppies-section');
    if (puppiesSection) {
        const title = puppiesSection.querySelector('.section-title');
        const subtitle = puppiesSection.querySelector('.section-subtitle');
        if (title && homepage.puppiesSection?.title) {
            title.innerHTML = `<span class="script-font">Available</span>\n                ${escapeHtml(homepage.puppiesSection.title)}`;
        }
        if (subtitle && homepage.puppiesSection?.subtitle) {
            subtitle.textContent = homepage.puppiesSection.subtitle;
        }
    }

    // Update section titles - Guardian section
    const guardianSection = document.querySelector('.guardian-cta-section');
    if (guardianSection) {
        const title = guardianSection.querySelector('.section-title');
        const subtitle = guardianSection.querySelector('.section-subtitle');
        if (title && homepage.guardianSection?.title) {
            title.innerHTML = `<span class="script-font">Become a</span>\n                ${escapeHtml(homepage.guardianSection.title)}`;
        }
        if (subtitle && homepage.guardianSection?.subtitle) {
            subtitle.textContent = homepage.guardianSection.subtitle;
        }
    }

    // Update section titles - Testimonials section
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection) {
        const title = testimonialsSection.querySelector('.section-title');
        const subtitle = testimonialsSection.querySelector('.section-subtitle');
        if (title && homepage.testimonialsSection?.title) {
            title.innerHTML = `<span class="script-font">What Our</span>\n                ${escapeHtml(homepage.testimonialsSection.title)}`;
        }
        if (subtitle && homepage.testimonialsSection?.subtitle) {
            subtitle.textContent = homepage.testimonialsSection.subtitle;
        }
    }

    // Update About section on homepage
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        const title = aboutSection.querySelector('.section-title');
        if (title && about.breederName) {
            title.innerHTML = `<span class="script-font">Meet</span>\n                        ${escapeHtml(about.breederName)}`;
        }

        // Update about image
        const aboutImage = aboutSection.querySelector('.about-image');
        if (aboutImage && about.breederPhoto) {
            aboutImage.innerHTML = `<img src="${about.breederPhoto}" alt="${escapeHtml(about.breederName)}" style="width: 100%; border-radius: var(--radius-lg);">`;
        }

        // Update about text
        const aboutContent = aboutSection.querySelector('.about-content');
        if (aboutContent) {
            const paragraphs = aboutContent.querySelectorAll('p');
            if (paragraphs[0] && about.shortBio) {
                paragraphs[0].textContent = about.shortBio;
            }
            if (paragraphs[1] && about.shortBio2) {
                paragraphs[1].textContent = about.shortBio2;
            }
        }
    }

    if (featuredDogsGrid) {
        const dogs = DB.dogs.getPublic().slice(0, 3);
        if (dogs.length > 0) {
            featuredDogsGrid.innerHTML = dogs.map(dog => createDogCard(dog)).join('');
        } else {
            featuredDogsGrid.innerHTML = createEmptyState('No dogs to display yet', 'paw');
        }
    }

    if (availablePuppiesGrid) {
        const puppies = DB.puppies.getPublic().filter(p => p.status === 'available').slice(0, 3);
        if (puppies.length > 0) {
            availablePuppiesGrid.innerHTML = puppies.map(puppy => createPuppyCard(puppy)).join('');
        } else {
            availablePuppiesGrid.innerHTML = createEmptyState('No puppies available right now', 'heart');
        }
    }

    if (testimonialsGrid) {
        const testimonials = DB.testimonials.getFeatured().slice(0, 3);
        if (testimonials.length > 0) {
            testimonialsGrid.innerHTML = testimonials.map(t => createTestimonialCard(t)).join('');
            if (testimonialsEmpty) testimonialsEmpty.style.display = 'none';
        } else {
            testimonialsGrid.innerHTML = '';
            if (testimonialsEmpty) testimonialsEmpty.style.display = 'block';
        }
    }
}

// Load dogs page
function loadDogsPage() {
    const dogsGrid = document.getElementById('dogs-grid');

    if (dogsGrid) {
        const dogs = DB.dogs.getPublic();
        if (dogs.length > 0) {
            dogsGrid.innerHTML = dogs.map(dog => createDetailedDogCard(dog)).join('');
        } else {
            dogsGrid.innerHTML = createEmptyState('No dogs to display yet', 'paw');
        }
    }
}

// Load puppies page
function loadPuppiesPage() {
    const puppiesGrid = document.getElementById('puppies-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (puppiesGrid) {
        renderPuppies('all');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPuppies(btn.dataset.filter);
            });
        });
    }
}

function renderPuppies(filter) {
    const puppiesGrid = document.getElementById('puppies-grid');
    let puppies = DB.puppies.getPublic();

    if (filter !== 'all') {
        puppies = puppies.filter(p => p.status === filter);
    }

    if (puppies.length > 0) {
        puppiesGrid.innerHTML = puppies.map(puppy => createPuppyCard(puppy)).join('');
    } else {
        puppiesGrid.innerHTML = createEmptyState('No puppies match this filter', 'search');
    }
}

// Create dog card HTML
function createDogCard(dog) {
    // Support both old single photo and new photos array
    const photos = dog.photos || (dog.photo ? [dog.photo] : []);
    const mainPhoto = photos[0];
    const imageHtml = mainPhoto
        ? `<img src="${mainPhoto}" alt="${dog.name}">`
        : createImagePlaceholder(dog.name);

    return `
        <div class="dog-card" data-id="${dog.id}">
            <div class="card-image">
                ${imageHtml}
                ${dog.isGuardian ? '<span class="guardian-badge">Guardian Home</span>' : ''}
            </div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(dog.name)}</h3>
                <p class="card-meta">${escapeHtml(dog.breed || 'Breed not specified')}</p>
                ${dog.description ? `<p class="card-description">${escapeHtml(truncate(dog.description, 100))}</p>` : ''}
            </div>
        </div>
    `;
}

// Create detailed dog card HTML
function createDetailedDogCard(dog) {
    // Support both old single photo and new photos array
    const photos = dog.photos || (dog.photo ? [dog.photo] : []);
    const hasPhotos = photos.length > 0;
    const dogId = dog.id;

    // Build photo gallery HTML
    let galleryHtml;
    if (hasPhotos) {
        galleryHtml = `
            <div class="dog-photo-gallery" data-dog-id="${dogId}">
                <div class="gallery-main-image">
                    <img src="${photos[0]}" alt="${dog.name}" id="dog-main-photo-${dogId}">
                    ${photos.length > 1 ? `
                        <button class="gallery-nav-btn prev" onclick="changeDogGalleryPhoto('${dogId}', -1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <button class="gallery-nav-btn next" onclick="changeDogGalleryPhoto('${dogId}', 1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                ${photos.length > 1 ? `
                    <div class="gallery-thumbs">
                        ${photos.map((photo, index) => `
                            <img src="${photo}" alt="Photo ${index + 1}"
                                 class="gallery-thumb-img ${index === 0 ? 'active' : ''}"
                                 onclick="setDogGalleryPhoto('${dogId}', ${index})"
                                 data-index="${index}">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        galleryHtml = `<div class="card-image">${createImagePlaceholder(dog.name)}</div>`;
    }

    const age = dog.birthday ? calculateAge(dog.birthday) : 'Unknown';

    // Build guardian family section if applicable
    let guardianHtml = '';
    if (dog.isGuardian && dog.guardianFamily) {
        const gf = dog.guardianFamily;
        guardianHtml = `
            <div class="guardian-family-section">
                <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Living with ${escapeHtml(gf.name || 'Guardian Family')}
                </h4>
                ${gf.location ? `<p class="guardian-location">${escapeHtml(gf.location)}</p>` : ''}
                ${gf.photo ? `<img src="${gf.photo}" alt="${escapeHtml(gf.name || 'Guardian Family')}" class="guardian-photo">` : ''}
                ${gf.notes ? `<p class="guardian-notes">${escapeHtml(gf.notes)}</p>` : ''}
            </div>
        `;
    }

    return `
        <div class="dog-detail-card" data-id="${dogId}">
            ${galleryHtml}
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(dog.name)}</h3>
                <p class="card-meta">${escapeHtml(dog.breed || 'Breed not specified')}</p>
                ${dog.isGuardian ? '<span class="guardian-tag">Guardian Home</span>' : ''}
                ${dog.description ? `<p class="card-description">${escapeHtml(dog.description)}</p>` : ''}
            </div>
            <div class="dog-info-grid">
                <div class="dog-info-item">
                    <label>Age</label>
                    <span>${age}</span>
                </div>
                <div class="dog-info-item">
                    <label>Weight</label>
                    <span>${dog.weight ? dog.weight + ' lbs' : 'N/A'}</span>
                </div>
                <div class="dog-info-item">
                    <label>Color</label>
                    <span>${escapeHtml(dog.color || 'N/A')}</span>
                </div>
                <div class="dog-info-item">
                    <label>Gender</label>
                    <span>${dog.gender === 'female' ? 'Female' : 'Male'}</span>
                </div>
            </div>
            ${guardianHtml}
        </div>
    `;
}

// Photo gallery navigation for public pages
window.dogGalleryData = {};

function setDogGalleryPhoto(dogId, index) {
    const dog = DB.dogs.getById(dogId);
    if (!dog) return;

    const photos = dog.photos || (dog.photo ? [dog.photo] : []);
    if (index < 0 || index >= photos.length) return;

    window.dogGalleryData[dogId] = index;

    const mainImg = document.getElementById(`dog-main-photo-${dogId}`);
    if (mainImg) mainImg.src = photos[index];

    // Update thumbnail active states
    const gallery = document.querySelector(`.dog-photo-gallery[data-dog-id="${dogId}"]`);
    if (gallery) {
        gallery.querySelectorAll('.gallery-thumb-img').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

function changeDogGalleryPhoto(dogId, direction) {
    const dog = DB.dogs.getById(dogId);
    if (!dog) return;

    const photos = dog.photos || (dog.photo ? [dog.photo] : []);
    const currentIndex = window.dogGalleryData[dogId] || 0;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;

    setDogGalleryPhoto(dogId, newIndex);
}

// Create puppy card HTML
function createPuppyCard(puppy) {
    const imageHtml = puppy.photo
        ? `<img src="${puppy.photo}" alt="${puppy.name}">`
        : createImagePlaceholder(puppy.name || 'Puppy');

    const statusClass = {
        'available': 'badge-available',
        'reserved': 'badge-reserved',
        'sold': 'badge-sold'
    }[puppy.status] || 'badge-available';

    const statusText = {
        'available': 'Available',
        'reserved': 'Reserved',
        'sold': 'Sold'
    }[puppy.status] || 'Available';

    // Get parent info
    let parentInfo = '';
    if (puppy.litterId) {
        const litter = DB.litters.getById(puppy.litterId);
        if (litter) {
            const mother = DB.dogs.getById(litter.motherId);
            const father = DB.dogs.getById(litter.fatherId);
            if (mother && father) {
                parentInfo = `${mother.name} x ${father.name}`;
            }
        }
    }

    const age = puppy.birthday ? calculatePuppyAge(puppy.birthday) : '';

    return `
        <div class="puppy-card" data-id="${puppy.id}">
            <div class="card-image">
                ${imageHtml}
                <span class="card-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(puppy.name || 'Unnamed Puppy')}</h3>
                ${parentInfo ? `<p class="card-meta">${escapeHtml(parentInfo)}</p>` : ''}
                ${age ? `<p class="card-meta">${age}</p>` : ''}
                <p class="card-meta">${puppy.gender === 'female' ? 'Female' : 'Male'} • ${escapeHtml(puppy.color || 'Color TBD')}</p>
                ${puppy.price ? `<p class="card-price">$${Number(puppy.price).toLocaleString()}</p>` : ''}
            </div>
        </div>
    `;
}

// Create image placeholder
function createImagePlaceholder(name) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return `
        <div class="image-placeholder">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10"/>
                <text x="12" y="16" text-anchor="middle" fill="currentColor" font-size="10">${initial}</text>
            </svg>
        </div>
    `;
}

// Create testimonial card
function createTestimonialCard(testimonial) {
    const rating = testimonial.rating || 5;
    const stars = Array(5).fill(0).map((_, i) => `
        <svg viewBox="0 0 24 24" ${i < rating ? 'fill="var(--accent-gold)"' : 'fill="var(--border-color)"'}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    `).join('');

    const initial = testimonial.authorName ? testimonial.authorName.charAt(0).toUpperCase() : '?';

    const authorImageHtml = testimonial.authorPhoto
        ? `<img src="${testimonial.authorPhoto}" alt="${escapeHtml(testimonial.authorName)}" class="testimonial-author-image">`
        : `<div class="testimonial-author-image-placeholder">${initial}</div>`;

    // Get puppy name if linked
    let puppyTag = '';
    if (testimonial.puppyId) {
        const puppy = DB.puppies.getById(testimonial.puppyId);
        if (puppy) {
            puppyTag = `<span class="testimonial-puppy-tag">Proud owner of ${escapeHtml(puppy.name)}</span>`;
        }
    } else if (testimonial.puppyName) {
        puppyTag = `<span class="testimonial-puppy-tag">Proud owner of ${escapeHtml(testimonial.puppyName)}</span>`;
    }

    return `
        <div class="testimonial-card">
            <svg class="testimonial-quote-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <div class="testimonial-content">
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-text">"${escapeHtml(testimonial.text)}"</p>
            </div>
            <div class="testimonial-author">
                ${authorImageHtml}
                <div class="testimonial-author-info">
                    <h4>${escapeHtml(testimonial.authorName)}</h4>
                    ${testimonial.location ? `<p>${escapeHtml(testimonial.location)}</p>` : ''}
                    ${puppyTag}
                </div>
            </div>
        </div>
    `;
}

// Create empty state
function createEmptyState(message, icon = 'info') {
    const icons = {
        paw: '<path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 14c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4v-1H6v1z"/>',
        heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
        info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    };

    return `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                ${icons[icon] || icons.info}
            </svg>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// Contact form initialization
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, this would send the form data
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        });
    }
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
}

function calculateAge(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        years--;
    }

    if (years === 0) {
        const months = (now.getMonth() - birth.getMonth() + 12) % 12;
        return months === 1 ? '1 month old' : `${months} months old`;
    }

    return years === 1 ? '1 year old' : `${years} years old`;
}

function calculatePuppyAge(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        return diffDays === 1 ? '1 day old' : `${diffDays} days old`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week old' : `${weeks} weeks old`;
    } else {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month old' : `${months} months old`;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShortDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
