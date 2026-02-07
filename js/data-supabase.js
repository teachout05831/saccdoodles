/* ============================================
   SACC Doodles - Supabase Data Management
   Replaces localStorage with Supabase backend
   Uses caching for synchronous access
   ============================================ */

// Cache for all data - allows synchronous access after initial load
const _cache = {
    dogs: [],
    litters: [],
    puppies: [],
    customers: [],
    purchases: [],
    expenses: [],
    vetRecords: [],
    waitlist: [],
    reminders: [],
    files: [],
    testimonials: [],
    gallery: [],
    faq: [],
    guardianApplications: [],
    contactSubmissions: [],
    settings: {},
    loaded: false
};

const DB = {
    // Initialize and load all data
    async init() {
        if (!supabaseClient) {
            initSupabase();
        }
        await this.loadAll();
        console.log('Database initialized with Supabase (cached)');
        return true;
    },

    // Load all data into cache
    async loadAll() {
        try {
            console.log('Loading all data from Supabase...');

            // Load all tables in parallel
            const [
                dogs, litters, puppies, customers, purchases,
                expenses, vetRecords, waitlist, reminders,
                files, testimonials, gallery, faq, guardianApplications,
                contactSubmissions, settings
            ] = await Promise.all([
                supabaseClient.from('dogs').select('*').order('name'),
                supabaseClient.from('litters').select('*').order('expected_date', { ascending: false }),
                supabaseClient.from('puppies').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('customers').select('*').order('name'),
                supabaseClient.from('purchases').select('*').order('purchase_date', { ascending: false }),
                supabaseClient.from('expenses').select('*').order('date', { ascending: false }),
                supabaseClient.from('vet_records').select('*').order('visit_date', { ascending: false }),
                supabaseClient.from('waitlist').select('*').order('created_at'),
                supabaseClient.from('reminders').select('*').order('date'),
                supabaseClient.from('files').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('testimonials').select('*').order('display_order', { ascending: false }),
                supabaseClient.from('gallery').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('faq').select('*').order('display_order'),
                supabaseClient.from('guardian_applications').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('contact_submissions').select('*').order('created_at', { ascending: false }),
                supabaseClient.from('settings').select('*').limit(1).single()
            ]);

            _cache.dogs = dogs.data || [];
            _cache.litters = litters.data || [];
            _cache.puppies = puppies.data || [];
            _cache.customers = customers.data || [];
            _cache.purchases = purchases.data || [];
            _cache.expenses = expenses.data || [];
            _cache.vetRecords = vetRecords.data || [];
            _cache.waitlist = waitlist.data || [];
            _cache.reminders = reminders.data || [];
            _cache.files = files.data || [];
            _cache.testimonials = testimonials.data || [];
            _cache.gallery = gallery.data || [];
            _cache.faq = faq.data || [];
            _cache.guardianApplications = guardianApplications.data || [];
            _cache.contactSubmissions = contactSubmissions.data || [];
            _cache.settings = settings.data || {};
            _cache.loaded = true;

            console.log('Data loaded:', {
                dogs: _cache.dogs.length,
                litters: _cache.litters.length,
                puppies: _cache.puppies.length,
                customers: _cache.customers.length
            });

            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            _cache.loaded = true; // Set to true so app doesn't hang
            return false;
        }
    },

    // Check if data is loaded
    isLoaded() {
        return _cache.loaded;
    },

    // ============================================
    // DOGS - Synchronous getters, async saves
    // ============================================
    dogs: {
        getAll() {
            return _cache.dogs;
        },

        getById(id) {
            return _cache.dogs.find(d => d.id === id);
        },

        getPublic() {
            return _cache.dogs.filter(d => d.is_public);
        },

        getByGender(gender) {
            return _cache.dogs.filter(d => d.gender === gender);
        },

        getBreedingDogs() {
            return _cache.dogs.filter(d => d.is_breeding);
        },

        async save(dog) {
            const record = {
                name: dog.name,
                breed: dog.breed,
                gender: dog.gender,
                birthday: dog.birthday,
                color: dog.color,
                weight: dog.weight,
                registration_number: dog.registrationNumber,
                microchip: dog.microchip,
                photos: dog.photos || [],
                photo_url: dog.photoUrl || dog.photo || '',
                description: dog.description,
                notes: dog.notes,
                last_heat_date: dog.lastHeatDate,
                heat_cycle_days: dog.heatCycleDays || dog.cycleLength || 180,
                is_breeding: dog.isBreeding,
                is_public: dog.isPublic,
                location: dog.location,
                guardian_family: dog.guardianFamily
            };

            let result;

            if (dog.id) {
                const { data, error } = await supabaseClient
                    .from('dogs')
                    .update(record)
                    .eq('id', dog.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                // Update cache
                const idx = _cache.dogs.findIndex(d => d.id === dog.id);
                if (idx >= 0) _cache.dogs[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('dogs')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.dogs.push(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('dogs')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.dogs = _cache.dogs.filter(d => d.id !== id);
        }
    },

    // ============================================
    // LITTERS
    // ============================================
    litters: {
        getAll() {
            return _cache.litters;
        },

        getById(id) {
            return _cache.litters.find(l => l.id === id);
        },

        getByDog(dogId) {
            return _cache.litters.filter(l => l.mother_id === dogId || l.father_id === dogId);
        },

        getPublic() {
            return _cache.litters.filter(l => l.is_public);
        },

        async save(litter) {
            const record = {
                name: litter.name,
                mother_id: litter.motherId,
                father_id: litter.fatherId,
                breed: litter.breed,
                expected_date: litter.expectedDate,
                birth_date: litter.birthDate,
                puppy_count: litter.puppyCount,
                is_public: litter.isPublic,
                status: litter.status,
                photo_url: litter.photoUrl,
                notes: litter.notes
            };

            let result;
            if (litter.id) {
                const { data, error } = await supabaseClient
                    .from('litters')
                    .update(record)
                    .eq('id', litter.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.litters.findIndex(l => l.id === litter.id);
                if (idx >= 0) _cache.litters[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('litters')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.litters.push(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('litters')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.litters = _cache.litters.filter(l => l.id !== id);
        }
    },

    // ============================================
    // PUPPIES
    // ============================================
    puppies: {
        getAll() {
            return _cache.puppies;
        },

        getById(id) {
            return _cache.puppies.find(p => p.id === id);
        },

        getByLitter(litterId) {
            return _cache.puppies.filter(p => p.litter_id === litterId);
        },

        getAvailable() {
            return _cache.puppies.filter(p => p.status === 'available');
        },

        getPublic() {
            return _cache.puppies.filter(p => p.is_public);
        },

        getByCustomer(customerId) {
            return _cache.puppies.filter(p => p.customer_id === customerId);
        },

        async save(puppy) {
            const record = {
                name: puppy.name,
                litter_id: puppy.litterId,
                gender: puppy.gender,
                color: puppy.color,
                weight: puppy.weight,
                birthday: puppy.birthday,
                status: puppy.status || 'available',
                price: puppy.price,
                customer_id: puppy.customerId,
                is_public: puppy.isPublic,
                photo_url: puppy.photo || puppy.photoUrl,
                photos: puppy.photos || [],
                notes: puppy.notes,
                collar_color: puppy.collarColor,
                personality: puppy.personality,
                description: puppy.description,
                best_suited_for: puppy.bestSuitedFor,
                video_url: puppy.videoUrl,
                video_featured: puppy.videoFeatured
            };

            let result;
            if (puppy.id) {
                const { data, error } = await supabaseClient
                    .from('puppies')
                    .update(record)
                    .eq('id', puppy.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.puppies.findIndex(p => p.id === puppy.id);
                if (idx >= 0) _cache.puppies[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('puppies')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.puppies.push(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('puppies')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.puppies = _cache.puppies.filter(p => p.id !== id);
        }
    },

    // ============================================
    // CUSTOMERS
    // ============================================
    customers: {
        getAll() {
            return _cache.customers;
        },

        getById(id) {
            return _cache.customers.find(c => c.id === id);
        },

        getGuardians() {
            return _cache.customers.filter(c => c.is_guardian);
        },

        getPublicGuardians() {
            return _cache.customers.filter(c => c.is_guardian && c.show_on_website);
        },

        search(query) {
            const q = query.toLowerCase();
            return _cache.customers.filter(c =>
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.phone && c.phone.includes(q))
            );
        },

        async save(customer) {
            const record = {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                state: customer.state,
                zip: customer.zip,
                is_guardian: customer.isGuardian,
                show_on_website: customer.showOnWebsite,
                photo_url: customer.photoUrl,
                notes: customer.notes
            };

            let result;
            if (customer.id) {
                const { data, error } = await supabaseClient
                    .from('customers')
                    .update(record)
                    .eq('id', customer.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.customers.findIndex(c => c.id === customer.id);
                if (idx >= 0) _cache.customers[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('customers')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.customers.push(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('customers')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.customers = _cache.customers.filter(c => c.id !== id);
        }
    },

    // ============================================
    // PURCHASES
    // ============================================
    purchases: {
        getAll() {
            return _cache.purchases;
        },

        getById(id) {
            return _cache.purchases.find(p => p.id === id);
        },

        getByCustomer(customerId) {
            return _cache.purchases.filter(p => p.customer_id === customerId);
        },

        getByPuppy(puppyId) {
            return _cache.purchases.find(p => p.puppy_id === puppyId);
        },

        getRecent(count = 10) {
            return _cache.purchases.slice(0, count);
        },

        async save(purchase) {
            const record = {
                customer_id: purchase.customerId,
                puppy_id: purchase.puppyId,
                amount: purchase.amount,
                deposit_amount: purchase.depositAmount,
                purchase_date: purchase.purchaseDate,
                payment_method: purchase.paymentMethod,
                payment_status: purchase.paymentStatus || 'pending',
                notes: purchase.notes
            };

            let result;
            if (purchase.id) {
                const { data, error } = await supabaseClient
                    .from('purchases')
                    .update(record)
                    .eq('id', purchase.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.purchases.findIndex(p => p.id === purchase.id);
                if (idx >= 0) _cache.purchases[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('purchases')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.purchases.unshift(result);
            }

            // Update puppy status when purchased
            if (purchase.puppyId) {
                await supabaseClient
                    .from('puppies')
                    .update({
                        status: 'sold',
                        customer_id: purchase.customerId
                    })
                    .eq('id', purchase.puppyId);
                // Update cache
                const puppyIdx = _cache.puppies.findIndex(p => p.id === purchase.puppyId);
                if (puppyIdx >= 0) {
                    _cache.puppies[puppyIdx].status = 'sold';
                    _cache.puppies[puppyIdx].customer_id = purchase.customerId;
                }
            }

            return result;
        },

        async delete(id) {
            const purchase = this.getById(id);

            if (purchase && purchase.puppy_id) {
                await supabaseClient
                    .from('puppies')
                    .update({ status: 'available', customer_id: null })
                    .eq('id', purchase.puppy_id);
                const puppyIdx = _cache.puppies.findIndex(p => p.id === purchase.puppy_id);
                if (puppyIdx >= 0) {
                    _cache.puppies[puppyIdx].status = 'available';
                    _cache.puppies[puppyIdx].customer_id = null;
                }
            }

            const { error } = await supabaseClient
                .from('purchases')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.purchases = _cache.purchases.filter(p => p.id !== id);
        }
    },

    // ============================================
    // EXPENSES
    // ============================================
    expenses: {
        getAll() {
            return _cache.expenses;
        },

        getById(id) {
            return _cache.expenses.find(e => e.id === id);
        },

        getByDog(dogId) {
            return _cache.expenses.filter(e => e.dog_id === dogId);
        },

        getByCategory(category) {
            return _cache.expenses.filter(e => e.category === category);
        },

        getByDateRange(startDate, endDate) {
            return _cache.expenses.filter(e =>
                e.date >= startDate && e.date <= endDate
            );
        },

        getRecent(count = 10) {
            return _cache.expenses.slice(0, count);
        },

        getTotal(expenses = null) {
            const list = expenses || _cache.expenses;
            return list.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        },

        getMonthlyTotal(year, month) {
            return _cache.expenses
                .filter(e => {
                    const d = new Date(e.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                })
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        },

        getYearlyTotal(year) {
            return _cache.expenses
                .filter(e => new Date(e.date).getFullYear() === year)
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        },

        getTotalByCategory() {
            const totals = {};
            _cache.expenses.forEach(e => {
                const cat = e.category || 'Other';
                totals[cat] = (totals[cat] || 0) + (parseFloat(e.amount) || 0);
            });
            return totals;
        },

        async save(expense) {
            const record = {
                category: expense.category,
                description: expense.description,
                amount: expense.amount,
                date: expense.date,
                dog_id: expense.dogId,
                vendor: expense.vendor,
                receipt_url: expense.receiptUrl,
                notes: expense.notes
            };

            let result;
            if (expense.id) {
                const { data, error } = await supabaseClient
                    .from('expenses')
                    .update(record)
                    .eq('id', expense.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.expenses.findIndex(e => e.id === expense.id);
                if (idx >= 0) _cache.expenses[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('expenses')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.expenses.unshift(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('expenses')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.expenses = _cache.expenses.filter(e => e.id !== id);
        }
    },

    // ============================================
    // VET RECORDS
    // ============================================
    vetRecords: {
        getAll() {
            return _cache.vetRecords;
        },

        getById(id) {
            return _cache.vetRecords.find(r => r.id === id);
        },

        getByDog(dogId) {
            return _cache.vetRecords.filter(r => r.dog_id === dogId);
        },

        getByType(type) {
            return _cache.vetRecords.filter(r => r.type === type);
        },

        getByAnimal(animalId, animalType) {
            if (animalType === 'puppy') {
                return _cache.vetRecords.filter(r => r.puppy_id === animalId);
            }
            return _cache.vetRecords.filter(r => r.dog_id === animalId);
        },

        getExpiringRabies(daysAhead = 60) {
            const now = new Date();
            const future = new Date();
            future.setDate(future.getDate() + daysAhead);

            const homeDogs = _cache.dogs.filter(d => d.location === 'home');
            const results = [];

            for (const dog of homeDogs) {
                const rabiesRecords = _cache.vetRecords
                    .filter(r => r.dog_id === dog.id && r.type === 'rabies')
                    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

                if (rabiesRecords.length > 0) {
                    const latest = rabiesRecords[0];
                    if (latest.expiration_date) {
                        const expDate = new Date(latest.expiration_date);
                        if (expDate <= future) {
                            const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                            results.push({
                                dog,
                                record: latest,
                                expirationDate: expDate,
                                daysUntil,
                                isExpired: daysUntil < 0
                            });
                        }
                    }
                } else {
                    results.push({
                        dog,
                        record: null,
                        expirationDate: null,
                        daysUntil: null,
                        isExpired: false,
                        noRecord: true
                    });
                }
            }

            return results.sort((a, b) => {
                if (a.noRecord) return 1;
                if (b.noRecord) return -1;
                return (a.daysUntil || 999) - (b.daysUntil || 999);
            });
        },

        async save(record) {
            const dbRecord = {
                dog_id: record.dogId,
                type: record.type,
                visit_date: record.visitDate,
                description: record.description,
                vet_name: record.vetName,
                cost: record.cost,
                expiration_date: record.expirationDate,
                document_url: record.documentUrl,
                notes: record.notes
            };

            let result;
            if (record.id) {
                const { data, error } = await supabaseClient
                    .from('vet_records')
                    .update(dbRecord)
                    .eq('id', record.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.vetRecords.findIndex(r => r.id === record.id);
                if (idx >= 0) _cache.vetRecords[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('vet_records')
                    .insert(dbRecord)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.vetRecords.unshift(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('vet_records')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.vetRecords = _cache.vetRecords.filter(r => r.id !== id);
        }
    },

    // ============================================
    // WAITLIST
    // ============================================
    waitlist: {
        getAll() {
            return _cache.waitlist;
        },

        getById(id) {
            return _cache.waitlist.find(w => w.id === id);
        },

        getActive() {
            return _cache.waitlist.filter(w =>
                w.status !== 'cancelled' && w.status !== 'fulfilled'
            );
        },

        getByStatus(status) {
            return _cache.waitlist.filter(w => w.status === status);
        },

        getRecent(count = 10) {
            return [..._cache.waitlist].reverse().slice(0, count);
        },

        search(query) {
            const q = query.toLowerCase();
            return _cache.waitlist.filter(w =>
                (w.first_name && w.first_name.toLowerCase().includes(q)) ||
                (w.last_name && w.last_name.toLowerCase().includes(q)) ||
                (w.email && w.email.toLowerCase().includes(q)) ||
                (w.phone && w.phone.includes(q))
            );
        },

        getStats() {
            const all = _cache.waitlist;
            const withDeposit = all.filter(w => w.deposit_paid);
            const totalDeposits = withDeposit.reduce((sum, w) => sum + (parseFloat(w.deposit_amount) || 0), 0);
            return {
                total: all.length,
                pending: all.filter(w => w.status === 'pending').length,
                active: all.filter(w => w.status === 'active').length,
                fulfilled: all.filter(w => w.status === 'fulfilled').length,
                cancelled: all.filter(w => w.status === 'cancelled').length,
                withDeposit: withDeposit.length,
                totalDeposits: totalDeposits
            };
        },

        getAwaitingDeposit() {
            return _cache.waitlist.filter(w =>
                w.status === 'pending' && !w.deposit_paid
            );
        },

        getPosition(id) {
            const activeEntries = _cache.waitlist
                .filter(w => w.status === 'active' || (w.status === 'pending' && w.deposit_paid))
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const idx = activeEntries.findIndex(w => w.id === id);
            return idx >= 0 ? idx + 1 : null;
        },

        async save(entry) {
            const record = {
                first_name: entry.firstName || entry.first_name,
                last_name: entry.lastName || entry.last_name,
                email: entry.email,
                phone: entry.phone,
                city: entry.city,
                state: entry.state,
                status: entry.status || 'pending',
                selected_breeds: entry.selectedBreeds || entry.selected_breeds || [],
                selected_parents: entry.selectedParents || entry.selected_parents || [],
                preference_type: entry.preferenceType || entry.preference_type,
                gender_preference: entry.genderPreference || entry.genderPref || entry.gender_preference,
                color_preference: entry.colorPreference || entry.colorPref || entry.color_preference,
                size_preference: entry.sizePreference || entry.sizePref || entry.size_preference,
                assigned_litter_id: entry.assignedLitterId || entry.assigned_litter_id,
                deposit_paid: entry.depositPaid || entry.deposit_paid || false,
                deposit_amount: entry.depositAmount || entry.deposit_amount,
                deposit_payment_method: entry.depositPaymentMethod || entry.deposit_payment_method,
                deposit_paid_date: entry.depositPaidDate || entry.deposit_paid_date,
                deposit_transfers: entry.depositTransfers || entry.deposit_transfers || [],
                puppy_id: entry.puppyId || entry.puppy_id,
                fulfilled_date: entry.fulfilledDate || entry.fulfilled_date,
                cancelled_date: entry.cancelledDate || entry.cancelled_date,
                cancellation_reason: entry.cancellationReason || entry.cancellation_reason,
                notes: entry.notes
            };

            let result;
            if (entry.id) {
                const { data, error } = await supabaseClient
                    .from('waitlist')
                    .update(record)
                    .eq('id', entry.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.waitlist.findIndex(w => w.id === entry.id);
                if (idx >= 0) _cache.waitlist[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('waitlist')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.waitlist.push(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('waitlist')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.waitlist = _cache.waitlist.filter(w => w.id !== id);
        },

        async markDepositPaid(id, amount = 300, paymentMethod = '', paymentDate = null) {
            const { data, error } = await supabaseClient
                .from('waitlist')
                .update({
                    deposit_paid: true,
                    deposit_amount: amount,
                    deposit_payment_method: paymentMethod,
                    deposit_paid_date: paymentDate || new Date().toISOString(),
                    status: 'active'
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.waitlist.findIndex(w => w.id === id);
            if (idx >= 0) _cache.waitlist[idx] = data;
            return data;
        },

        async markFulfilled(id, puppyId = null) {
            const { data, error } = await supabaseClient
                .from('waitlist')
                .update({
                    status: 'fulfilled',
                    fulfilled_date: new Date().toISOString(),
                    puppy_id: puppyId
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.waitlist.findIndex(w => w.id === id);
            if (idx >= 0) _cache.waitlist[idx] = data;
            return data;
        },

        async cancel(id, reason = '') {
            const { data, error } = await supabaseClient
                .from('waitlist')
                .update({
                    status: 'cancelled',
                    cancelled_date: new Date().toISOString(),
                    cancellation_reason: reason
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.waitlist.findIndex(w => w.id === id);
            if (idx >= 0) _cache.waitlist[idx] = data;
            return data;
        }
    },

    // ============================================
    // REMINDERS
    // ============================================
    reminders: {
        getAll() {
            return _cache.reminders;
        },

        getById(id) {
            return _cache.reminders.find(r => r.id === id);
        },

        getUpcoming(days = 30) {
            const now = new Date().toISOString().split('T')[0];
            const future = new Date();
            future.setDate(future.getDate() + days);
            const futureStr = future.toISOString().split('T')[0];

            return _cache.reminders.filter(r =>
                r.date >= now && r.date <= futureStr && !r.completed
            );
        },

        async save(reminder) {
            const record = {
                title: reminder.title,
                description: reminder.description,
                date: reminder.date,
                type: reminder.type,
                entity_type: reminder.entityType,
                entity_id: reminder.entityId,
                completed: reminder.completed || false,
                completed_at: reminder.completedAt
            };

            let result;
            if (reminder.id) {
                const { data, error } = await supabaseClient
                    .from('reminders')
                    .update(record)
                    .eq('id', reminder.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.reminders.findIndex(r => r.id === reminder.id);
                if (idx >= 0) _cache.reminders[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('reminders')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.reminders.push(result);
                _cache.reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('reminders')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.reminders = _cache.reminders.filter(r => r.id !== id);
        },

        async markComplete(id) {
            const { data, error } = await supabaseClient
                .from('reminders')
                .update({
                    completed: true,
                    completed_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.reminders.findIndex(r => r.id === id);
            if (idx >= 0) _cache.reminders[idx] = data;
            return data;
        }
    },

    // ============================================
    // FILES
    // ============================================
    files: {
        getAll() {
            return _cache.files;
        },

        getByEntity(entityType, entityId) {
            return _cache.files.filter(f =>
                f.entity_type === entityType && f.entity_id === entityId
            );
        },

        async save(file) {
            const record = {
                entity_type: file.entityType,
                entity_id: file.entityId,
                file_name: file.fileName,
                file_url: file.fileUrl,
                file_type: file.fileType,
                file_size: file.fileSize,
                notes: file.notes
            };

            const { data, error } = await supabaseClient
                .from('files')
                .insert(record)
                .select()
                .single();
            if (error) throw error;
            _cache.files.unshift(data);
            return data;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('files')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.files = _cache.files.filter(f => f.id !== id);
        }
    },

    // ============================================
    // TESTIMONIALS
    // ============================================
    testimonials: {
        getAll() {
            return _cache.testimonials;
        },

        getById(id) {
            return _cache.testimonials.find(t => t.id === id);
        },

        getPublic() {
            return _cache.testimonials.filter(t => t.is_public);
        },

        getFeatured() {
            return _cache.testimonials.filter(t => t.is_public && t.is_featured);
        },

        async save(testimonial) {
            const record = {
                customer_id: testimonial.customerId || null,
                puppy_id: testimonial.puppyId || null,
                customer_name: testimonial.customerName || '',
                puppy_name: testimonial.puppyName || '',
                content: testimonial.content || '',
                rating: testimonial.rating || 5,
                is_public: testimonial.isPublic !== undefined ? testimonial.isPublic : false,
                is_featured: testimonial.isFeatured !== undefined ? testimonial.isFeatured : false,
                display_order: testimonial.displayOrder || 0,
                photo_url: testimonial.photoUrl || ''
            };

            let result;
            if (testimonial.id) {
                const { data, error } = await supabaseClient
                    .from('testimonials')
                    .update(record)
                    .eq('id', testimonial.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.testimonials.findIndex(t => t.id === testimonial.id);
                if (idx >= 0) _cache.testimonials[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('testimonials')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.testimonials.unshift(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('testimonials')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.testimonials = _cache.testimonials.filter(t => t.id !== id);
        }
    },

    // ============================================
    // GALLERY
    // ============================================
    gallery: {
        getAll() {
            return _cache.gallery;
        },

        getById(id) {
            return _cache.gallery.find(g => g.id === id);
        },

        getPublic() {
            return _cache.gallery.filter(g => g.is_public);
        },

        async save(item) {
            const record = {
                customer_id: item.customerId,
                puppy_id: item.puppyId,
                title: item.title,
                description: item.description,
                image_url: item.imageUrl,
                is_public: item.isPublic !== false,
                display_order: item.displayOrder || 0
            };

            let result;
            if (item.id) {
                const { data, error } = await supabaseClient
                    .from('gallery')
                    .update(record)
                    .eq('id', item.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.gallery.findIndex(g => g.id === item.id);
                if (idx >= 0) _cache.gallery[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('gallery')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.gallery.unshift(result);
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('gallery')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.gallery = _cache.gallery.filter(g => g.id !== id);
        }
    },

    // ============================================
    // FAQ
    // ============================================
    faq: {
        getAll() {
            return _cache.faq;
        },

        getById(id) {
            return _cache.faq.find(f => f.id === id);
        },

        getPublic() {
            return _cache.faq.filter(f => f.is_public);
        },

        getByCategory(category) {
            return _cache.faq.filter(f => f.category === category);
        },

        getCategories() {
            return [...new Set(_cache.faq.map(f => f.category).filter(Boolean))];
        },

        async save(faqItem) {
            const record = {
                question: faqItem.question,
                answer: faqItem.answer,
                category: faqItem.category,
                display_order: faqItem.displayOrder || 0,
                is_public: faqItem.isPublic === true
            };

            let result;
            if (faqItem.id) {
                const { data, error } = await supabaseClient
                    .from('faq')
                    .update(record)
                    .eq('id', faqItem.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                const idx = _cache.faq.findIndex(f => f.id === faqItem.id);
                if (idx >= 0) _cache.faq[idx] = result;
            } else {
                const { data, error } = await supabaseClient
                    .from('faq')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
                _cache.faq.push(result);
                _cache.faq.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            }
            return result;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('faq')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.faq = _cache.faq.filter(f => f.id !== id);
        }
    },

    // ============================================
    // SETTINGS
    // ============================================
    settings: {
        get() {
            return _cache.settings;
        },

        async save(settings) {
            const record = {
                business_name: settings.businessName,
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                instagram: settings.instagram,
                tiktok: settings.tiktok,
                facebook: settings.facebook,
                site_content: settings.siteContent
            };

            let result;
            if (_cache.settings.id) {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .update(record)
                    .eq('id', _cache.settings.id)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            } else {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .insert(record)
                    .select()
                    .single();
                if (error) throw error;
                result = data;
            }
            _cache.settings = result;
            return result;
        }
    },

    // ============================================
    // SITE CONTENT (stored in settings.site_content)
    // ============================================
    siteContent: {
        get() {
            return _cache.settings.site_content || this.getDefault();
        },

        async save(content) {
            const settings = _cache.settings;
            settings.site_content = content;
            await DB.settings.save({
                ...settings,
                siteContent: content
            });
        },

        getSection(section) {
            const content = this.get();
            return content[section] || {};
        },

        async saveSection(section, data) {
            const content = this.get();
            content[section] = data;
            await this.save(content);
        },

        getDefault() {
            return {
                business: {
                    name: 'SACC Doodles',
                    tagline: 'Quality Bred Puppies',
                    phone: '480-822-8443',
                    email: 'mizzteachout@gmail.com',
                    location: 'Gilbert, Arizona'
                },
                homepage: {
                    heroTitle: 'SACC Doodles',
                    heroSubtitle: 'Raising healthy, happy, and well-socialized puppies with love'
                },
                about: {
                    breederName: 'Angela',
                    shortBio: "Welcome to SACC Doodles! I'm Angela, and I'm the heart behind this breeding program."
                }
            };
        }
    },

    // ============================================
    // BIRTHDAYS (calculated from dogs/puppies)
    // ============================================
    birthdays: {
        getUpcoming(days = 30) {
            const now = new Date();
            const results = [];

            for (const dog of _cache.dogs.filter(d => d.birthday)) {
                const birthday = new Date(dog.birthday);
                const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
                if (thisYearBirthday < now) {
                    thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
                }
                const daysUntil = Math.ceil((thisYearBirthday - now) / (1000 * 60 * 60 * 24));
                if (daysUntil <= days) {
                    results.push({
                        type: 'dog',
                        entity: dog,
                        date: thisYearBirthday,
                        daysUntil,
                        age: thisYearBirthday.getFullYear() - birthday.getFullYear()
                    });
                }
            }

            for (const puppy of _cache.puppies.filter(p => p.birthday)) {
                const birthday = new Date(puppy.birthday);
                const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
                if (thisYearBirthday < now) {
                    thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
                }
                const daysUntil = Math.ceil((thisYearBirthday - now) / (1000 * 60 * 60 * 24));
                if (daysUntil <= days) {
                    const customer = _cache.customers.find(c => c.id === puppy.customer_id);
                    results.push({
                        type: 'puppy',
                        entity: puppy,
                        date: thisYearBirthday,
                        daysUntil,
                        age: thisYearBirthday.getFullYear() - birthday.getFullYear(),
                        customer
                    });
                }
            }

            return results.sort((a, b) => a.daysUntil - b.daysUntil);
        }
    },

    // ============================================
    // GUARDIAN APPLICATIONS
    // ============================================
    guardianApplications: {
        getAll() {
            return _cache.guardianApplications;
        },

        getById(id) {
            return _cache.guardianApplications.find(a => a.id === id);
        },

        getByStatus(status) {
            return _cache.guardianApplications.filter(a => a.status === status);
        },

        getPending() {
            return _cache.guardianApplications.filter(a => a.status === 'Pending');
        },

        getRecent(count = 10) {
            return _cache.guardianApplications.slice(0, count);
        },

        getStats() {
            const all = _cache.guardianApplications;
            return {
                total: all.length,
                pending: all.filter(a => a.status === 'Pending').length,
                approved: all.filter(a => a.status === 'Approved').length,
                rejected: all.filter(a => a.status === 'Rejected').length,
                contacted: all.filter(a => a.status === 'Contacted').length
            };
        },

        async updateStatus(id, status) {
            const { data, error } = await supabaseClient
                .from('guardian_applications')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.guardianApplications.findIndex(a => a.id === id);
            if (idx >= 0) _cache.guardianApplications[idx] = data;
            return data;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('guardian_applications')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.guardianApplications = _cache.guardianApplications.filter(a => a.id !== id);
        }
    },

    // ============================================
    // CONTACT SUBMISSIONS
    // ============================================
    contactSubmissions: {
        getAll() {
            return _cache.contactSubmissions;
        },

        getById(id) {
            return _cache.contactSubmissions.find(s => s.id === id);
        },

        getUnread() {
            return _cache.contactSubmissions.filter(s => !s.read);
        },

        getRecent(count = 10) {
            return _cache.contactSubmissions.slice(0, count);
        },

        getStats() {
            const all = _cache.contactSubmissions;
            return {
                total: all.length,
                unread: all.filter(s => !s.read).length,
                read: all.filter(s => s.read).length
            };
        },

        async markRead(id) {
            const { data, error } = await supabaseClient
                .from('contact_submissions')
                .update({ read: true })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.contactSubmissions.findIndex(s => s.id === id);
            if (idx >= 0) _cache.contactSubmissions[idx] = data;
            return data;
        },

        async markUnread(id) {
            const { data, error } = await supabaseClient
                .from('contact_submissions')
                .update({ read: false })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            const idx = _cache.contactSubmissions.findIndex(s => s.id === id);
            if (idx >= 0) _cache.contactSubmissions[idx] = data;
            return data;
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('contact_submissions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            _cache.contactSubmissions = _cache.contactSubmissions.filter(s => s.id !== id);
        }
    },

    // ============================================
    // HEAT CYCLE CALCULATOR
    // ============================================
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
    }
};

// Export for global access
window.DB = DB;
