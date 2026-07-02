const app = {
    state: {
        players: [],
        matches: [],
        currentEvents: [],
        rosterPlayers: [],
        news: [],
        media: [],
        teamMetrics: {},
        currentUser: null,
    },

    init: async function() {
        const isAuthenticated = await this.auth.check();
        // If check() returns true, it means we are authenticated but still on the login page.
        // We must stop execution here to allow the redirect to admin.html to complete.
        if (isAuthenticated) return;

        await this.data.loadAll();
        this.events.bind();
        this.ui.applyRolePermissions();
        this.ui.renderAll();
        this.ui.populateTeamMetricsForm();
        this.ui.updateDashboard();
        this.ui.loadAdminStandings();
    },

    // =================================================================
    // AUTH MODULE
    // =================================================================
    auth: {
        check: function() {
            return new Promise((resolve) => {
                let settled = false;

                const finish = (value) => {
                    if (!settled) {
                        settled = true;
                        resolve(value);
                    }
                };

                // Use onAuthStateChanged for real-time auth state monitoring
                firebase.auth().onAuthStateChanged(async (user) => {
                    if (settled) return;

                    if (user) {
                        // User is signed in. Fetch their custom data from Firestore.
                        try {
                            const userDoc = await window.db.collection('users').doc(user.uid).get();
                            if (userDoc.exists) {
                                app.state.currentUser = {
                                    uid: user.uid,
                                    email: user.email,
                                    ...userDoc.data() // Merges name, role, etc.
                                };

                                // Defensive check: If role is missing, default to a safe value.
                                if (!app.state.currentUser.role) {
                                    console.warn(`User ${user.email} is missing a 'role' in their Firestore profile. Defaulting to 'Guest'.`);
                                    alert(`Warning: The user '${user.email}' is missing a 'role' in their database profile. Access will be limited.`);
                                    app.state.currentUser.role = 'Guest';
                                }

                                // Update UI and redirect if necessary
                                const nameEl = document.getElementById('sessionUserName');
                                const roleEl = document.getElementById('sessionUserRole');
                                if (nameEl) nameEl.textContent = app.state.currentUser.name;
                                if (roleEl) roleEl.textContent = `Role: ${app.state.currentUser.role}`;

                                // If user is on login page, redirect them to admin dashboard
                                if (window.location.pathname.includes('login.html')) {
                                    window.location.replace('admin.html');
                                    finish(true);
                                    return;
                                }

                                finish(false);
                            } else {
                                throw new Error("User profile not found in database.");
                            }
                        } catch (error) {
                            console.error("Auth check failed:", error);
                            this.logout();
                            finish(true);
                        }
                    } else {
                        // User is not signed in. Redirect to login page.
                        if (!window.location.pathname.includes('login.html')) {
                            window.location.replace('login.html');
                        }
                        finish(true);
                    }
                });

                setTimeout(() => {
                    if (!settled && window.location.pathname.includes('login.html')) {
                        finish(true);
                    }
                }, 4000);
            });
        },
        logout: async function() {
            try {
                await firebase.auth().signOut();
                window.location.href = "index.html"; // Redirects to site home page on success
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
    },

    utils: {
        normalizeMediaType: function(type) {
            const raw = type ? type.toString().trim().toLowerCase() : '';
            return raw === 'video' ? 'video' : 'image';
        },

        normalizeMediaCategory: function(category) {
            const raw = category ? category.toString().trim().toLowerCase().replace(/\s+/g, ' ') : '';
            const mapping = {
                '2026 season': 'newseason',
                'new season': 'newseason',
                'newseason': 'newseason',
                'season': 'newseason',
                'matchday': 'matchday',
                'match day': 'matchday',
                'match': 'matchday',
                'champions': 'champions',
                'champion': 'champions',
                'celebration': 'champions',
                'victory': 'champions',
                'trophy': 'champions'
            };
            return mapping[raw] || raw;
        }
    },

    // =================================================================
    // DATA MODULE
    // =================================================================
    data: {
        loadAll: async function() {
            const [players, matches, news, media] = await Promise.all([
                this.loadCollection('players', 'adminPlayers'),
                this.loadCollection('matches', 'adminMatches'),
                this.loadCollection('news', 'adminNews'),
                this.loadCollection('media', 'adminMedia')
            ]);

            // With Firebase as the source of truth, we no longer need to merge with local files.
            app.state.players = players;
            app.state.matches = matches;
            app.state.news = news;
            app.state.media = media.map(item => ({
                ...item,
                type: app.utils.normalizeMediaType(item.type),
                category: app.utils.normalizeMediaCategory(item.category)
            }));
            
            // Ensure media is synced to localStorage for gallery/videos pages
            localStorage.setItem('adminMedia', JSON.stringify(app.state.media));
            
            app.state.teamMetrics = await this.loadTeamMetrics();
            await this.loadRosterPlayers();
        },

        loadCollection: async function(collectionName, localKey) {
            if (window.db) {
                try {
                    const snapshot = await window.db.collection(collectionName).get();
                    return snapshot.docs.map(doc => doc.data());
                } catch (e) {
                    return JSON.parse(localStorage.getItem(localKey)) || [];
                }
            }
            return JSON.parse(localStorage.getItem(localKey)) || [];
        },

        getMergedMatches: async function(adminMatches) {
            // This function is deprecated in favor of a direct Firebase read.
            return adminMatches;
        },

        loadTeamMetrics: async function() {
            let metrics = {};

            if (window.db) {
                try {
                    const doc = await window.db.collection('settings').doc('teamMetrics').get();
                    if (doc.exists) {
                        const raw = doc.data();
                        if (raw && typeof raw === 'object') {
                            metrics = raw;
                        } else if (raw && typeof raw.data === 'string') {
                            metrics = JSON.parse(raw.data);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load team metrics from Firebase:', e);
                }
            }

            if (!metrics || typeof metrics !== 'object' || !Object.keys(metrics).length) {
                try {
                    const saved = localStorage.getItem('teamMetrics');
                    if (saved) metrics = JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to load saved team metrics from localStorage:', e);
                }
            }

            return metrics || {};
        },

        loadRosterPlayers: async function() {
            let merged = [];
            if (typeof getMergedPlayers === 'function') {
                merged = getMergedPlayers();
            } else {
                merged = app.state.players;
            }
            app.state.rosterPlayers = merged.map(p => ({ id: p.id, name: p.name }));
        },

        addOrUpdateRosterPlayer: function(player) {
            const idx = app.state.rosterPlayers.findIndex(r => r.id === player.id || r.name === player.name);
            if (idx > -1) { app.state.rosterPlayers[idx] = { id: player.id, name: player.name }; }
            else { app.state.rosterPlayers.push({ id: player.id, name: player.name }); }
        }
    },

    // =================================================================
    // EVENT & FORM BINDINGS MODULE
    // =================================================================
    events: {
        bind: function() {
            document.getElementById("playerForm")?.addEventListener("submit", this.handlePlayerFormSubmit);
            document.getElementById("matchForm")?.addEventListener("submit", this.handleMatchFormSubmit);
            document.getElementById("teamMetricsForm")?.addEventListener("submit", this.handleTeamMetricsSubmit);
            document.getElementById("standingsFileInput")?.addEventListener("change", this.handleStandingsUpload);
            document.getElementById("resultsFileInput")?.addEventListener("change", this.handleResultsUpload);
            document.getElementById("newsForm")?.addEventListener("submit", this.handleNewsFormSubmit);
            document.getElementById("mediaForm")?.addEventListener("submit", this.handleMediaFormSubmit);
            document.querySelector('.btn-logout')?.addEventListener('click', () => app.auth.logout());
            document.getElementById("eventType")?.addEventListener('change', app.ui.toggleAssistField);
        },
        
        handleTeamMetricsSubmit: async function(e) {
            e.preventDefault();
            const metrics = {
                shots: Number(document.getElementById('teamMetricsShots').value) || 0,
                shotsOnTarget: Number(document.getElementById('teamMetricsShotsOnTarget').value) || 0,
                chancesCreated: Number(document.getElementById('teamMetricsChancesCreated').value) || 0,
                tackles: Number(document.getElementById('teamMetricsTackles').value) || 0,
                interceptions: Number(document.getElementById('teamMetricsInterceptions').value) || 0,
                recoveries: Number(document.getElementById('teamMetricsRecoveries').value) || 0,
            };

            localStorage.setItem('teamMetrics', JSON.stringify(metrics));
            if (window.db) {
                try {
                    await window.db.collection('settings').doc('teamMetrics').set(metrics, { merge: true });
                } catch (err) {
                    console.error('Firebase save team metrics failed:', err);
                    alert('Failed to save team metrics to Firebase.');
                    return;
                }
            }

            app.state.teamMetrics = metrics;
            alert('Team metrics saved successfully.');
        },

        handlePlayerFormSubmit: async function(e) {
            e.preventDefault();
            const id = document.getElementById("playerId").value || Date.now();
            const player = {
                id:          Number(id),
                name:        document.getElementById("playerName").value,
                nickname:    document.getElementById("playerNickname").value || '',
                position:    document.getElementById("playerPosition").value || 'Forward',
                number:      Number(document.getElementById("playerNumber").value) || null,
                playerImage: document.getElementById("playerImage").value || 'images/idris.jpg',
                goals:       Number(document.getElementById("playerGoals").value) || 0,
                assists:     Number(document.getElementById("playerAssists").value) || 0,
                cleansheets: Number(document.getElementById("playerCleanSheets").value) || 0,
                shots:             Number(document.getElementById("playerShots").value) || 0,
                shotsOnTarget:     Number(document.getElementById("playerShotsOnTarget").value) || 0,
                chancesCreated:    Number(document.getElementById("playerChancesCreated").value) || 0,
                tackles:           Number(document.getElementById("playerTackles").value) || 0,
                interceptions:     Number(document.getElementById("playerInterceptions").value) || 0,
                recoveries:        0 // This field is not in the form, so we default it.
            };

            if (window.db) {
                try {
                    await window.db.collection('players').doc(player.id.toString()).set(player, { merge: true });
                } catch (err) {
                    console.error("Firebase save player failed:", err);
                    alert("Error saving player to database.");
                    return;
                }
            }

            const idx = app.state.players.findIndex(p => p.id === player.id);
            if (idx > -1) app.state.players[idx] = player; else app.state.players.push(player);
            
            app.data.addOrUpdateRosterPlayer(player);
            e.target.reset();
            document.getElementById("playerId").value = "";
            app.ui.renderPlayers();
            app.ui.populatePlayerDropdown();
            app.ui.updateDashboard();
        },        

        handleMatchFormSubmit: async function(e) {
            e.preventDefault();
            const matchId = document.getElementById("matchId").value || Date.now().toString();
            const match = {
                id:        document.getElementById("matchId").value || Date.now(),
                homeTeam:  document.getElementById("homeTeam").value,
                awayTeam:  document.getElementById("awayTeam").value,
                date:      document.getElementById("matchDate").value,
                time:      document.getElementById("matchTime").value,
                venue:     document.getElementById("matchVenue").value,
                status:    document.getElementById("matchStatus").value,
                homeScore: document.getElementById("homeScore").value,
                awayScore: document.getElementById("awayScore").value,
                events:    [...app.state.currentEvents]
            };

            if (match.status === 'completed' && (match.homeScore === '' || match.awayScore === '')) {
                alert('Add both home and away scores before saving a completed match.');
                return;
            }

            if (window.db) {
                try {
                    await window.db.collection('matches').doc(matchId).set(match);
                } catch (err) {
                    console.error("Firebase save match failed:", err);
                    alert("Error saving match to database.");
                    return;
                }
            }

            const idx = app.state.matches.findIndex(m => m.id == match.id);
            if (idx > -1) {
                app.stats.revert(app.state.matches[idx]);
                app.state.matches[idx] = match;
            } else {
                app.state.matches.push(match);
            }

            if (match.status === 'completed') { app.stats.update(match.events); }

            e.target.reset();
            app.state.currentEvents = [];
            app.ui.renderEventList();
            app.ui.renderMatches();
            app.ui.updateDashboard();
        },

        handleNewsFormSubmit: async function(e) {
            e.preventDefault();
            const article = {
                id: document.getElementById("articleId").value || Date.now().toString(),
                title: document.getElementById("articleTitle").value,
                subtitle: document.getElementById("articleSubtitle").value,
                tag: document.getElementById("articleTag").value,
                tagColor: document.getElementById("articleTagColor").value,
                image: document.getElementById("articleImage").value,
                content: document.getElementById("articleContent").value,
                date: new Date().toISOString()
            };

            if (window.db) {
                try {
                    await window.db.collection('news').doc(article.id).set(article);
                } catch (err) {
                    console.error("Firebase save news failed:", err);
                    alert("Error saving article to database.");
                    return;
                }
            }

            const idx = app.state.news.findIndex(a => a.id == article.id);
            if (idx > -1) {
                app.state.news[idx] = article;
            } else {
                app.state.news.unshift(article);
            }
            e.target.reset();
            app.ui.renderNews();
        },

        handleMediaFormSubmit: async function(e) {
            e.preventDefault();
            const rawType = document.getElementById("mediaType").value;
            const rawCategory = document.getElementById("mediaCategory").value;
            const mediaType = app.utils.normalizeMediaType(rawType);
            const mediaCategory = app.utils.normalizeMediaCategory(rawCategory);

            if (!mediaCategory) {
                alert("Please provide a valid media category. Suggested options: newseason, matchday, champions.");
                return;
            }

            const mediaItem = {
                id: document.getElementById("mediaId").value || Date.now().toString(),
                type: mediaType,
                category: mediaCategory,
                url: document.getElementById("mediaUrl").value,
                title: document.getElementById("mediaTitle").value,
            };

            if (window.db) {
                try {
                    await window.db.collection('media').doc(mediaItem.id).set(mediaItem);
                } catch (err) {
                    console.error("Firebase save media failed:", err);
                    alert("Error saving media to database.");
                    return;
                }
            }

            const idx = app.state.media.findIndex(m => m.id == mediaItem.id);
            if (idx > -1) {
                app.state.media[idx] = mediaItem;
            } else {
                app.state.media.unshift(mediaItem);
            }
            
            // Save media to localStorage
            localStorage.setItem('adminMedia', JSON.stringify(app.state.media));
            
            e.target.reset();
            app.ui.renderMedia();
        },

        handleStandingsUpload: function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                let parsed = null;

                if (file.type.includes('json') || file.name.toLowerCase().endsWith('.json')) {
                    try {
                        let rawParsed = JSON.parse(text);
                        // If the user uploads a simple array of arrays, convert it to the expected format.
                        if (Array.isArray(rawParsed) && Array.isArray(rawParsed[0])) {
                            parsed = {
                                headers: ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "PTS"],
                                rows: rawParsed
                            };
                        } else {
                            parsed = rawParsed; // Assume it's already in the {headers, rows} format
                        }
                    } catch { parsed = null; }
                } else {
                    parsed = app.ui.parseStandingText(text);
                }

                if (parsed && parsed.headers && parsed.rows) {
                    localStorage.setItem('leagueStandingsJson', JSON.stringify(parsed));
                    if (window.db) {
                        try {
                            await window.db.collection('settings').doc('standings').set({ data: JSON.stringify(parsed) });
                        } catch (e) { console.error('Firebase save standings failed:', e); }
                    }
                    app.ui.renderStandingsPreview(parsed);
                    app.ui.loadStandingsToEditor(parsed);
                    alert('Standings loaded and applied to the visual editor.');
                } else {
                    alert('Unable to parse the standings file. Please use a clean plain table format or JSON.');
                }
            };
            reader.readAsText(file);
        },

        handleResultsUpload: function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                let parsed = null;

                if (file.type.includes('json') || file.name.toLowerCase().endsWith('.json')) {
                    try {
                        const rawParsed = JSON.parse(text);
                        // Accept both { matches: [...] } and plain array
                        if (rawParsed && Array.isArray(rawParsed.matches)) parsed = rawParsed;
                        else if (Array.isArray(rawParsed)) parsed = { matches: rawParsed };
                        else parsed = null;
                    } catch (err) { parsed = null; }
                }

                if (parsed && Array.isArray(parsed.matches)) {
                    localStorage.setItem('resultsJson', JSON.stringify(parsed));
                    if (window.db) {
                        try {
                            await window.db.collection('settings').doc('results').set({ data: JSON.stringify(parsed) });
                            alert('results.json saved to Firebase and localStorage.');
                        } catch (e) {
                            console.error('Firebase save results failed:', e);
                            alert('results.json saved to localStorage, but saving to Firebase failed.');
                        }
                    } else {
                        alert('results.json saved to localStorage.');
                    }
                } else {
                    alert('Unable to parse results file. Ensure it is a JSON object with a "matches" array or a raw array of match objects.');
                }
            };
            reader.readAsText(file);
        },

        addMatchEvent: function() {
            const player = document.getElementById("eventPlayer").value;
            const type = document.getElementById("eventType").value;
            const assist = document.getElementById("eventAssist")?.value || '';
            const team = document.getElementById("eventTeam").value;
            const minute = document.getElementById("eventMinute").value;

            if (!player) { alert("Select a player"); return; }
            if (type === 'goal' && assist && assist === player) {
                alert('Scorer and assistant must be different players.');
                return;
            }

            const event = { type, team, player, minute };
            if (type === 'goal' && assist) { event.assist = assist; }
            app.state.currentEvents.push(event);
            app.ui.renderEventList();
        },

        removeMatchEvent: function(i) {
            if (confirm('Are you sure you want to remove this match event?')) {
                app.state.currentEvents.splice(i, 1);
                app.ui.renderEventList();
            }
        }
    },

    // =================================================================
    // UI & RENDER MODULE
    // =================================================================
    ui: {
        userHasPermission: function(requiredRoles) {
            const userRole = app.state.currentUser?.role;
            if (!userRole) return false;
            if (requiredRoles.includes(userRole)) {
                return true;
            }
            return false;
        },

        applyRolePermissions: function() {
            const role = app.state.currentUser?.role;

            document.querySelectorAll('[data-permission]').forEach(el => {
                const requiredRoles = el.getAttribute('data-permission').split(',');
                if (!this.userHasPermission(requiredRoles)) {
                    el.setAttribute('disabled', 'true');
                    el.style.pointerEvents = 'none';
                    el.style.opacity = '0.6';
                }
            });

            // Special handling for CEO (view-only)
            if (role === 'CEO') {
                document.querySelectorAll('.admin-form button[type="submit"]').forEach(btn => btn.style.display = 'none');
                document.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea').forEach(input => input.setAttribute('disabled', 'true'));
                const banner = document.getElementById('ceoReadOnlyMsg');
                if(banner) banner.style.display = 'block';
            }

            // Re-render lists to show/hide action buttons based on role
            this.renderPlayers();
            this.renderMatches();
            this.renderNews();
            this.renderMedia();
        },

        renderAll: function() {
            this.renderPlayers();
            this.renderMatches();
            this.renderNews();
            this.renderMedia();
            this.populatePlayerDropdown();
            this.populateTeamMetricsForm();
        },

        renderPlayers: function() {
            const container = document.getElementById("playersList");
            if (!container) return;

            const players = app.state.players;
            const canEdit = this.userHasPermission(['Admin', 'Coach']);
            const canDelete = this.userHasPermission(['Admin']);

            const positionOrder = { Forward: 1, Midfielder: 2, Defender: 3, Goalkeeper: 4 };
            const sorted = [...players].sort((a, b) =>
                (positionOrder[a.position] || 9) - (positionOrder[b.position] || 9)
            );

            if (players.length === 0) {
                container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No squad entries detected.</p>';
                return;
            }

            const buildCard = (p) => {
                const displayName = p.nickname || p.name;
                const img = p.playerImage || p.image || '';
                const thumb = img
                    ? `<img src="${img}" alt="${p.name}">`
                    : `<div class="player-initials">${displayName.substring(0,3)}</div>`;

                const editBtn = canEdit
                    ? `<button class="btn-edit" onclick="window.app.ui.editPlayer(${p.id})"><i class="fa-solid fa-pen"></i> EDIT</button>`
                    : '';
                const deleteBtn = canDelete
                    ? `<button class="btn-delete" onclick="window.app.ui.deletePlayer(${p.id})"><i class="fa-solid fa-trash"></i></button>`
                    : '';

                return `
                    <div class="admin-player-card">
                        <div class="player-thumb">${thumb}</div>
                        <div class="player-details">
                            <strong title="${p.name}">${displayName}</strong>
                            <span>#${p.number || '—'} · ${p.position || 'Forward'}</span>
                        </div>
                        <div class="card-actions">${editBtn} ${deleteBtn}</div>
                    </div>`;
            };

            container.innerHTML = `<div class="admin-players-grid">${sorted.map(buildCard).join('')}</div>`;
        },

        renderMatches: function() {
            const container = document.getElementById("matchesList");
            if (!container) return;
            const canEdit = this.userHasPermission(['Admin', 'Coach']);
            const canDelete = this.userHasPermission(['Admin']);

            if (app.state.matches.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No matches registered.</p>`;
                return;
            }

            const sortedMatches = [...app.state.matches].sort((a, b) => {
                const aDate = Date.parse(a.date);
                const bDate = Date.parse(b.date);
                const aTime = Number.isNaN(aDate) ? Infinity : aDate;
                const bTime = Number.isNaN(bDate) ? Infinity : bDate;
                if (aTime === bTime) return 0;
                return aTime - bTime;
            });

            container.innerHTML = sortedMatches.map(m => {
                const completed = m.status === 'completed';
                const score = completed ? `${m.homeScore} – ${m.awayScore}` : 'Upcoming';
                const scoreClass = completed ? '' : 'match-card__score--upcoming';
                return `
                    <div class="match-card">
                        <div class="match-card__info">
                            <div class="match-card__competition">
                                <i class="ti ti-trophy" aria-hidden="true"></i> LEAGUE
                            </div>
                            <p class="match-card__title">${m.homeTeam} vs ${m.awayTeam}</p>
                            <div class="match-card__meta">
                                <span class="match-card__meta-item">
                                    <i class="ti ti-calendar" aria-hidden="true"></i> ${m.date || 'No date'}
                                </span>
                                <span class="match-card__meta-item">
                                    <i class="ti ti-map-pin" aria-hidden="true"></i> ${m.venue || 'No venue'}
                                </span>
                            </div>
                            <div class="match-card__result">
                                <span class="match-card__score ${scoreClass}">${score}</span>
                            </div>
                        </div>
                        <div class="match-card__actions">
                            ${canEdit ? `<button class="match-card__btn match-card__btn--edit" onclick="window.app.ui.editMatch(${m.id})">
                                <i class="ti ti-edit" aria-hidden="true"></i> Edit
                            </button>` : ''}
                            ${canDelete ? `<button class="match-card__btn match-card__btn--delete" onclick="window.app.ui.deleteMatch(${m.id})">
                                <i class="ti ti-trash" aria-hidden="true"></i> Delete
                            </button>` : ''}
                        </div>
                    </div>
                `;
            }).join("");
        },

        deleteMatch: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete matches.");
                return;
            }
            if (!confirm('Are you sure you want to delete this match? This will also revert any associated goals and assists from the players roster.')) return;
            const idx = app.state.matches.findIndex(m => m.id == id);
            if (idx > -1) {
                const match = app.state.matches[idx];
                if (match.status === 'completed') {
                    app.stats.revert(match);
                }

                if (window.db) {
                    try {
                        await window.db.collection('matches').doc(id.toString()).delete();
                    } catch(err) {
                        console.error("Firebase delete match failed:", err);
                        alert("Error deleting match from database.");
                        return;
                    }
                }

                app.state.matches.splice(idx, 1);
                this.renderMatches();
                this.updateDashboard();
            }
        },

        renderNews: function() {
            const container = document.getElementById("newsList");
            if (!container) return;
            const canEdit = this.userHasPermission(['Admin', 'Logistics']);
            const canDelete = this.userHasPermission(['Admin']);

            const sortedNews = [...app.state.news].sort((a, b) => new Date(b.date) - new Date(a.date));

            if (sortedNews.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No news articles published yet.</p>`;
                return;
            }

            container.innerHTML = sortedNews.map(article => {
                const date = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <div class="admin-list-item">
                        <div class="admin-list-item-info">
                            <strong>${article.title}</strong>
                            <span>Published on ${date} · Tag: ${article.tag || 'None'}</span>
                        </div>
                        ${ (canEdit || canDelete) ? `
                            <div class="admin-list-actions">
                                ${canEdit ? `<button class="btn-edit" onclick="window.app.ui.editNews('${article.id}')">
                                    <i class="fa-solid fa-pen"></i> Edit
                                </button>` : ''}
                                ${canDelete ? `<button class="btn-delete" onclick="window.app.ui.deleteNews('${article.id}')">
                                    <i class="fa-solid fa-trash"></i> Delete
                                </button>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join("");
        },

        renderMedia: function() {
            const container = document.getElementById("mediaList");
            if (!container) return;
            const canEdit = this.userHasPermission(['Admin', 'Logistics']);
            const canDelete = this.userHasPermission(['Admin']);

            if (app.state.media.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No media assets added yet.</p>`;
                return;
            }
            container.innerHTML = app.state.media.map(item => {
                const isVideo = item.type === 'video';
                const thumbUrl = isVideo
                    ? `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`
                    : item.url;

                return `
                    <div class="admin-list-item">
                        <div class="admin-list-item-info media-item-info">
                            <div class="media-thumb">
                                <img src="${thumbUrl}" alt="Thumbnail" loading="lazy">
                                ${isVideo ? '<i class="fa-brands fa-youtube"></i>' : ''}
                            </div>
                            <div>
                                <strong>${item.title}</strong>
                                <span>Type: ${item.type} · Category: ${item.category || 'None'}</span>
                            </div>
                        </div>
                        ${ (canEdit || canDelete) ? `
                            <div class="admin-list-actions">
                                ${canEdit ? `<button class="btn-edit" onclick="window.app.ui.editMedia('${item.id}')">
                                    <i class="fa-solid fa-pen"></i> Edit
                                </button>` : ''}
                                ${canDelete ? `<button class="btn-delete" onclick="window.app.ui.deleteMedia('${item.id}')">
                                    <i class="fa-solid fa-trash"></i> Delete
                                </button>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join("");
        },

        renderEventList: function() {
            const list = document.getElementById("eventList");
            if (!list) return;
            if (app.state.currentEvents.length === 0) {
                list.innerHTML = `<p style="color:var(--muted);font-size:0.82rem;padding:6px 0;">No events logged.</p>`;
                return;
            }

            list.innerHTML = app.state.currentEvents.map((e, i) => {
                const badgeClass = e.type === 'goal' ? 'event-badge-goal'
                                 : e.type === 'yellow_card' ? 'event-badge-yellow'
                                 : 'event-badge-red';
                const label = e.type === 'goal' ? 'Goal' : e.type === 'yellow_card' ? 'Yellow' : 'Red';
                const detail = e.type === 'goal' && e.assist
                    ? `${e.player} (assist: ${e.assist})`
                    : e.player;

                return `
                    <div class="event-item">
                        <div class="event-item-left">
                            <span class="event-badge ${badgeClass}">${label}</span>
                            <span>${detail}</span>
                            ${e.minute ? `<span style="color:var(--muted);font-size:0.8rem;">${e.minute}'</span>` : ''}
                            <span style="color:var(--muted);font-size:0.78rem;">(${e.team})</span>
                        </div>
                        <button type="button" class="btn-remove-event" onclick="window.app.events.removeMatchEvent(${i})">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
            }).join("");
        },

        populateTeamMetricsForm: function() {
            const metrics = app.state.teamMetrics || {};
            const fieldMap = {
                shots: 'teamMetricsShots',
                shotsOnTarget: 'teamMetricsShotsOnTarget',
                chancesCreated: 'teamMetricsChancesCreated',
                tackles: 'teamMetricsTackles',
                interceptions: 'teamMetricsInterceptions',
                recoveries: 'teamMetricsRecoveries'
            };

            Object.entries(fieldMap).forEach(([key, id]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = metrics[key] ?? 0;
                }
            });
        },

        populatePlayerDropdown: function() {
            const playerSelect = document.getElementById("eventPlayer");
            const assistSelect = document.getElementById("eventAssist");
            if (!playerSelect) return;
            const source = app.state.rosterPlayers.length ? app.state.rosterPlayers : app.state.players;
            const options = [`<option value="">Select player</option>`].concat(
                source.map(p => `<option value="${p.name}">${p.name}</option>`)
            );
            playerSelect.innerHTML = options.join("");
            if (assistSelect) {
                assistSelect.innerHTML = [`<option value="">Assist (optional)</option>`].concat(
                    source.map(p => `<option value="${p.name}">${p.name}</option>`)
                ).join("");
            }
        },

        toggleAssistField: function() {
            const type = document.getElementById("eventType")?.value;
            const assistField = document.getElementById("assistField");
            if (!assistField) return;
            assistField.style.display = type === 'goal' ? 'flex' : 'none';
        },

        updateDashboard: function() {
            const players = app.state.players;
            const matches = app.state.matches;
            const goals = players.reduce((s, p) => s + (p.goals || 0), 0);
            const wins = matches.filter(m => {
                if (m.status !== 'completed') return false;
                const home = m.homeTeam?.toLowerCase().includes('tango');
                const hs = parseInt(m.homeScore); const as = parseInt(m.awayScore);
                return home ? hs > as : as > hs;
            }).length;

            const pc = document.getElementById('dashPlayerCount');
            const mc = document.getElementById('dashMatchCount');
            const gc = document.getElementById('dashGoalsCount');
            const wc = document.getElementById('dashWinsCount');

            if (pc) pc.textContent = players.length;
            if (mc) mc.textContent = matches.length;
            if (gc) gc.textContent = goals;
            if (wc) wc.textContent = wins;
        },

        // =================================================================
        // STANDINGS MODULE - INTERACTIVE TABLE
        // =================================================================
        loadStandingsToEditor: function(parsed) {
            const tbody = document.getElementById('standingsEditorBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (!parsed || !parsed.rows) return;

            parsed.rows.forEach(row => {
                this.addStandingsEditorRow(row);
            });
        },

        addStandingsEditorRow: function(data = ['', '', '0', '0', '0', '0', '0', '0', '0', '0']) {
            const tbody = document.getElementById('standingsEditorBody');
            if (!tbody) return;

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.04)';

            const cols = [
                { val: data[0] || '', w: '40px' },  // Pos
                { val: data[1] || '', w: '200px' }, // Team Name
                { val: data[2] || '0', w: '40px' },  // P
                { val: data[3] || '0', w: '40px' },  // W
                { val: data[4] || '0', w: '40px' },  // D
                { val: data[5] || '0', w: '40px' },  // L
                { val: data[6] || '0', w: '40px' },  // GF
                { val: data[7] || '0', w: '40px' },  // GA
                { val: data[8] || '0', w: '40px' },  // GD
                { val: data[9] || '0', w: '40px' },  // PTS
            ];

            cols.forEach((col, idx) => {
                const td = document.createElement('td');
                td.style.padding = '8px 5px';
                const input = document.createElement('input');
                input.type = idx >= 2 ? 'number' : 'text';
                input.value = col.val;
                input.className = 'standings-cell-input';
                input.style.width = col.w;
                input.style.background = 'rgba(255,255,255,0.03)';
                input.style.border = '1px solid var(--border)';
                input.style.color = 'white';
                input.style.padding = '5px';
                input.style.borderRadius = '5px';
                td.appendChild(input);
                tr.appendChild(td);
            });

            // Delete Action Button
            const actionTd = document.createElement('td');
            actionTd.style.textAlign = 'center';
            actionTd.innerHTML = `
                <button type="button" class="btn-delete" style="padding: 4px 8px; font-size: 0.75rem;" onclick="this.closest('tr').remove()">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            // A better way is to call a function that confirms
            actionTd.innerHTML = `
                <button type="button" class="btn-delete" style="padding: 4px 8px; font-size: 0.75rem;" onclick="app.ui.deleteStandingsRow(this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        },

        addStandingsRow: function() {
            this.addStandingsEditorRow();
        },

        clearStandingsEditor: function() {
            if (!this.userHasPermission(['Admin', 'Coach'])) {
                alert("You do not have permission to modify standings.");
                return;
            }
            if (confirm('Are you sure you want to clear the entire standings editor? This action cannot be undone.')) {
                const tbody = document.getElementById('standingsEditorBody');
                if (tbody) {
                    tbody.innerHTML = '';
                }
            }
        },

        deleteStandingsRow: function(button) {
            if (confirm('Are you sure you want to remove this team from the editor?')) {
                button.closest('tr').remove();
            }
        },

        saveStandingsEditor: async function() {
            const tbody = document.getElementById('standingsEditorBody');
            if (!tbody) return;

            const rows = [];
            const trElements = tbody.querySelectorAll('tr');

            trElements.forEach(tr => {
                const inputs = tr.querySelectorAll('input');
                if (inputs.length >= 10) {
                    const rowData = Array.from(inputs).map(inp => inp.value.trim());
                    if (rowData[1]) { // Require team name
                        rows.push(rowData);
                    }
                }
            });

            const parsed = {
                headers: ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "PTS"],
                rows: rows
            };

            if (!confirm(`You are about to save a table with ${rows.length} teams. This will overwrite the current public standings. Are you sure you want to continue?`)) {
                return;
            }

            localStorage.setItem('leagueStandingsJson', JSON.stringify(parsed));
            if (window.db) {
                try {
                    await window.db.collection('settings').doc('standings').set({ data: JSON.stringify(parsed) });
                } catch (e) { 
                    console.error('Firebase save standings failed:', e); 
                    alert('Failed to save standings to the database. Please try again.');
                    return;
                }
            }

            this.renderStandingsPreview(parsed);
            alert('League Standings saved successfully.');
        },

        parseStandingText: function(text) {
            if (!text || typeof text !== 'string') return null;
            const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) return null;

            const defaultHeaders = ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "PTS"];
            let dataRows = lines;
            let headers = defaultHeaders;

            // Check if the first line is a header or data
            const firstLineIsData = /^\d/.test(lines[0]);
            if (!firstLineIsData) {
                // If it's not data, assume it's a header row
                headers = lines[0].match(/\S+/g) || defaultHeaders;
                dataRows = lines.slice(1);
            }

            const rows = dataRows.map(line => {
                const tokens = line.match(/\S+/g) || [];
                // Check if there are enough tokens for at least position + 8 stats
                if (tokens.length >= 9) {
                    const position = tokens[0];
                    const stats    = tokens.slice(-8);
                    const teamName = tokens.slice(1, tokens.length - 8).join(' ');
                    return [position, teamName, ...stats];
                }
                return null;
            }).filter(row => row !== null);

            return rows.length ? { headers, rows } : null;
        },

        parseAndLoadStandings: function() {
            const textInput = document.getElementById('standingsTextInput');
            if (!textInput) return;

            const text = textInput.value;
            const parsed = this.parseStandingText(text);

            if (parsed && parsed.rows.length > 0) {
                this.loadStandingsToEditor(parsed);
                alert(`${parsed.rows.length} rows were successfully parsed and loaded into the editor.`);
            } else {
                alert("Could not parse any valid rows from the provided text. Please check the format.");
            }
        },

        renderStandingsPreview: function(parsed) {
            const preview = document.getElementById('standingsAdminPreview');
            if (!preview) return;
            preview.innerHTML = '';
            if (!parsed || !parsed.headers || !parsed.rows || parsed.rows.length === 0) {
                preview.innerHTML = '<p style="color:var(--muted);">No active preview data available.</p>';
                return;
            }

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            parsed.headers.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            parsed.rows.forEach(row => {
                const tr = document.createElement('tr');

                // Determine zone classes based on position
                const pos = parseInt(row[0]);
                const totalTeams = parsed.rows.length;
                if (!isNaN(pos)) {
                    if (pos >= 1 && pos <= 4) tr.classList.add('zone-top-four');
                    else if (pos >= 5 && pos <= 7) tr.classList.add('zone-mid-table');
                    else if (pos >= (totalTeams - 3)) tr.classList.add('zone-relegation');
                }

                row.forEach((cell, ci) => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    // For the team name column (assumed 2nd column), add a short form (first word)
                    if (ci === 1) {
                        const first = (cell || '').toString().split(/\s+/)[0] || cell;
                        td.dataset.short = first;
                        td.title = cell;
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            preview.appendChild(table);
        },

        loadAdminStandings: async function() {
            if (!window.db) {
                console.warn("Cannot load admin standings. Firebase is not connected.");
                return;
            }
            try {
                const doc = await window.db.collection('settings').doc('standings').get();
                if (doc.exists && doc.data().data) {
                    const parsed = JSON.parse(doc.data().data);
                    this.renderStandingsPreview(parsed);
                    this.loadStandingsToEditor(parsed);
                }
            }
            catch (e) { console.error('Could not load and parse standings from Firebase.', e); }
        },

        editPlayer: function(id) {
            const player = app.state.players.find(p => p.id === id);
            if (!player) return;
            document.getElementById("playerId").value = player.id;
            document.getElementById("playerName").value = player.name;
            document.getElementById("playerNickname").value = player.nickname || '';
            document.getElementById("playerPosition").value = player.position || 'Forward';
            document.getElementById("playerNumber").value = player.number || '';
            document.getElementById("playerImage").value = player.playerImage || '';
            document.getElementById("playerGoals").value = player.goals;
            document.getElementById("playerAssists").value = player.assists;
            document.getElementById("playerCleanSheets").value = player.cleansheets || 0;
            document.getElementById("playerShots").value = player.shots || 0;
            document.getElementById("playerShotsOnTarget").value = player.shotsOnTarget || 0;
            document.getElementById("playerChancesCreated").value = player.chancesCreated || 0;
            document.getElementById("playerTackles").value = player.tackles || 0;
            document.getElementById("playerInterceptions").value = player.interceptions || 0;
            this.switchTab('players');
        },

        deletePlayer: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete players.");
                return;
            }
            if (!confirm('Are you sure you want to delete this player?')) return;

            const index = app.state.players.findIndex(p => p.id === id);
            if (index > -1) {
                if (window.db) {
                    try {
                        await window.db.collection('players').doc(id.toString()).delete();
                    } catch(err) {
                        console.error("Firebase delete player failed:", err);
                        alert("Error deleting player from database.");
                        return;
                    }
                }

                app.state.players.splice(index, 1);
                app.ui.renderPlayers();
                app.ui.updateDashboard();
            }
        },

        deleteNews: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete articles.");
                return;
            }
            if (!confirm('Are you sure you want to delete this article?')) return;

            const index = app.state.news.findIndex(a => a.id == id);
            if (index > -1) {
                if (window.db) {
                    try {
                        await window.db.collection('news').doc(id.toString()).delete();
                    } catch(err) {
                        console.error("Firebase delete news failed:", err);
                    }
                }
                app.state.news.splice(index, 1);
                app.ui.renderNews();
            }
        },

        editMatch: function(id) {
            const match = app.state.matches.find(m => m.id == id);
            if (!match) return;
            document.getElementById("matchId").value = match.id;
            document.getElementById("homeTeam").value = match.homeTeam;
            document.getElementById("awayTeam").value = match.awayTeam;
            document.getElementById("matchDate").value = match.date;
            document.getElementById("matchTime").value = match.time;
            document.getElementById("matchVenue").value = match.venue;
            document.getElementById("matchStatus").value = match.status;
            document.getElementById("homeScore").value = match.homeScore || "";
            document.getElementById("awayScore").value = match.awayScore || "";
            app.state.currentEvents = match.events ? [...match.events] : [];
            this.renderEventList();
            this.switchTab('matches');
        },

        editNews: function(id) {
            const article = app.state.news.find(a => a.id == id);
            if (!article) return;

            document.getElementById("articleId").value = article.id;
            document.getElementById("articleTitle").value = article.title;
            document.getElementById("articleSubtitle").value = article.subtitle;
            document.getElementById("articleTag").value = article.tag;
            document.getElementById("articleTagColor").value = article.tagColor;
            document.getElementById("articleImage").value = article.image;
            document.getElementById("articleContent").value = article.content;
            this.switchTab('news');
        },

        editMedia: function(id) {
            const item = app.state.media.find(m => m.id == id);
            if (!item) return;

            document.getElementById("mediaId").value = item.id;
            document.getElementById("mediaType").value = item.type;
            document.getElementById("mediaCategory").value = item.category;
            document.getElementById("mediaUrl").value = item.url;
            document.getElementById("mediaTitle").value = item.title;

            this.switchTab('media');
        },

        downloadPlayerData: async function() {
            if (!window.db) {
                alert("Cannot download data. Firebase is not connected.");
                return;
            }
            try {
                const snapshot = await window.db.collection('players').get();
                const players = snapshot.docs.map(doc => doc.data());

                // Sort players by ID for consistency
                players.sort((a, b) => a.id - b.id);

                const dataStr = JSON.stringify(players, null, 2); // Pretty-print JSON
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'players.json';
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error downloading player data:", error);
                alert("Failed to download player data. See console for details.");
            }
        },

        downloadMatchData: async function() {
            if (!window.db) {
                alert("Cannot download data. Firebase is not connected.");
                return;
            }
            try {
                const snapshot = await window.db.collection('matches').get();
                const matches = snapshot.docs.map(doc => doc.data());

                matches.sort((a, b) => a.id - b.id);

                const dataStr = JSON.stringify(matches, null, 2);
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'matches.json';
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error downloading match data:", error);
                alert("Failed to download match data. See console for details.");
            }
        },

        deleteMedia: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete media.");
                return;
            }
            if (!confirm('Are you sure you want to delete this media item?')) return;

            const index = app.state.media.findIndex(m => m.id == id);
            if (index > -1) {
                if (window.db) {
                    try {
                        await window.db.collection('media').doc(id.toString()).delete();
                    } catch(err) {
                        console.error("Firebase delete media failed:", err);
                    }
                }
                app.state.media.splice(index, 1);
                // Save media to localStorage
                localStorage.setItem('adminMedia', JSON.stringify(app.state.media));
                app.ui.renderMedia();
            }
        },

        switchTab: function(name) {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            const targetTab = document.getElementById('tab-' + name);
            if (targetTab) targetTab.classList.add('active');
            const btn = document.querySelector(`.sidebar-btn[onclick*="'${name}'"]`);
            if (btn) btn.classList.add('active');
            this.updateDashboard();
        }
    },

    // =================================================================
    // STATS MODULE
    // =================================================================
    stats: {
        update: function(events) {
            if (!events) return;
            events.forEach(e => {
                const scorer = app.state.players.find(x => x.name === e.player);
                if (e.type === "goal" && scorer) {
                    scorer.goals++;
                    if (e.assist) {
                        const assister = app.state.players.find(x => x.name === e.assist);
                        if (assister) assister.assists++;
                    }
                }
                if (e.type === "assist") {
                    const assistant = app.state.players.find(x => x.name === e.player);
                    if (assistant) assistant.assists++;
                }
            });
        },

        revert: function(match) {
            if (!match || !match.events) return;
            match.events.forEach(e => {
                const p = app.state.players.find(x => x.name === e.player);
                if (e.type === "goal" && p) {
                    p.goals = Math.max(0, p.goals - 1);
                    if (e.assist) {
                        const assister = app.state.players.find(x => x.name === e.assist);
                        if (assister) assister.assists = Math.max(0, assister.assists - 1);
                    }
                }
                if (e.type === "assist" && p) {
                    p.assists = Math.max(0, p.assists - 1);
                }
            });
        }
    }
};

// Bind elements to window namespace to preserve compatibility with inline elements
window.app = app;
window.logout = () => app.auth.logout();
window.addEvent = () => app.events.addMatchEvent();
window.removeEvent = (i) => app.events.removeMatchEvent(i);
window.editNews = (id) => app.ui.editNews(id);
window.editMedia = (id) => app.ui.editMedia(id);

document.addEventListener("DOMContentLoaded", () => app.init());