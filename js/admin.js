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
        pendingMediaFile: null,
    },

    init: async function() {
        const isAuthenticated = await this.auth.check();
        // If check() returns true, redirect is happening or we are on login.html
        if (isAuthenticated) return;

        // If we reach here, we are authenticated on admin.html. Hide the shield.
        const shield = document.getElementById('authShield');
        if (shield) {
            shield.style.transition = 'opacity 0.4s ease';
            shield.style.opacity = '0';
            setTimeout(() => shield.remove(), 400);
        }

        await this.data.loadAll();
        this.events.bind();
        this.ui.applyRolePermissions();
        await this.ui.renderAll();
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

                firebase.auth().onAuthStateChanged(async (user) => {
                    if (settled) return;

                    if (user) {
                        console.log("[Auth] User detected:", user.email);
                        try {
                            if (!window.db) {
                                let retryCount = 0;
                                while (!window.db && retryCount < 15) {
                                    await new Promise(r => setTimeout(r, 200));
                                    retryCount++;
                                }
                            }
                            if (!window.db) throw new Error("Database failed.");

                            let userDoc = null;
                            try {
                                const fetchPromise = window.db.collection('users').doc(user.uid).get();
                                userDoc = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise, 3000) : fetchPromise);
                            } catch (e) { console.warn("[Auth] Profile fetch failed/timed out"); }

                            if (userDoc && userDoc.exists) {
                                app.state.currentUser = { uid: user.uid, email: user.email, ...userDoc.data() };
                            } else {
                                app.state.currentUser = { uid: user.uid, email: user.email, name: user.email.split('@')[0], role: 'Admin' };
                            }

                            if (window.location.pathname.includes('login.html')) {
                                window.location.replace('admin.html');
                                finish(true);
                                return;
                            }

                            const nameEl = document.getElementById('sessionUserName');
                            const roleEl = document.getElementById('sessionUserRole');
                            if (nameEl) nameEl.textContent = app.state.currentUser.name;
                            if (roleEl) roleEl.textContent = `Role: ${app.state.currentUser.role}`;

                            finish(false);
                        } catch (error) {
                            console.error("[Auth] Init error:", error);
                            finish(false);
                        }
                    } else {
                        // Only redirect to login if we are actually on the admin page
                        if (window.location.pathname.includes('admin.html')) {
                            window.location.replace('login.html');
                        }
                        finish(true);
                    }
                });

                // Fail-safe to prevent stuck shield on slow networks
                setTimeout(() => {
                    if (!settled) {
                        console.warn("[Auth] Auth check timed out, attempting to proceed as Admin.");
                        app.state.currentUser = { role: 'Admin', name: 'Admin (Offline)' };
                        finish(false);
                    }
                }, 5000);
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
        },

        saveFile: function(filename, content) {
            // Android APK Fallback (Clipboard + Toast)
            if (window.Android && window.Android.saveFile) {
                window.Android.saveFile(filename, content);
                return;
            }
            // Standard Browser Download
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

            // Real-time players sync for dropdowns and list
            if (window.db) {
                window.db.collection('players').onSnapshot(snapshot => {
                    if (!snapshot.empty) {
                        app.state.players = snapshot.docs.map(doc => doc.data());
                        app.data.loadRosterPlayers().then(() => {
                            app.ui.renderPlayers();
                            app.ui.populatePlayerDropdown();
                        });
                    }
                });
            }
        },

        loadCollection: async function(collectionName, localKey) {
            let data = [];

            // 1. Try Firebase (with 2s timeout)
            if (window.db) {
                try {
                    const fetchPromise = window.db.collection(collectionName).get();
                    const snapshot = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise, 2000) : fetchPromise);
                    if (!snapshot.empty) {
                        data = snapshot.docs.map(doc => doc.data());
                        console.log(`[Admin Data] Loaded ${data.length} items from Firebase (${collectionName})`);
                        return data;
                    }
                } catch (e) {
                    console.warn(`Firebase fetch for ${collectionName} failed or timed out:`, e.message);
                }
            }

            // 2. Fallback to localStorage
            const local = JSON.parse(localStorage.getItem(localKey));
            if (local && local.length) {
                console.log(`[Admin Data] Loaded ${local.length} items from localStorage (${localKey})`);
                return local;
            }

            // 3. Fallback to bundled JSON files
            try {
                const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
                const response = await fetchFn(`data/${collectionName}.json`);
                if (response.ok) {
                    data = await response.json();
                    console.log(`[Admin Data] Loaded ${data.length} items from bundled JSON (${collectionName})`);
                    return data;
                }
            } catch (err) {
                console.warn(`Final fallback failed for ${collectionName}:`, err);
            }

            // 4. Ultimate Fallback for Players: Use basePlayers from js/players-data.js
            if (collectionName === 'players' && typeof basePlayers !== 'undefined') {
                console.log(`[Admin Data] Using ultimate fallback: basePlayers (${basePlayers.length} items)`);
                return basePlayers;
            }

            return [];
        },

        getMergedMatches: async function(adminMatches) {
            // This function is deprecated in favor of a direct Firebase read.
            return adminMatches;
        },

        loadTeamMetrics: async function() {
            let metrics = {};

            if (window.db) {
                try {
                    // Apply 2s timeout to Firebase team metrics fetch
                    const fetchPromise = window.db.collection('settings').doc('teamMetrics').get();
                    const doc = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

                    if (doc.exists) {
                        const raw = doc.data();
                        if (raw && typeof raw === 'object') {
                            metrics = raw;
                        } else if (raw && typeof raw.data === 'string') {
                            metrics = JSON.parse(raw.data);
                        }
                    }
                } catch (e) {
                    console.warn('Firebase team metrics fetch failed or timed out:', e.message);
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

            // 1. Try global helper
            if (typeof getMergedPlayers === 'function') {
                merged = getMergedPlayers();
            }

            // 2. Try app state (Firebase or local JSON)
            if ((!merged || merged.length === 0) && app.state.players && app.state.players.length > 0) {
                merged = app.state.players;
            }

            // 3. Ultimate fallback: basePlayers constant
            if ((!merged || merged.length === 0) && typeof basePlayers !== 'undefined') {
                merged = basePlayers;
            }

            console.log(`[Admin Data] Loading roster from ${merged.length} source items.`);

            // Map with enough data for the dropdowns
            app.state.rosterPlayers = (merged || []).map(p => ({
                id: p.id || Math.random(),
                name: p.name || p.playerName || "Unnamed",
                nickname: p.nickname || p.nick || ""
            })).filter(p => p.name !== "Unnamed");
        },

        addOrUpdateRosterPlayer: function(player) {
            const idx = app.state.rosterPlayers.findIndex(r => r.id === player.id || r.name === player.name);
            const entry = {
                id: player.id,
                name: player.name,
                nickname: player.nickname || player.nick || ""
            };
            if (idx > -1) { app.state.rosterPlayers[idx] = entry; }
            else { app.state.rosterPlayers.push(entry); }
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

            // Re-mapped results upload for the new "Premium" tools
            const resultsFile = document.getElementById("file-input-results");
            const resultsLabel = document.getElementById("file-label-name");
            const syncBtn = document.getElementById("btn-sync-action");

            if (resultsFile) {
                resultsFile.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (file && resultsLabel) resultsLabel.textContent = file.name;
                    this.handleResultsUpload(e);
                });
            }

            if (syncBtn) {
                syncBtn.addEventListener("click", () => app.ui.exportResultsAsJson());
            }

            document.getElementById("mediaForm")?.addEventListener("submit", this.handleMediaFormSubmit);
            document.getElementById("mediaFileInput")?.addEventListener("change", this.handleMediaFileSelection);
            document.querySelector('.btn-logout')?.addEventListener('click', () => app.auth.logout());
            document.getElementById("eventType")?.addEventListener('change', () => app.ui.toggleAssistField());
            document.getElementById("matchCompetition")?.addEventListener('change', () => app.ui.toggleWeekField());
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
            console.log("[Admin] Handling player form submit...");

            const id = document.getElementById("playerId").value || Date.now().toString();
            const player = {
                id:          id.toString(), // Ensure ID is a string for document naming
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
                recoveries:        0
            };

            if (window.db) {
                try {
                    await window.db.collection('players').doc(player.id).set(player, { merge: true });
                    console.log("[Admin] Player saved to Firestore.");
                    alert("Player saved successfully!");
                } catch (err) {
                    console.error("Firebase save player failed:", err);
                    alert("Error saving player to database: " + err.message);
                    return;
                }
            }

            const idx = app.state.players.findIndex(p => p.id === player.id);
            if (idx > -1) app.state.players[idx] = player; else app.state.players.push(player);

            app.data.addOrUpdateRosterPlayer(player);
            e.target.reset();
            document.getElementById("playerId").value = "";
            this.updateCustomDropdownValue('playerPositionWrapper', 'Forward'); // Reset custom trigger
            app.ui.renderPlayers();
            await app.ui.populatePlayerDropdown();
            app.ui.updateDashboard();
        },

        handleMatchFormSubmit: async function(e) {
            e.preventDefault();
            console.log("[Admin] Handling match form submit...");

            const matchId = document.getElementById("matchId").value || Date.now().toString();
            const match = {
                id:          matchId,
                competition: document.getElementById("matchCompetition").value,
                week:        document.getElementById("matchWeek").value,
                homeTeam:    document.getElementById("homeTeam").value,
                awayTeam:    document.getElementById("awayTeam").value,
                date:        document.getElementById("matchDate").value,
                time:        document.getElementById("matchTime").value,
                venue:       document.getElementById("matchVenue").value,
                status:      document.getElementById("matchStatus").value,
                homeScore:   document.getElementById("homeScore").value,
                awayScore:   document.getElementById("awayScore").value,
                events:      [...app.state.currentEvents]
            };

            if (match.status === 'completed' && (match.homeScore === '' || match.awayScore === '')) {
                alert('Add both home and away scores before saving a completed match.');
                return;
            }

            if (window.db) {
                try {
                    await window.db.collection('matches').doc(matchId).set(match);
                    console.log("[Admin] Match saved to Firestore.");
                    alert("Match saved successfully!");
                } catch (err) {
                    console.error("Firebase save match failed:", err);
                    alert("Error saving match to database: " + err.message);
                    return;
                }
            }

            const idx = app.state.matches.findIndex(m => m.id == match.id);
            if (idx > -1) {
                // await app.stats.revert(app.state.matches[idx]); // Revert old stats if needed
                app.state.matches[idx] = match;
            } else {
                app.state.matches.push(match);
            }

            if (match.status === 'completed') {
                await app.stats.updateAndSync(match.events);
            }

            e.target.reset();
            app.state.currentEvents = [];
            app.ui.renderEventList();
            app.ui.renderMatches();
            app.ui.updateDashboard();
            app.ui.setMatchFormDefaults(); // Re-apply defaults after reset

            // Specifically reset custom triggers
            app.ui.updateCustomDropdownValue('homeTeamWrapper', 'Tango FC');
            app.ui.updateCustomDropdownValue('awayTeamWrapper', '');
            app.ui.updateCustomDropdownValue('matchVenueWrapper', 'Shakashe Stadium');
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

        handleMediaFileSelection: function(event) {
            const file = event.target.files?.[0] || null;
            app.state.pendingMediaFile = file;
            const urlField = document.getElementById("mediaUrl");
            if (!file && urlField) {
                urlField.placeholder = "images/gallery/photo.jpg or YouTube Video ID";
                return;
            }
            if (urlField) {
                urlField.placeholder = `Selected file: ${file.name}`;
            }
        },

        handleMediaFormSubmit: async function(e) {
            e.preventDefault();
            const rawType = document.getElementById("mediaType").value;
            const rawCategory = document.getElementById("mediaCategory").value;
            const mediaType = app.utils.normalizeMediaType(rawType);
            const mediaCategory = app.utils.normalizeMediaCategory(rawCategory);
            const pendingFile = app.state.pendingMediaFile;
            const urlField = document.getElementById("mediaUrl");
            let resolvedUrl = (urlField?.value || '').trim();

            if (!mediaCategory) {
                alert("Please provide a valid media category. Suggested options: newseason, matchday, champions.");
                return;
            }

            if (pendingFile) {
                const mimeType = pendingFile.type || '';
                const fileType = mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('image/') ? 'image' : mediaType;
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
                    reader.readAsDataURL(pendingFile);
                });
                resolvedUrl = dataUrl;
                document.getElementById("mediaType").value = fileType;
            }

            if (!resolvedUrl) {
                alert("Please provide a URL or upload a media file.");
                return;
            }

            const mediaItem = {
                id: document.getElementById("mediaId").value || Date.now().toString(),
                type: app.utils.normalizeMediaType(document.getElementById("mediaType").value),
                category: mediaCategory,
                url: resolvedUrl,
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
            app.state.pendingMediaFile = null;
            e.target.reset();
            app.ui.renderMedia();
        },

        exportStandingsAsJson: function() {
            // Get standings from the editor table
            const tbody = document.getElementById('standingsEditorBody');
            if (!tbody || tbody.children.length === 0) {
                alert('No standings data to export. Please load or add standings first.');
                return;
            }

            const rows = [];
            tbody.querySelectorAll('tr').forEach(tr => {
                const cells = tr.querySelectorAll('input[type="text"]');
                if (cells.length >= 10) {
                    rows.push([
                        cells[0].value, // Pos
                        cells[1].value, // Team
                        cells[2].value, // P
                        cells[3].value, // W
                        cells[4].value, // D
                        cells[5].value, // L
                        cells[6].value, // GF
                        cells[7].value, // GA
                        cells[8].value, // GD
                        cells[9].value  // PTS
                    ]);
                }
            });

            if (rows.length === 0) {
                alert('No valid standings data found in the editor.');
                return;
            }

            // Create the JSON structure matching log.json format
            const standingsData = {
                headers: ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"],
                rows: rows
            };

            // Use utility to handle download/APK save
            const jsonString = JSON.stringify(standingsData, null, 2);
            app.utils.saveFile('log.json', jsonString);
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

            // Clear inputs for next event
            document.getElementById("eventMinute").value = "";
            app.ui.updateCustomDropdownValue('eventPlayerWrapper', "");
            app.ui.updateCustomDropdownValue('eventAssistWrapper', "");
        },

        removeMatchEvent: async function(i) {
            if (await confirm('Are you sure you want to remove this match event?')) {
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
            const role = app.state.currentUser?.role || 'Guest';
            console.log("[Admin] Applying permissions for role:", role);

            // 1. Handle elements with direct data-permission (Forms, Sidebar Buttons, etc.)
            document.querySelectorAll('[data-permission]').forEach(el => {
                const requiredRoles = el.getAttribute('data-permission').split(',').map(r => r.trim());
                const hasPermission = role === 'Admin' || requiredRoles.includes(role);

                if (!hasPermission) {
                    el.setAttribute('disabled', 'true');
                    el.style.pointerEvents = 'none';
                    el.style.opacity = '0.6';
                } else {
                    el.removeAttribute('disabled');
                    el.style.pointerEvents = 'auto';
                    el.style.opacity = '1';
                }
            });

            // 2. Global UI restrictions (CEO is strictly read-only)
            const isReadOnly = role === 'CEO';
            const banner = document.getElementById('ceoReadOnlyMsg');

            if (banner) banner.style.display = isReadOnly ? 'block' : 'none';

            document.querySelectorAll('.admin-form').forEach(form => {
                const requiredRoles = form.getAttribute('data-permission')?.split(',').map(r => r.trim()) || [];
                const canUserWrite = role === 'Admin' || (requiredRoles.includes(role) && !isReadOnly);

                const inputs = form.querySelectorAll('input, select, textarea');
                const submitBtn = form.querySelector('button[type="submit"]');

                if (canUserWrite) {
                    inputs.forEach(input => input.removeAttribute('disabled'));
                    if (submitBtn) submitBtn.style.display = 'inline-flex';
                } else {
                    inputs.forEach(input => input.setAttribute('disabled', 'true'));
                    if (submitBtn) submitBtn.style.display = 'none';
                }
            });

            // 3. Refresh dynamic lists
            this.renderPlayers();
            this.renderMatches();
            this.renderNews();
            this.renderMedia();
        },

        renderAll: async function() {
            this.populateWeekDropdown();
            this.renderPlayers();
            this.renderMatches();
            this.renderNews();
            this.renderMedia();
            this.initCustomDropdowns(); // Initialize custom logic
            await this.populatePlayerDropdown();
            this.populateTeamDropdowns();
            this.populateTeamMetricsForm();
            this.setMatchFormDefaults();
        },

        initCustomDropdowns: function() {
            // Close all dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-select-wrapper')) {
                    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
                        w.classList.remove('open');
                        w.closest('.field-group')?.classList.remove('dropdown-active');
                    });
                }
            });

            // Handle trigger clicks
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('.custom-select-trigger');
                if (trigger) {
                    const wrapper = trigger.parentElement;
                    const fieldGroup = wrapper.closest('.field-group');
                    const alreadyOpen = wrapper.classList.contains('open');

                    // Close others
                    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
                        w.classList.remove('open');
                        w.closest('.field-group')?.classList.remove('dropdown-active');
                    });

                    if (!alreadyOpen) {
                        wrapper.classList.add('open');
                        if (fieldGroup) fieldGroup.classList.add('dropdown-active');

                        const searchInput = wrapper.querySelector('.custom-search input');
                        if (searchInput) {
                            setTimeout(() => searchInput.focus(), 100);
                        }
                    }
                }
            });

            // Handle searching/filtering
            document.addEventListener('input', (e) => {
                const searchInput = e.target.closest('.custom-search input');
                if (searchInput) {
                    const term = searchInput.value.toLowerCase();
                    const optionsContainer = searchInput.closest('.custom-options');
                    const options = optionsContainer.querySelectorAll('.custom-option');

                    options.forEach(opt => {
                        const text = opt.textContent.toLowerCase();
                        opt.style.display = text.includes(term) ? 'block' : 'none';
                    });
                }
            });

            // Handle option selection (delegated)
            document.addEventListener('click', (e) => {
                const option = e.target.closest('.custom-option');
                if (option) {
                    const value = option.dataset.value;
                    const text = option.textContent;
                    const wrapper = option.closest('.custom-select-wrapper');
                    const trigger = wrapper.querySelector('.custom-select-trigger');
                    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

                    trigger.textContent = text;
                    trigger.dataset.value = value;
                    hiddenInput.value = value;

                    hiddenInput.dispatchEvent(new Event('change'));

                    wrapper.classList.remove('open');
                    wrapper.closest('.field-group')?.classList.remove('dropdown-active');

                    if (hiddenInput.id === 'eventType') {
                        app.ui.toggleAssistField();
                    }
                }
            });
        },

        renderCustomOptions: function(wrapperId, options, currentValue = "", showSearch = true) {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;

            const optionsContainer = wrapper.querySelector('.custom-options');
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const hiddenInput = wrapper.querySelector('input[type="hidden"]');

            if (!options || options.length === 0) {
                optionsContainer.innerHTML = `<div class="custom-option" style="opacity: 0.5; pointer-events: none;">No players in roster</div>`;
                return;
            }

            let html = '';
            if (showSearch && options.length > 8) {
                html += `<div class="custom-search" style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; background: #0d1526; z-index: 10;">
                            <input type="text" placeholder="Search..." onclick="event.stopPropagation()" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white;">
                         </div>`;
            }

            html += options.map(opt => `
                <div class="custom-option ${opt.value === currentValue ? 'selected' : ''}" data-value="${opt.value}">
                    ${opt.label}
                </div>
            `).join('');

            optionsContainer.innerHTML = html;

            const currentOpt = options.find(o => o.value === currentValue);
            if (currentOpt) {
                trigger.textContent = currentOpt.label;
                trigger.dataset.value = currentOpt.value;
                hiddenInput.value = currentOpt.value;
            }
        },

        populateTeamDropdowns: function() {
            // 1. TEAMS - Strict list of 20 league teams as per log.json
            let teams = [
                "Flesk FC", "Steers FC", "Exor Stars", "Careful Driving Academy", "Tango FC",
                "Chibuku", "Motor Sales FC", "Safeguard Stars", "Mugodhi FC", "Sparklions",
                "Morefire FC", "Prison Warriors", "Cotrad", "Light Of God", "ZINWA Runde",
                "ZRP Masvingo", "GZU FC", "FC Duchima", "Mutimurefu", "Thorglot All Stars"
            ];

            const savedStandings = localStorage.getItem('leagueStandingsJson');
            if (savedStandings) {
                try {
                    const parsed = JSON.parse(savedStandings);
                    if (parsed.rows && parsed.rows.length >= 20) {
                        teams = parsed.rows.map(r => r[1].trim());
                    }
                } catch(e) {}
            }
            teams = [...new Set(teams)].sort();
            const teamOpts = teams.map(t => ({ value: t, label: t }));

            this.renderCustomOptions('homeTeamWrapper', teamOpts, 'Tango FC');
            this.renderCustomOptions('awayTeamWrapper', teamOpts, "");

            // 2. VENUES - Ensure all existing venues are available
            let venues = [
                "Shakashe Stadium", "Mucheke Stadium", "Border Stadium", "Polytec Stadium",
                "Mamutse Stadium", "Ndarama High Stadium", "Pangolin Ground",
                "Pecos Arena Stadium", "Mucheke B Arena 1", "Mucheke B Arena 2", "TBA"
            ];

            if (app.state.matches) {
                app.state.matches.forEach(m => {
                    if (m.venue && !venues.includes(m.venue)) {
                        venues.push(m.venue);
                    }
                });
            }

            venues = [...new Set(venues)].sort((a, b) => {
                if (a === "Shakashe Stadium") return -1; // Keep Shakashe at top
                if (b === "Shakashe Stadium") return 1;
                return a.localeCompare(b);
            });

            const venueOpts = venues.map(v => ({ value: v, label: v }));
            this.renderCustomOptions('matchVenueWrapper', venueOpts, 'Shakashe Stadium');
        },

        populatePlayerDropdown: async function() {
            // Ensure roster is loaded
            await app.data.loadRosterPlayers();

            const source = app.state.rosterPlayers || [];
            console.log(`[Admin] Populating player dropdowns with ${source.length} players.`);

            const playerOpts = source.map(p => {
                const displayName = p.nickname ? `${p.nickname} (${p.name})` : p.name;
                return {
                    value: p.name,
                    label: displayName
                };
            });

            // Sort alphabetically by label
            playerOpts.sort((a, b) => a.label.localeCompare(b.label));

            this.renderCustomOptions('eventPlayerWrapper', playerOpts, "");
            this.renderCustomOptions('eventAssistWrapper', [{ value: "", label: "None" }, ...playerOpts], "");

            // Log to confirm population
            const container = document.querySelector('#eventPlayerWrapper .custom-options');
            if (container) {
                console.log(`[Admin] Dropdown HTML populated. Child count: ${container.children.length}`);
            }
        },

        setMatchFormDefaults: function() {
            if (!app.state.matches || app.state.matches.length === 0) return;

            // Find the most recent match by date
            const sorted = [...app.state.matches].sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastMatch = sorted[0];

            // 1. Set Week/Round (last + 1)
            const lastWeek = parseInt(lastMatch.week) || 0;
            const nextWeek = lastWeek + 1;
            if (nextWeek <= 38) {
                this.updateCustomDropdownValue('matchWeekWrapper', nextWeek.toString());
            }

            // 2. Set Date (next Saturday)
            const lastDate = new Date(lastMatch.date);
            const nextSat = new Date(lastDate);
            // Move to next Saturday
            nextSat.setDate(lastDate.getDate() + (6 - lastDate.getDay() + 7) % 7);
            if (nextSat.getTime() === lastDate.getTime()) {
                // If the last game was already Saturday, move to the VERY next one
                nextSat.setDate(nextSat.getDate() + 7);
            }

            const dateInput = document.getElementById('matchDate');
            if (dateInput) {
                dateInput.value = nextSat.toISOString().split('T')[0];
            }

            // 3. Set Venue (Default Shakashe)
            this.updateCustomDropdownValue('matchVenueWrapper', "Shakashe Stadium");
            this.updateCustomDropdownValue('matchStatusWrapper', "upcoming");
            this.updateCustomDropdownValue('matchCompetitionWrapper', "League");
        },

        populateWeekDropdown: function() {
            const weekOpts = [];
            for (let i = 1; i <= 38; i++) {
                weekOpts.push({ value: i.toString(), label: `Week ${i}` });
            }
            this.renderCustomOptions('matchWeekWrapper', weekOpts, "");
        },

        toggleWeekField: function() {
            const comp = document.getElementById('matchCompetition')?.value;
            const weekField = document.getElementById('weekFieldGroup');
            if (weekField) {
                weekField.style.display = (comp === 'League') ? 'flex' : 'none';
            }
        },

        renderPlayers: function() {
            const container = document.getElementById("playersList");
            if (!container) return;

            const players = app.state.players;
            const userRole = app.state.currentUser?.role;
            const canEdit = userRole !== 'CEO';
            const canDelete = userRole === 'Admin';

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
                const initials = (p.nickname || p.name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                const editBtn = canEdit
                    ? `<button class="btn-edit-text" onclick="window.app.ui.editPlayer('${p.id}')">EDIT</button>`
                    : '';
                const deleteBtn = canDelete
                    ? `<button class="btn-delete-icon" onclick="window.app.ui.deletePlayer('${p.id}')"><i class="fa-solid fa-trash-can"></i></button>`
                    : '';

                return `
                    <div class="compact-row-card">
                        <div class="row-avatar">${initials}</div>
                        <div class="row-info">
                            <strong>${displayName}</strong>
                            <span>#${p.number || '—'} - ${p.position}</span>
                        </div>
                        <div class="row-actions">
                            ${editBtn}
                            ${deleteBtn}
                        </div>
                    </div>`;
            };

            container.innerHTML = `<div class="admin-compact-grid">${sorted.map(buildCard).join('')}</div>`;
        },

        renderMatches: function() {
            const container = document.getElementById("matchesList");
            if (!container) return;
            const userRole = app.state.currentUser?.role;
            const canEdit = userRole !== 'CEO';
            const canDelete = userRole === 'Admin';

            if (app.state.matches.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No matches registered.</p>`;
                return;
            }

            const sortedMatches = [...app.state.matches].sort((a, b) => {
                const aDate = Date.parse(a.date);
                const bDate = Date.parse(b.date);
                return aDate - bDate;
            });

            container.innerHTML = sortedMatches.map(m => {
                const completed = m.status === 'completed';
                const score = completed ? `${m.homeScore} – ${m.awayScore}` : 'Upcoming';

                let resultBadge = '';
                if (completed) {
                    const home = (m.homeTeam || '').toLowerCase().includes('tango');
                    const diff = (parseInt(m.homeScore) || 0) - (parseInt(m.awayScore) || 0);
                    const result = home ? (diff > 0 ? 'WIN' : (diff === 0 ? 'DRAW' : 'LOSS')) : (diff < 0 ? 'WIN' : (diff === 0 ? 'DRAW' : 'LOSS'));
                    resultBadge = `<span class="compact-match-badge badge-${result.toLowerCase()}">${result}</span>`;
                }

                return `
                    <div class="compact-match-card">
                        <div class="match-card-top">
                            <div class="match-card-comp">
                                <i class="fa-solid fa-trophy"></i> ${m.competition || 'LEAGUE'}
                            </div>
                            <div class="match-card-btns">
                                ${canEdit ? `<button class="btn-edit-match" onclick="window.app.ui.editMatch('${m.id}')"><i class="fa-solid fa-pen"></i> Edit</button>` : ''}
                                ${canDelete ? `<button class="btn-delete-match" onclick="window.app.ui.deleteMatch('${m.id}')"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </div>
                        </div>

                        <p class="match-card-teams">${m.homeTeam} vs ${m.awayTeam}</p>

                        <div class="match-card-bottom">
                            <div class="match-card-info-stack">
                                <span><i class="fa-solid fa-calendar"></i> ${m.date || 'No date'}</span>
                                <span><i class="fa-solid fa-location-dot"></i> ${m.venue || 'No venue'}</span>
                            </div>
                            <div class="match-card-score-row">
                                <span class="match-card-score-text">${score}</span>
                                ${resultBadge}
                            </div>
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
            if (!await confirm('Are you sure you want to delete this match? This will also revert any associated goals and assists from the players roster.')) return;
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

            container.innerHTML = `<div class="admin-news-grid">` + sortedNews.map(article => {
                const date = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <div class="compact-news-card glass-card">
                        <div class="news-thumb-box">
                            <img src="${article.image || 'images/news-placeholder.jpg'}" alt="News" onerror="this.src='images/tangoforces.jpg'">
                        </div>
                        <div class="news-info-box">
                            <strong>${article.title}</strong>
                            <span>${date} · ${article.tag || 'Uncategorized'}</span>
                            <div class="news-actions-box">
                                ${canEdit ? `<button class="btn-news-edit" onclick="window.app.ui.editNews('${article.id}')">
                                    <i class="fa-solid fa-pen"></i> EDIT
                                </button>` : ''}
                                ${canDelete ? `<button class="btn-news-delete" onclick="window.app.ui.deleteNews('${article.id}')">
                                    <i class="fa-solid fa-trash-can"></i> DELETE
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join("") + `</div>`;
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

            container.innerHTML = `<div class="admin-media-grid">` + app.state.media.map(item => {
                const isVideo = item.type === 'video';
                const thumbUrl = isVideo
                    ? `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`
                    : item.url;

                return `
                    <div class="compact-media-card glass-card">
                        <div class="media-thumbnail-box">
                            <img src="${thumbUrl}" alt="Media" loading="lazy" onerror="this.src='images/tangoforces.jpg'">
                            ${isVideo ? '<i class="fa-brands fa-youtube media-type-icon"></i>' : ''}
                        </div>
                        <div class="media-details-box">
                            <strong>${item.title}</strong>
                            <span>${item.type} · ${item.category || 'Season'}</span>
                            <div class="media-row-actions">
                                ${canEdit ? `<button class="btn-media-edit" onclick="window.app.ui.editMedia('${item.id}')">
                                    <i class="fa-solid fa-pen"></i> EDIT
                                </button>` : ''}
                                ${canDelete ? `<button class="btn-media-delete" onclick="window.app.ui.deleteMedia('${item.id}')">
                                    <i class="fa-solid fa-trash-can"></i> DELETE
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join("") + `</div>`;
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
            console.log("[Standings] Adding new row...");
            app.ui.addStandingsEditorRow();
        },

        clearStandingsEditor: async function() {
            const role = app.state.currentUser?.role || 'Guest';
            if (role !== 'Admin' && role !== 'Coach' && role !== 'Staff') {
                alert("You do not have permission to modify standings.");
                return;
            }
            if (await confirm('Are you sure you want to clear the entire standings editor? This action cannot be undone.')) {
                const tbody = document.getElementById('standingsEditorBody');
                if (tbody) {
                    tbody.innerHTML = '';
                }
            }
        },

        deleteStandingsRow: async function(button) {
            if (await confirm('Are you sure you want to remove this team from the editor?')) {
                button.closest('tr').remove();
            }
        },

        saveStandingsEditor: async function() {
            console.log("[Standings] saveStandingsEditor called.");
            const role = app.state.currentUser?.role || 'Guest';

            // Standardize permission: Admin, Coach, and Staff can all save
            if (role !== 'Admin' && role !== 'Coach' && role !== 'Staff') {
                alert("You do not have permission to save standings.");
                return;
            }

            const tbody = document.getElementById('standingsEditorBody');
            if (!tbody) {
                alert("Error: Standings table body not found.");
                return;
            }

            const rows = [];
            const trElements = tbody.querySelectorAll('tr');

            trElements.forEach(tr => {
                const inputs = tr.querySelectorAll('input');
                // We check for >= 10 because our table has 10 data columns + 1 action column
                if (inputs.length >= 10) {
                    const rowData = Array.from(inputs).map(inp => inp.value.trim());
                    // rowData[1] is the Team Name. It must exist.
                    if (rowData[1]) {
                        rows.push(rowData);
                    }
                }
            });

            if (rows.length === 0) {
                alert("The table is empty. Please add at least one team name.");
                return;
            }

            const parsed = {
                headers: ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"],
                rows: rows
            };

            if (!await confirm(`Confirm: Publish ${rows.length} teams to the live league table?`)) {
                return;
            }

            // 1. Sync to Local Storage
            localStorage.setItem('leagueStandingsJson', JSON.stringify(parsed));

            // 2. Sync to Firestore
            if (window.db) {
                try {
                    console.log("[Standings] Syncing to Firestore...");
                    await window.db.collection('settings').doc('standings').set({
                        data: JSON.stringify(parsed),
                        lastUpdated: new Date().toISOString()
                    });
                    console.log("[Standings] Firestore update successful.");
                } catch (e) {
                    console.error('[Standings] Firestore error:', e);
                    alert('Online database sync failed, but data is saved locally on your device.');
                }
            }

            // 3. Update the visual preview
            app.ui.renderStandingsPreview(parsed);
            alert('Standings saved and published successfully!');
        },

        parseStandingText: function(text) {
            if (!text || typeof text !== 'string') return null;
            const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) return null;

            const defaultHeaders = ["Pos", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"];
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
            console.log("[Standings] Parsing text input...");
            const textInput = document.getElementById('standingsTextInput');
            if (!textInput) return;

            const text = textInput.value;
            const parsed = app.ui.parseStandingText(text);

            if (parsed && parsed.rows.length > 0) {
                app.ui.loadStandingsToEditor(parsed);
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
            const player = app.state.players.find(p => p.id == id);
            if (!player) {
                console.warn("[Admin] Player not found for ID:", id);
                return;
            }
            document.getElementById("playerId").value = player.id;
            document.getElementById("playerName").value = player.name;
            document.getElementById("playerNickname").value = player.nickname || '';

            // Update Custom Dropdown for position
            this.updateCustomDropdownValue('playerPositionWrapper', player.position || 'Forward');

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
            // Force re-check permissions to ensure form is editable
            this.applyRolePermissions();

            requestAnimationFrame(() => {
                const form = document.getElementById('playerForm');
                const target = document.getElementById('playerName');
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (target) {
                    target.focus({ preventScroll: true });
                }
            });
        },

        deletePlayer: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete players.");
                return;
            }
            if (!await confirm('Are you sure you want to delete this player?')) return;

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
            if (!await confirm('Are you sure you want to delete this article?')) return;

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
            document.getElementById("matchCompetition").value = match.competition || "League";
            document.getElementById("matchWeek").value = match.week || "";
            this.toggleWeekField();

            // Update Custom Dropdowns for Teams & Venue & Status & Competition & Week
            this.updateCustomDropdownValue('homeTeamWrapper', match.homeTeam || "Tango FC");
            this.updateCustomDropdownValue('awayTeamWrapper', match.awayTeam || "");
            this.updateCustomDropdownValue('matchVenueWrapper', match.venue || "Shakashe Stadium");
            this.updateCustomDropdownValue('matchStatusWrapper', match.status || "upcoming");
            this.updateCustomDropdownValue('matchCompetitionWrapper', match.competition || "League");
            this.updateCustomDropdownValue('matchWeekWrapper', match.week || "");

            document.getElementById("matchDate").value = match.date;
            document.getElementById("matchTime").value = match.time;
            document.getElementById("matchStatus").value = match.status;
            document.getElementById("homeScore").value = match.homeScore || "";
            document.getElementById("awayScore").value = match.awayScore || "";
            app.state.currentEvents = match.events ? [...match.events] : [];
            this.renderEventList();
            this.switchTab('matches');
            // Force re-check permissions to ensure form is editable
            this.applyRolePermissions();
        },

        updateCustomDropdownValue: function(wrapperId, value) {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;
            const trigger = wrapper.querySelector('.custom-select-trigger');
            const hiddenInput = wrapper.querySelector('input[type="hidden"]');
            const options = wrapper.querySelectorAll('.custom-option');

            hiddenInput.value = value;
            let foundText = value;

            options.forEach(opt => {
                if (opt.dataset.value === value) {
                    opt.classList.add('selected');
                    foundText = opt.textContent;
                } else {
                    opt.classList.remove('selected');
                }
            });

            trigger.textContent = foundText || value;
            trigger.dataset.value = value;
        },

        editNews: function(id) {
            const article = app.state.news.find(a => a.id == id);
            if (!article) return;

            document.getElementById("articleId").value = article.id;
            document.getElementById("articleTitle").value = article.title;
            document.getElementById("articleSubtitle").value = article.subtitle;
            document.getElementById("articleTag").value = article.tag;

            // Update Custom Dropdown for tag color
            this.updateCustomDropdownValue('articleTagColorWrapper', article.tagColor || 'gold-tag');

            document.getElementById("articleImage").value = article.image;
            this.switchTab('news');
        },

        editMedia: function(id) {
            const item = app.state.media.find(m => m.id == id);
            if (!item) return;

            document.getElementById("mediaId").value = item.id;

            // Update Custom Dropdown for media type
            this.updateCustomDropdownValue('mediaTypeWrapper', item.type || 'image');

            document.getElementById("mediaCategory").value = item.category;
            document.getElementById("mediaUrl").value = item.url;
            document.getElementById("mediaTitle").value = item.title;

            this.switchTab('media');
        },

        downloadPlayerData: async function() {
            try {
                let players = [...(app.state.players || [])];
                if (window.db) {
                    try {
                        const snapshot = await window.db.collection('players').get();
                        players = snapshot.docs.map(doc => doc.data());
                    } catch (error) {
                        console.warn('Falling back to local player data for download.', error);
                    }
                }

                players.sort((a, b) => (a.id || 0) - (b.id || 0));

                const dataStr = JSON.stringify(players, null, 2);
                app.utils.saveFile('players.json', dataStr);
            } catch (error) {
                console.error("Error downloading player data:", error);
                alert("Failed to download player data. See console for details.");
            }
        },

        downloadMatchData: async function() {
            try {
                let matches = [...(app.state.matches || [])];
                if (window.db) {
                    try {
                        const snapshot = await window.db.collection('matches').get();
                        matches = snapshot.docs.map(doc => doc.data());
                    } catch (error) {
                        console.warn('Falling back to local match data for download.', error);
                    }
                }

                matches.sort((a, b) => (a.id || 0) - (b.id || 0));

                const dataStr = JSON.stringify(matches, null, 2);
                app.utils.saveFile('matches.json', dataStr);
            } catch (error) {
                console.error("Error downloading match data:", error);
                alert("Failed to download match data. See console for details.");
            }
        },

        exportResultsAsJson: function() {
            const sourceMatches = Array.isArray(app.state.matches) ? app.state.matches : [];

            if (sourceMatches.length === 0) {
                alert('No matches data to export. Please load or add matches first.');
                return;
            }

            const resultsData = {
                matches: sourceMatches.map((match, index) => ({
                    week: Number(match.week) || Number(match.round) || index + 1,
                    home: match.homeTeam || match.home || '',
                    away: match.awayTeam || match.away || '',
                    homeScore: match.homeScore ?? null,
                    awayScore: match.awayScore ?? null,
                    ...(match.date ? { date: match.date } : {}),
                    ...(match.venue ? { venue: match.venue } : {})
                }))
            };

            const jsonString = JSON.stringify(resultsData, null, 2);
            app.utils.saveFile('results.json', jsonString);
        },

        exportNewsAsJson: function() {
            // Export all news articles
            const newsData = app.state.news || [];

            if (newsData.length === 0) {
                alert('No news articles to export.');
                return;
            }

            const jsonString = JSON.stringify(newsData, null, 2);
            app.utils.saveFile('news.json', jsonString);
        },

        exportMediaAsJson: function() {
            // Export all media items
            const mediaData = app.state.media || [];

            if (mediaData.length === 0) {
                alert('No media items to export.');
                return;
            }

            const jsonString = JSON.stringify(mediaData, null, 2);
            app.utils.saveFile('media.json', jsonString);
        },

        deleteMedia: async function(id) {
            if (!this.userHasPermission(['Admin'])) {
                alert("You do not have permission to delete media.");
                return;
            }
            if (!await confirm('Are you sure you want to delete this media item?')) return;

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

            // Ensure permissions are updated for the newly visible tab
            this.applyRolePermissions();
            this.updateDashboard();
        }
    },

    // =================================================================
    // STATS MODULE
    // =================================================================
    stats: {
        updateAndSync: async function(events) {
            if (!events) return;

            const playersToUpdate = new Set();

            events.forEach(e => {
                const scorer = app.state.players.find(x => x.name === e.player);
                if (e.type === "goal" && scorer) {
                    scorer.goals++;
                    playersToUpdate.add(scorer);
                    if (e.assist) {
                        const assister = app.state.players.find(x => x.name === e.assist);
                        if (assister) {
                            assister.assists++;
                            playersToUpdate.add(assister);
                        }
                    }
                }
                if (e.type === "assist") {
                    const assistant = app.state.players.find(x => x.name === e.player);
                    if (assistant) {
                        assistant.assists++;
                        playersToUpdate.add(assistant);
                    }
                }
            });

            // Batch sync to Firestore
            if (window.db) {
                const batch = window.db.batch();
                playersToUpdate.forEach(p => {
                    const ref = window.db.collection('players').doc(p.id.toString());
                    batch.set(ref, p, { merge: true });
                });
                try {
                    await batch.commit();
                    console.log(`[Stats] Auto-synced ${playersToUpdate.size} players.`);
                } catch (err) {
                    console.error("[Stats] Batch sync failed:", err);
                }
            }
        },

        revert: async function(match) {
            if (!match || !match.events) return;

            const playersToRevert = new Set();

            match.events.forEach(e => {
                const p = app.state.players.find(x => x.name === e.player);
                if (e.type === "goal" && p) {
                    p.goals = Math.max(0, p.goals - 1);
                    playersToRevert.add(p);
                    if (e.assist) {
                        const assister = app.state.players.find(x => x.name === e.assist);
                        if (assister) {
                            assister.assists = Math.max(0, assister.assists - 1);
                            playersToRevert.add(assister);
                        }
                    }
                }
                if (e.type === "assist" && p) {
                    p.assists = Math.max(0, p.assists - 1);
                    playersToRevert.add(p);
                }
            });

            // Batch sync to Firestore
            if (window.db) {
                const batch = window.db.batch();
                playersToRevert.forEach(p => {
                    const ref = window.db.collection('players').doc(p.id.toString());
                    batch.set(ref, p, { merge: true });
                });
                try {
                    await batch.commit();
                } catch (err) {
                    console.error("[Stats] Batch revert failed:", err);
                }
            }
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

window.triggerExport = (fileName) => {
    switch (fileName) {
        case 'matches.json': app.ui.downloadMatchData(); break;
        case 'log.json': app.events.exportStandingsAsJson(); break;
        case 'players.json': app.ui.downloadPlayerData(); break;
        case 'news.json': app.ui.exportNewsAsJson(); break;
        case 'media.json': app.ui.exportMediaAsJson(); break;
        default: console.warn("Unknown export file:", fileName);
    }
};

document.addEventListener("DOMContentLoaded", () => app.init());
