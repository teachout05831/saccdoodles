/* ============================================
   Premium Doodles - Data Management System
   Local storage based backend for all data
   ============================================ */

const DB = {
    // Storage keys
    KEYS: {
        DOGS: 'premiumDoodles_dogs',
        LITTERS: 'premiumDoodles_litters',
        PUPPIES: 'premiumDoodles_puppies',
        CUSTOMERS: 'premiumDoodles_customers',
        PURCHASES: 'premiumDoodles_purchases',
        EXPENSES: 'premiumDoodles_expenses',
        VET_RECORDS: 'premiumDoodles_vetRecords',
        WAITLIST: 'premiumDoodles_waitlist',
        REMINDERS: 'premiumDoodles_reminders',
        SETTINGS: 'premiumDoodles_settings',
        SITE_CONTENT: 'premiumDoodles_siteContent',
        FILES: 'premiumDoodles_files',
        TESTIMONIALS: 'premiumDoodles_testimonials',
        GALLERY: 'premiumDoodles_gallery',
        FAQ: 'premiumDoodles_faq'
    },

    // Initialize database with sample data if empty
    init() {
        if (!localStorage.getItem(this.KEYS.DOGS)) {
            localStorage.setItem(this.KEYS.DOGS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.LITTERS)) {
            localStorage.setItem(this.KEYS.LITTERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.PUPPIES)) {
            localStorage.setItem(this.KEYS.PUPPIES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.CUSTOMERS)) {
            localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.PURCHASES)) {
            localStorage.setItem(this.KEYS.PURCHASES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.EXPENSES)) {
            localStorage.setItem(this.KEYS.EXPENSES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.VET_RECORDS)) {
            localStorage.setItem(this.KEYS.VET_RECORDS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.WAITLIST)) {
            localStorage.setItem(this.KEYS.WAITLIST, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.REMINDERS)) {
            localStorage.setItem(this.KEYS.REMINDERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.FILES)) {
            localStorage.setItem(this.KEYS.FILES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.TESTIMONIALS)) {
            localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.GALLERY)) {
            localStorage.setItem(this.KEYS.GALLERY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.FAQ)) {
            localStorage.setItem(this.KEYS.FAQ, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.SITE_CONTENT)) {
            localStorage.setItem(this.KEYS.SITE_CONTENT, JSON.stringify(this.getDefaultSiteContent()));
        }
        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({
                businessName: 'Premium Doodles',
                phone: '480-822-8443',
                email: 'mizzteachout@gmail.com',
                address: '',
                socialMedia: {
                    instagram: '',
                    tiktok: '',
                    facebook: ''
                }
            }));
        }
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Generic CRUD operations
    getAll(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    },

    save(key, item) {
        const items = this.getAll(key);
        if (item.id) {
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
            } else {
                items.push({ ...item, createdAt: new Date().toISOString() });
            }
        } else {
            item.id = this.generateId();
            item.createdAt = new Date().toISOString();
            items.push(item);
        }
        localStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    delete(key, id) {
        const items = this.getAll(key).filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(items));
    },

    // Dogs specific methods
    dogs: {
        getAll() {
            return DB.getAll(DB.KEYS.DOGS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.DOGS, id);
        },
        getPublic() {
            return DB.getAll(DB.KEYS.DOGS).filter(dog => dog.isPublic);
        },
        save(dog) {
            return DB.save(DB.KEYS.DOGS, dog);
        },
        delete(id) {
            DB.delete(DB.KEYS.DOGS, id);
        },
        getByGender(gender) {
            return DB.getAll(DB.KEYS.DOGS).filter(dog => dog.gender === gender);
        },
        getBreedingDogs() {
            return DB.getAll(DB.KEYS.DOGS).filter(dog => dog.isBreeding);
        }
    },

    // Litters specific methods
    litters: {
        getAll() {
            return DB.getAll(DB.KEYS.LITTERS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.LITTERS, id);
        },
        getByDog(dogId) {
            return DB.getAll(DB.KEYS.LITTERS).filter(
                litter => litter.motherId === dogId || litter.fatherId === dogId
            );
        },
        getPublic() {
            return DB.getAll(DB.KEYS.LITTERS).filter(litter => litter.isPublic);
        },
        save(litter) {
            return DB.save(DB.KEYS.LITTERS, litter);
        },
        delete(id) {
            DB.delete(DB.KEYS.LITTERS, id);
        }
    },

    // Puppies specific methods
    puppies: {
        getAll() {
            return DB.getAll(DB.KEYS.PUPPIES);
        },
        getById(id) {
            return DB.getById(DB.KEYS.PUPPIES, id);
        },
        getByLitter(litterId) {
            return DB.getAll(DB.KEYS.PUPPIES).filter(puppy => puppy.litterId === litterId);
        },
        getAvailable() {
            return DB.getAll(DB.KEYS.PUPPIES).filter(puppy => puppy.status === 'available');
        },
        getPublic() {
            return DB.getAll(DB.KEYS.PUPPIES).filter(puppy => puppy.isPublic);
        },
        save(puppy) {
            return DB.save(DB.KEYS.PUPPIES, puppy);
        },
        delete(id) {
            DB.delete(DB.KEYS.PUPPIES, id);
        },
        getByCustomer(customerId) {
            return DB.getAll(DB.KEYS.PUPPIES).filter(puppy => puppy.customerId === customerId);
        }
    },

    // Customers specific methods
    customers: {
        getAll() {
            return DB.getAll(DB.KEYS.CUSTOMERS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.CUSTOMERS, id);
        },
        save(customer) {
            return DB.save(DB.KEYS.CUSTOMERS, customer);
        },
        delete(id) {
            // Also delete associated purchases
            const purchases = DB.purchases.getByCustomer(id);
            purchases.forEach(p => DB.purchases.delete(p.id));
            DB.delete(DB.KEYS.CUSTOMERS, id);
        },
        search(query) {
            const q = query.toLowerCase();
            return DB.getAll(DB.KEYS.CUSTOMERS).filter(customer =>
                customer.name?.toLowerCase().includes(q) ||
                customer.email?.toLowerCase().includes(q) ||
                customer.phone?.includes(q)
            );
        },
        getGuardians() {
            return DB.getAll(DB.KEYS.CUSTOMERS).filter(customer => customer.isGuardian);
        },
        getPublicGuardians() {
            return DB.getAll(DB.KEYS.CUSTOMERS).filter(customer => customer.isGuardian && customer.showOnWebsite);
        }
    },

    // Purchases/Sales specific methods
    purchases: {
        getAll() {
            return DB.getAll(DB.KEYS.PURCHASES);
        },
        getById(id) {
            return DB.getById(DB.KEYS.PURCHASES, id);
        },
        getByCustomer(customerId) {
            return DB.getAll(DB.KEYS.PURCHASES).filter(p => p.customerId === customerId);
        },
        getByPuppy(puppyId) {
            return DB.getAll(DB.KEYS.PURCHASES).find(p => p.puppyId === puppyId);
        },
        save(purchase) {
            // When saving a purchase, also update the puppy's status and customerId
            if (purchase.puppyId) {
                const puppy = DB.puppies.getById(purchase.puppyId);
                if (puppy) {
                    puppy.status = 'sold';
                    puppy.customerId = purchase.customerId;
                    DB.puppies.save(puppy);
                }
            }
            return DB.save(DB.KEYS.PURCHASES, purchase);
        },
        delete(id) {
            const purchase = DB.getById(DB.KEYS.PURCHASES, id);
            // Optionally reset the puppy status when deleting purchase
            if (purchase && purchase.puppyId) {
                const puppy = DB.puppies.getById(purchase.puppyId);
                if (puppy) {
                    puppy.status = 'available';
                    puppy.customerId = null;
                    DB.puppies.save(puppy);
                }
            }
            DB.delete(DB.KEYS.PURCHASES, id);
        },
        getRecent(count = 10) {
            return DB.getAll(DB.KEYS.PURCHASES)
                .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                .slice(0, count);
        }
    },

    // Expenses tracking methods
    expenses: {
        getAll() {
            return DB.getAll(DB.KEYS.EXPENSES);
        },
        getById(id) {
            return DB.getById(DB.KEYS.EXPENSES, id);
        },
        getByDog(dogId) {
            return DB.getAll(DB.KEYS.EXPENSES).filter(e => e.dogId === dogId);
        },
        getByCategory(category) {
            return DB.getAll(DB.KEYS.EXPENSES).filter(e => e.category === category);
        },
        getByDateRange(startDate, endDate) {
            return DB.getAll(DB.KEYS.EXPENSES).filter(e => {
                const date = new Date(e.date);
                return date >= new Date(startDate) && date <= new Date(endDate);
            });
        },
        save(expense) {
            return DB.save(DB.KEYS.EXPENSES, expense);
        },
        delete(id) {
            DB.delete(DB.KEYS.EXPENSES, id);
        },
        getTotal(expenses = null) {
            const items = expenses || this.getAll();
            return items.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        },
        getTotalByCategory() {
            const expenses = this.getAll();
            const totals = {};
            expenses.forEach(e => {
                if (!totals[e.category]) totals[e.category] = 0;
                totals[e.category] += parseFloat(e.amount) || 0;
            });
            return totals;
        },
        getRecent(count = 10) {
            return DB.getAll(DB.KEYS.EXPENSES)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, count);
        },
        getMonthlyTotal(year, month) {
            return this.getAll()
                .filter(e => {
                    const d = new Date(e.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                })
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        },
        getYearlyTotal(year) {
            return this.getAll()
                .filter(e => new Date(e.date).getFullYear() === year)
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        }
    },

    // Vet Records methods
    vetRecords: {
        getAll() {
            return DB.getAll(DB.KEYS.VET_RECORDS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.VET_RECORDS, id);
        },
        getByDog(dogId) {
            return DB.getAll(DB.KEYS.VET_RECORDS)
                .filter(r => r.dogId === dogId)
                .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
        },
        getByType(type) {
            return DB.getAll(DB.KEYS.VET_RECORDS).filter(r => r.type === type);
        },
        save(record) {
            return DB.save(DB.KEYS.VET_RECORDS, record);
        },
        delete(id) {
            DB.delete(DB.KEYS.VET_RECORDS, id);
        },
        // Get dogs with expiring rabies shots (only dogs at home, not guardian homes)
        getExpiringRabies(daysAhead = 60) {
            const now = new Date();
            const future = new Date();
            future.setDate(future.getDate() + daysAhead);
            const results = [];

            // Get all dogs that are at home (not in guardian homes)
            const dogsAtHome = DB.dogs.getAll().filter(dog => dog.location === 'home');

            dogsAtHome.forEach(dog => {
                // Find the most recent rabies record for this dog
                const rabiesRecords = this.getByDog(dog.id)
                    .filter(r => r.type === 'rabies')
                    .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

                if (rabiesRecords.length > 0) {
                    const latestRabies = rabiesRecords[0];
                    if (latestRabies.expirationDate) {
                        const expDate = new Date(latestRabies.expirationDate);
                        if (expDate <= future) {
                            const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                            results.push({
                                dog,
                                record: latestRabies,
                                expirationDate: expDate,
                                daysUntil,
                                isExpired: daysUntil < 0
                            });
                        }
                    }
                } else {
                    // No rabies record on file
                    results.push({
                        dog,
                        record: null,
                        expirationDate: null,
                        daysUntil: null,
                        isExpired: false,
                        noRecord: true
                    });
                }
            });

            return results.sort((a, b) => {
                if (a.noRecord) return 1;
                if (b.noRecord) return -1;
                return (a.daysUntil || 999) - (b.daysUntil || 999);
            });
        },
        // Get all upcoming vaccinations
        getUpcomingVaccinations(daysAhead = 60) {
            const now = new Date();
            const future = new Date();
            future.setDate(future.getDate() + daysAhead);
            const results = [];

            const dogsAtHome = DB.dogs.getAll().filter(dog => dog.location === 'home');

            dogsAtHome.forEach(dog => {
                const records = this.getByDog(dog.id)
                    .filter(r => r.expirationDate);

                records.forEach(record => {
                    const expDate = new Date(record.expirationDate);
                    if (expDate <= future) {
                        const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                        results.push({
                            dog,
                            record,
                            expirationDate: expDate,
                            daysUntil,
                            isExpired: daysUntil < 0
                        });
                    }
                });
            });

            return results.sort((a, b) => (a.daysUntil || 999) - (b.daysUntil || 999));
        }
    },

    // Waitlist methods
    waitlist: {
        getAll() {
            return DB.getAll(DB.KEYS.WAITLIST);
        },
        getById(id) {
            return DB.getById(DB.KEYS.WAITLIST, id);
        },
        save(entry) {
            return DB.save(DB.KEYS.WAITLIST, entry);
        },
        delete(id) {
            DB.delete(DB.KEYS.WAITLIST, id);
        },
        // Get position in waitlist
        getPosition(id) {
            const entries = this.getAll()
                .filter(e => e.status !== 'cancelled' && e.status !== 'fulfilled')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            const index = entries.findIndex(e => e.id === id);
            return index !== -1 ? index + 1 : null;
        },
        // Get all active entries (not cancelled or fulfilled)
        getActive() {
            return this.getAll()
                .filter(e => e.status !== 'cancelled' && e.status !== 'fulfilled')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        },
        // Get entries by status
        getByStatus(status) {
            return this.getAll().filter(e => e.status === status);
        },
        // Get entries by breed preference
        getByBreed(breed) {
            return this.getAll().filter(e =>
                e.selectedBreeds && e.selectedBreeds.includes(breed)
            );
        },
        // Get entries by parent preference
        getByParent(dogId) {
            return this.getAll().filter(e =>
                e.selectedParents && e.selectedParents.includes(dogId)
            );
        },
        // Get entries with deposit paid
        getDepositPaid() {
            return this.getAll().filter(e => e.depositPaid);
        },
        // Get entries awaiting deposit
        getAwaitingDeposit() {
            return this.getAll().filter(e => !e.depositPaid && e.status === 'pending');
        },
        // Mark deposit as paid
        markDepositPaid(id, amount = 300, paymentMethod = '', paymentDate = null) {
            const entry = this.getById(id);
            if (entry) {
                entry.depositPaid = true;
                entry.depositAmount = amount;
                entry.depositPaymentMethod = paymentMethod;
                entry.depositPaidDate = paymentDate || new Date().toISOString();
                entry.status = 'active';
                return this.save(entry);
            }
            return null;
        },
        // Transfer deposit to different litter
        transferDeposit(id, newLitterId, notes = '') {
            const entry = this.getById(id);
            if (entry) {
                if (!entry.depositTransfers) entry.depositTransfers = [];
                entry.depositTransfers.push({
                    fromLitterId: entry.assignedLitterId || null,
                    toLitterId: newLitterId,
                    date: new Date().toISOString(),
                    notes
                });
                entry.assignedLitterId = newLitterId;
                return this.save(entry);
            }
            return null;
        },
        // Assign to a litter
        assignToLitter(id, litterId) {
            const entry = this.getById(id);
            if (entry) {
                entry.assignedLitterId = litterId;
                return this.save(entry);
            }
            return null;
        },
        // Mark as fulfilled (got their puppy)
        markFulfilled(id, puppyId = null) {
            const entry = this.getById(id);
            if (entry) {
                entry.status = 'fulfilled';
                entry.fulfilledDate = new Date().toISOString();
                entry.puppyId = puppyId;
                return this.save(entry);
            }
            return null;
        },
        // Cancel waitlist entry
        cancel(id, reason = '') {
            const entry = this.getById(id);
            if (entry) {
                entry.status = 'cancelled';
                entry.cancelledDate = new Date().toISOString();
                entry.cancellationReason = reason;
                return this.save(entry);
            }
            return null;
        },
        // Search waitlist
        search(query) {
            const q = query.toLowerCase();
            return this.getAll().filter(e =>
                e.firstName?.toLowerCase().includes(q) ||
                e.lastName?.toLowerCase().includes(q) ||
                e.email?.toLowerCase().includes(q) ||
                e.phone?.includes(q)
            );
        },
        // Get stats
        getStats() {
            const all = this.getAll();
            return {
                total: all.length,
                active: all.filter(e => e.status === 'active').length,
                pending: all.filter(e => e.status === 'pending').length,
                fulfilled: all.filter(e => e.status === 'fulfilled').length,
                cancelled: all.filter(e => e.status === 'cancelled').length,
                depositsPaid: all.filter(e => e.depositPaid).length,
                totalDeposits: all.filter(e => e.depositPaid).reduce((sum, e) => sum + (parseFloat(e.depositAmount) || 0), 0)
            };
        },
        // Get recent entries
        getRecent(count = 10) {
            return this.getAll()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, count);
        }
    },

    // Reminders specific methods
    reminders: {
        getAll() {
            return DB.getAll(DB.KEYS.REMINDERS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.REMINDERS, id);
        },
        getUpcoming(days = 30) {
            const now = new Date();
            const future = new Date();
            future.setDate(future.getDate() + days);
            return DB.getAll(DB.KEYS.REMINDERS).filter(reminder => {
                const date = new Date(reminder.date);
                return date >= now && date <= future && !reminder.completed;
            }).sort((a, b) => new Date(a.date) - new Date(b.date));
        },
        getByType(type) {
            return DB.getAll(DB.KEYS.REMINDERS).filter(reminder => reminder.type === type);
        },
        save(reminder) {
            return DB.save(DB.KEYS.REMINDERS, reminder);
        },
        delete(id) {
            DB.delete(DB.KEYS.REMINDERS, id);
        },
        markComplete(id) {
            const reminder = DB.getById(DB.KEYS.REMINDERS, id);
            if (reminder) {
                reminder.completed = true;
                reminder.completedAt = new Date().toISOString();
                DB.save(DB.KEYS.REMINDERS, reminder);
            }
        }
    },

    // Files/Documents methods
    files: {
        getAll() {
            return DB.getAll(DB.KEYS.FILES);
        },
        getByEntity(entityType, entityId) {
            return DB.getAll(DB.KEYS.FILES).filter(
                file => file.entityType === entityType && file.entityId === entityId
            );
        },
        save(file) {
            return DB.save(DB.KEYS.FILES, file);
        },
        delete(id) {
            DB.delete(DB.KEYS.FILES, id);
        }
    },

    // Testimonials methods
    testimonials: {
        getAll() {
            return DB.getAll(DB.KEYS.TESTIMONIALS);
        },
        getById(id) {
            return DB.getById(DB.KEYS.TESTIMONIALS, id);
        },
        getPublic() {
            return DB.getAll(DB.KEYS.TESTIMONIALS)
                .filter(t => t.isPublic)
                .sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0));
        },
        getFeatured() {
            return DB.getAll(DB.KEYS.TESTIMONIALS)
                .filter(t => t.isPublic && t.isFeatured)
                .sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0));
        },
        save(testimonial) {
            return DB.save(DB.KEYS.TESTIMONIALS, testimonial);
        },
        delete(id) {
            DB.delete(DB.KEYS.TESTIMONIALS, id);
        },
        getByPuppy(puppyId) {
            return DB.getAll(DB.KEYS.TESTIMONIALS).filter(t => t.puppyId === puppyId);
        },
        getByCustomer(customerId) {
            return DB.getAll(DB.KEYS.TESTIMONIALS).filter(t => t.customerId === customerId);
        }
    },

    // Gallery (Happy Families) methods
    gallery: {
        getAll() {
            return DB.getAll(DB.KEYS.GALLERY);
        },
        getById(id) {
            return DB.getById(DB.KEYS.GALLERY, id);
        },
        getPublic() {
            return DB.getAll(DB.KEYS.GALLERY)
                .filter(g => g.isPublic)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        save(item) {
            return DB.save(DB.KEYS.GALLERY, item);
        },
        delete(id) {
            DB.delete(DB.KEYS.GALLERY, id);
        },
        getByPuppy(puppyId) {
            return DB.getAll(DB.KEYS.GALLERY).filter(g => g.puppyId === puppyId);
        },
        getByCustomer(customerId) {
            return DB.getAll(DB.KEYS.GALLERY).filter(g => g.customerId === customerId);
        }
    },

    // FAQ methods
    faq: {
        getAll() {
            return DB.getAll(DB.KEYS.FAQ);
        },
        getById(id) {
            return DB.getById(DB.KEYS.FAQ, id);
        },
        getPublic() {
            return DB.getAll(DB.KEYS.FAQ)
                .filter(f => f.isPublic)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        },
        getByCategory(category) {
            return DB.getAll(DB.KEYS.FAQ).filter(f => f.category === category);
        },
        save(faqItem) {
            return DB.save(DB.KEYS.FAQ, faqItem);
        },
        delete(id) {
            DB.delete(DB.KEYS.FAQ, id);
        },
        getCategories() {
            const faqs = this.getAll();
            return [...new Set(faqs.map(f => f.category).filter(Boolean))];
        }
    },

    // Settings methods
    settings: {
        get() {
            return JSON.parse(localStorage.getItem(DB.KEYS.SETTINGS) || '{}');
        },
        save(settings) {
            localStorage.setItem(DB.KEYS.SETTINGS, JSON.stringify(settings));
        }
    },

    // Default site content structure
    getDefaultSiteContent() {
        return {
            // Business Information
            business: {
                name: 'SACC Doodles',
                tagline: 'Quality Bred Puppies',
                phone: '480-822-8443',
                email: 'mizzteachout@gmail.com',
                location: 'Gilbert, Arizona',
                instagram: '',
                tiktok: '',
                facebook: ''
            },
            // Homepage content
            homepage: {
                heroTitle: 'SACC Doodles',
                heroSubtitle: 'Raising healthy, happy, and well-socialized puppies with love',
                heroImage: '',
                dogsSection: {
                    title: 'Our Dogs',
                    subtitle: 'Our breeding dogs are health tested, loved, and part of our family'
                },
                puppiesSection: {
                    title: 'Puppies',
                    subtitle: 'Find your perfect furry companion from our current litters'
                },
                guardianSection: {
                    title: 'Guardian Home',
                    subtitle: 'Get a top-quality puppy for free while helping us raise happy, healthy dogs in loving family environments'
                },
                testimonialsSection: {
                    title: 'Families Say',
                    subtitle: 'Hear from the happy families who have welcomed a SACC Doodle into their homes'
                }
            },
            // About section (used on homepage and about page)
            about: {
                breederName: 'Angela',
                breederPhoto: '',
                shortBio: "Welcome to SACC Doodles! I'm Angela, and I'm the heart behind this breeding program here in Gilbert, Arizona. As a mother of 12 children, my home is always bustling with activity - the perfect environment for raising well-socialized puppies!",
                shortBio2: "Every puppy is raised with love, proper veterinary care, and early socialization to ensure they're ready for their forever homes.",
                fullBio: "Welcome to SACC Doodles! I'm Angela, and I'm the heart behind this breeding program here in Gilbert, Arizona. With over 5 years of breeding experience, I specialize in raising beautiful Bernedoodles and Goldendoodles.",
                fullBio2: "As a mother of 12 children, my home is always bustling with activity, laughter, and love - the perfect environment for raising well-socialized puppies! Every puppy born here grows up surrounded by kids, other pets, and all the wonderful chaos of family life.",
                fullBio3: "I believe that every puppy deserves a loving and nurturing environment, with attention to their physical, mental, and emotional well-being. That's why each of my puppies is raised right in our family home, not in a kennel or separate facility.",
                philosophyPhoto: '',
                philosophy1: "At SACC Doodles, we're more than just a breeding program - we're a community. I work closely with my veterinarian to ensure all health screenings and protocols are followed before any puppy goes to their forever home.",
                philosophy2: "Early socialization is key to raising confident, well-adjusted dogs. My puppies experience everyday household sounds, meet people of all ages, and learn to interact with other animals from the very beginning.",
                philosophy3: "But our relationship doesn't end when you take your puppy home. I'm committed to building lasting relationships with every family and providing ongoing guidance and support throughout your dog's life. SACC Doodles offers warmth, trust, and a family feel that you just won't find elsewhere."
            },
            // SACC meaning
            saccMeaning: {
                s: { letter: 'S', word: 'Smart', description: 'Intelligent, trainable puppies that are eager to learn and please their families.' },
                a: { letter: 'A', word: 'Amazing', description: 'Exceptional temperaments and stunning looks that will amaze everyone they meet.' },
                c1: { letter: 'C', word: 'Cute', description: 'Adorable faces and fluffy coats that steal hearts from the moment you see them.' },
                c2: { letter: 'C', word: 'Cuddly', description: 'Affectionate companions who love nothing more than snuggling with their families.' }
            },
            // Values section
            values: {
                value1: { title: 'Health First', description: 'All our breeding dogs undergo comprehensive health testing to ensure we produce the healthiest puppies possible.' },
                value2: { title: 'Family Raised', description: 'Our puppies are raised in our home with 12 kids, surrounded by love, and exposed to everyday household activities.' },
                value3: { title: 'Lifetime Support', description: "We're always here for our puppy families, offering guidance and support throughout your dog's life." }
            },
            // Guardian program page
            guardian: {
                pageTitle: 'Guardian Homes',
                pageSubtitle: 'A unique opportunity to own a high-quality dog while being part of our breeding family',
                introTitle: 'What is a Guardian Home?',
                introText: 'A Guardian Home is a wonderful arrangement where a family gets to own one of our beautiful breeding dogs while we retain breeding rights. This allows our dogs to live in loving family homes rather than in a kennel environment.',
                benefits: [
                    'Receive a top-quality puppy at no cost (or significantly reduced)',
                    'Dog lives with you full-time as your family pet',
                    'All breeding-related veterinary costs covered by us',
                    'Lifetime support and guidance from us',
                    'Be part of our extended breeding family'
                ],
                requirements: [
                    'Live within 60 miles of Gilbert, Arizona',
                    'Have a fenced yard or safe outdoor space',
                    'Be available for breeding appointments',
                    'Commit to proper care and training',
                    'Allow us to use photos for our website/social media'
                ]
            },
            // Contact page
            contact: {
                pageTitle: 'Contact Us',
                pageSubtitle: "We'd love to hear from you! Reach out with any questions about our puppies.",
                formIntro: 'Fill out the form below and we will get back to you as soon as possible.'
            },
            // Footer
            footer: {
                tagline: 'Breeding quality puppies with love and care.',
                copyright: '© 2024 SACC Doodles. All rights reserved.'
            }
        };
    },

    // Site content methods
    siteContent: {
        get() {
            const content = localStorage.getItem(DB.KEYS.SITE_CONTENT);
            if (content) {
                return JSON.parse(content);
            }
            return DB.getDefaultSiteContent();
        },
        save(content) {
            localStorage.setItem(DB.KEYS.SITE_CONTENT, JSON.stringify(content));
        },
        getSection(section) {
            const content = this.get();
            return content[section] || {};
        },
        saveSection(section, data) {
            const content = this.get();
            content[section] = data;
            this.save(content);
        },
        reset() {
            localStorage.setItem(DB.KEYS.SITE_CONTENT, JSON.stringify(DB.getDefaultSiteContent()));
        }
    },

    // Heat cycle calculator
    heatCycle: {
        calculateNextHeat(lastHeatDate, cycleLengthDays = 180) {
            const lastHeat = new Date(lastHeatDate);
            const nextHeat = new Date(lastHeat);
            nextHeat.setDate(nextHeat.getDate() + cycleLengthDays);
            return nextHeat;
        },
        getDaysUntilHeat(nextHeatDate) {
            const now = new Date();
            const next = new Date(nextHeatDate);
            const diff = next - now;
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }
    },

    // Birthday checker
    birthdays: {
        getUpcoming(days = 30) {
            const now = new Date();
            const results = [];

            // Check dogs
            DB.dogs.getAll().forEach(dog => {
                if (dog.birthday) {
                    const birthday = new Date(dog.birthday);
                    const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
                    if (thisYearBirthday < now) {
                        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
                    }
                    const daysUntil = Math.ceil((thisYearBirthday - now) / (1000 * 60 * 60 * 24));
                    if (daysUntil <= days) {
                        const age = thisYearBirthday.getFullYear() - birthday.getFullYear();
                        results.push({
                            type: 'dog',
                            entity: dog,
                            date: thisYearBirthday,
                            daysUntil,
                            age
                        });
                    }
                }
            });

            // Check puppies
            DB.puppies.getAll().forEach(puppy => {
                if (puppy.birthday) {
                    const birthday = new Date(puppy.birthday);
                    const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
                    if (thisYearBirthday < now) {
                        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
                    }
                    const daysUntil = Math.ceil((thisYearBirthday - now) / (1000 * 60 * 60 * 24));
                    if (daysUntil <= days) {
                        const age = thisYearBirthday.getFullYear() - birthday.getFullYear();
                        results.push({
                            type: 'puppy',
                            entity: puppy,
                            date: thisYearBirthday,
                            daysUntil,
                            age,
                            customer: puppy.customerId ? DB.customers.getById(puppy.customerId) : null
                        });
                    }
                }
            });

            return results.sort((a, b) => a.daysUntil - b.daysUntil);
        }
    },

    // Vet visits tracking
    vetVisits: {
        getByDog(dogId) {
            const dog = DB.dogs.getById(dogId);
            return dog?.vetVisits || [];
        },
        add(dogId, visit) {
            const dog = DB.dogs.getById(dogId);
            if (dog) {
                if (!dog.vetVisits) dog.vetVisits = [];
                visit.id = DB.generateId();
                visit.createdAt = new Date().toISOString();
                dog.vetVisits.push(visit);
                DB.dogs.save(dog);
            }
            return visit;
        },
        remove(dogId, visitId) {
            const dog = DB.dogs.getById(dogId);
            if (dog && dog.vetVisits) {
                dog.vetVisits = dog.vetVisits.filter(v => v.id !== visitId);
                DB.dogs.save(dog);
            }
        }
    },

    // Export all data
    exportData() {
        return {
            dogs: this.dogs.getAll(),
            litters: this.litters.getAll(),
            puppies: this.puppies.getAll(),
            customers: this.customers.getAll(),
            purchases: this.purchases.getAll(),
            expenses: this.expenses.getAll(),
            vetRecords: this.vetRecords.getAll(),
            waitlist: this.waitlist.getAll(),
            reminders: this.reminders.getAll(),
            files: this.files.getAll(),
            testimonials: this.testimonials.getAll(),
            gallery: this.gallery.getAll(),
            faq: this.faq.getAll(),
            settings: this.settings.get(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.dogs) localStorage.setItem(this.KEYS.DOGS, JSON.stringify(data.dogs));
        if (data.litters) localStorage.setItem(this.KEYS.LITTERS, JSON.stringify(data.litters));
        if (data.puppies) localStorage.setItem(this.KEYS.PUPPIES, JSON.stringify(data.puppies));
        if (data.customers) localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(data.customers));
        if (data.purchases) localStorage.setItem(this.KEYS.PURCHASES, JSON.stringify(data.purchases));
        if (data.expenses) localStorage.setItem(this.KEYS.EXPENSES, JSON.stringify(data.expenses));
        if (data.vetRecords) localStorage.setItem(this.KEYS.VET_RECORDS, JSON.stringify(data.vetRecords));
        if (data.waitlist) localStorage.setItem(this.KEYS.WAITLIST, JSON.stringify(data.waitlist));
        if (data.reminders) localStorage.setItem(this.KEYS.REMINDERS, JSON.stringify(data.reminders));
        if (data.files) localStorage.setItem(this.KEYS.FILES, JSON.stringify(data.files));
        if (data.testimonials) localStorage.setItem(this.KEYS.TESTIMONIALS, JSON.stringify(data.testimonials));
        if (data.gallery) localStorage.setItem(this.KEYS.GALLERY, JSON.stringify(data.gallery));
        if (data.faq) localStorage.setItem(this.KEYS.FAQ, JSON.stringify(data.faq));
        if (data.settings) localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        this.init();
    }
};

// Initialize database on load
DB.init();
