const app = {
    state: {
        players: [],
        matches: [],
        currentEvents: [],
        rosterPlayers: [],
        news: [],
        media: [],
        currentUser: null,
    },

    init: async function() {
        if (!this.auth.check()) return;
        await this.data.loadAll();
        this.events.bind();
        this.ui.applyRolePermissions();
        this.ui.renderAll();
        this.ui.updateDashboard();
        this.ui.loadAdminStandings();
    },

    // =================================================================
    // AUTH MODULE
    // =================================================================
    auth: {
        check: function() {
            const userJson = sessionStorage.getItem('tangoUser');
            if (!userJson) {
                window.location.href = "login.html";
                return false;
            }
            app.state.currentUser = JSON.parse(userJson);
            const nameEl = document.getElementById('sessionUserName');
            const roleEl = document.getElementById('sessionUserRole');
            if (nameEl) nameEl.textContent = app.state.currentUser.name;
            if (roleEl) roleEl.textContent = `Role: ${app.state.currentUser.role}`;
            return true;
        },
        logout: function() {
            sessionStorage.clear();
            window.location.href = "index.html"; // Redirects to site home page
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

            // Clean fallback in case getMergedPlayers does not resolve on load
            let mergedPlayers = [];
            try {
                if (typeof getMergedPlayers === 'function') {
                    mergedPlayers = getMergedPlayers();
                } else {
                    mergedPlayers = players;
                }
            } catch (e) {
                console.warn("Base roster merge configuration not accessible, raw defaults applied.", e);
                mergedPlayers = players;
            }

            // Asynchronously merge base matches from matches.json with overrides and deletions
            let mergedMatches = [];
            try {
                mergedMatches = await this.getMergedMatches(matches);
            } catch (e) {
                console.warn("Base matches merge failed, fallback to local matches:", e);
                mergedMatches = matches;
            }

            app.state.players = mergedPlayers;
            app.state.matches = mergedMatches;
            app.state.news = news;
            app.state.media = media;
            await this.loadRosterPlayers();
        },

        getMergedMatches: async function(adminMatches) {
            let baseMatches = [];
            let deletedMatchIds = [];
            
            try {
                const response = await fetch('data/matches.json');
                if (response.ok) {
                    baseMatches = await response.json();
                }
            } catch (e) {
                console.warn("Could not fetch matches.json, operating on saved matches only.", e);
            }

            try {
                deletedMatchIds = JSON.parse(localStorage.getItem('deletedBaseMatchIds') || '[]').map(Number);
            } catch (e) {
                console.warn("Could not parse deleted matches tracking list:", e);
            }

            // 1. Filter out base fixtures that have been deleted by the admin
            const activeBaseMatches = baseMatches.filter(m => !deletedMatchIds.includes(Number(m.id)));

            if (!adminMatches || adminMatches.length === 0) {
                return activeBaseMatches;
            }

            const adminMap = new Map(adminMatches.map(m => [Number(m.id), m]));

            // 2. Map overrides onto remaining active base fixtures
            const merged = activeBaseMatches.map(m => adminMap.has(m.id) ? { ...m, ...adminMap.get(m.id) } : m);
            const baseIds = new Set(activeBaseMatches.map(m => m.id));

            // 3. Append entirely new fixtures added by the admin
            adminMatches.forEach(m => {
                const mId = Number(m.id);
                if (!baseIds.has(mId) && !deletedMatchIds.includes(mId)) {
                    merged.push(m);
                }
            });

            return merged;
        },

        savePlayers: async function() {
            localStorage.setItem("adminPlayers", JSON.stringify(app.state.players));
            localStorage.setItem("allPlayers", JSON.stringify(app.state.players));
            if (window.db) {
                try {
                    const batch = window.db.batch();
                    app.state.players.forEach(p => {
                        const docRef = window.db.collection('players').doc(p.id.toString());
                        batch.set(docRef, p);
                    });
                    await batch.commit();
                } catch(e) { console.error("Firebase save players failed:", e); }
            }
        },

        saveMatches: async function() {
            localStorage.setItem("adminMatches", JSON.stringify(app.state.matches));
            if (window.db) {
                try {
                    const batch = window.db.batch();
                    app.state.matches.forEach(m => {
                        const docRef = window.db.collection('matches').doc(m.id.toString());
                        batch.set(docRef, m);
                    });
                    await batch.commit();
                } catch(e) { console.error("Firebase save matches failed:", e); }
            }
        },

        saveNews: async function() {
            localStorage.setItem("adminNews", JSON.stringify(app.state.news));
            if (window.db) {
                try {
                    const batch = window.db.batch();
                    app.state.news.forEach(article => {
                        const docRef = window.db.collection('news').doc(article.id.toString());
                        batch.set(docRef, article);
                    });
                    await batch.commit();
                } catch (e) { console.error("Firebase save news failed:", e); }
            }
        },

        saveMedia: async function() {
            localStorage.setItem("adminMedia", JSON.stringify(app.state.media));
            if (window.db) {
                try {
                    const batch = window.db.batch();
                    app.state.media.forEach(item => {
                        const docRef = window.db.collection('media').doc(item.id.toString());
                        batch.set(docRef, item);
                    });
                    await batch.commit();
                } catch (e) { console.error("Firebase save media failed:", e); }
            }
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
            document.getElementById("standingsFileInput")?.addEventListener("change", this.handleStandingsUpload);
            document.getElementById("newsForm")?.addEventListener("submit", this.handleNewsFormSubmit);
            document.getElementById("mediaForm")?.addEventListener("submit", this.handleMediaFormSubmit);
            document.querySelector('.btn-logout')?.addEventListener('click', () => app.auth.logout());
            document.getElementById("eventType")?.addEventListener('change', app.ui.toggleAssistField);
        },

        handlePlayerFormSubmit: function(e) {
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
                assists:     Number(document.getElementById("playerAssists").value) || 0
            };
            const idx = app.state.players.findIndex(p => p.id === player.id);
            if (idx > -1) app.state.players[idx] = player; else app.state.players.push(player);
            
            app.data.savePlayers();
            app.data.addOrUpdateRosterPlayer(player);
            e.target.reset();
            document.getElementById("playerId").value = "";
            app.ui.renderPlayers();
            app.ui.populatePlayerDropdown();
            app.ui.updateDashboard();
        },

        handleMatchFormSubmit: function(e) {
            e.preventDefault();
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

            const idx = app.state.matches.findIndex(m => m.id == match.id);
            if (idx > -1) {
                app.stats.revert(app.state.matches[idx]);
                app.state.matches[idx] = match;
            } else {
                app.state.matches.push(match);
            }

            if (match.status === 'completed') { app.stats.update(match.events); }

            app.data.saveMatches();
            e.target.reset();
            app.state.currentEvents = [];
            app.ui.renderEventList();
            app.ui.renderMatches();
            app.ui.updateDashboard();
        },

        handleNewsFormSubmit: function(e) {
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

            const idx = app.state.news.findIndex(a => a.id == article.id);
            if (idx > -1) {
                app.state.news[idx] = article;
            } else {
                app.state.news.unshift(article);
            }
            app.data.saveNews();
            e.target.reset();
            app.ui.renderNews();
        },

        handleMediaFormSubmit: function(e) {
            e.preventDefault();
            const mediaItem = {
                id: document.getElementById("mediaId").value || Date.now().toString(),
                type: document.getElementById("mediaType").value,
                category: document.getElementById("mediaCategory").value,
                url: document.getElementById("mediaUrl").value,
                title: document.getElementById("mediaTitle").value,
            };

            const idx = app.state.media.findIndex(m => m.id == mediaItem.id);
            if (idx > -1) {
                app.state.media[idx] = mediaItem;
            } else {
                app.state.media.unshift(mediaItem);
            }
            app.data.saveMedia();
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
                    try { parsed = JSON.parse(text); } catch { parsed = null; }
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
            app.state.currentEvents.splice(i, 1);
            app.ui.renderEventList();
        }
    },

    // =================================================================
    // UI & RENDER MODULE
    // =================================================================
    ui: {
        applyRolePermissions: function() {
            const role = app.state.currentUser?.role;
            if (role === 'Coach') {
                const readonlyMsg = document.getElementById('playerFormReadOnlyMsg');
                if (readonlyMsg) readonlyMsg.style.display = 'block';
                const playerForm = document.getElementById('playerForm');
                if (playerForm) {
                    const inputs = playerForm.querySelectorAll('input, select, textarea, button');
                    inputs.forEach(el => el.setAttribute('disabled', 'true'));
                }
            }
        },

        renderAll: function() {
            this.renderPlayers();
            this.renderMatches();
            this.renderNews();
            this.renderMedia();
            this.populatePlayerDropdown();
        },

        renderPlayers: function() {
            const container = document.getElementById("playersList");
            if (!container) return;

            const players = app.state.players;
            const role = app.state.currentUser?.role;
            const canEdit   = role === 'Admin' || role === 'Logistics';
            const canDelete = role === 'Admin';

            const positionOrder = { Forward: 1, Midfielder: 2, Defender: 3, Goalkeeper: 4 };
            const sorted = [...players].sort((a, b) =>
                (positionOrder[a.position] || 9) - (positionOrder[b.position] || 9)
            );

            const groups = {};
            sorted.forEach(p => {
                const pos = p.position || 'Other';
                if (!groups[pos]) groups[pos] = [];
                groups[pos].push(p);
            });

            if (players.length === 0) {
                container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No squad entries detected.</p>';
                return;
            }

            const buildCard = (p) => {
                const img = p.playerImage || p.image || '';
                const thumb = img
                    ? `<img src="${img}" alt="${p.name}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;">`
                    : `<div style="width:44px;height:44px;border-radius:10px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:var(--blue);flex-shrink:0;">${p.name.substring(0,3)}</div>`;

                const editBtn = canEdit
                    ? `<button class="btn-edit" onclick="window.app.ui.editPlayer(${p.id})" style="padding:6px 14px;font-size:0.8rem;"><i class="fa-solid fa-pen"></i> EDIT</button>`
                    : '';
                const deleteBtn = canDelete
                    ? `<button class="btn-delete" onclick="window.app.ui.deletePlayer(${p.id})" style="padding:6px 10px;font-size:0.8rem;"><i class="fa-solid fa-trash"></i></button>`
                    : '';

                return `
                    <div class="admin-player-card">
                        ${thumb}
                        <div style="flex:1;min-width:0;">
                            <strong style="display:block;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</strong>
                            <span style="color:var(--muted);font-size:0.8rem;">#${p.number || '—'} · ${p.position || 'Forward'}</span>
                        </div>
                        <div style="display:flex;gap:6px;flex-shrink:0;">${editBtn} ${deleteBtn}</div>
                    </div>`;
            };

            let html = '';
            Object.entries(groups).forEach(([pos, groupPlayers]) => {
                html += `
                    <div class="roster-group-header">${pos.toUpperCase()} REGISTERED ROSTER (${groupPlayers.length} PLAYERS)</div>
                    <div class="admin-players-grid">${groupPlayers.map(buildCard).join('')}</div>`;
            });

            container.innerHTML = html;
        },

        renderMatches: function() {
            const container = document.getElementById("matchesList");
            if (!container) return;
            if (app.state.matches.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No matches registered.</p>`;
                return;
            }
            container.innerHTML = app.state.matches.map(m => {
                const score = m.status === 'completed' ? `${m.homeScore} – ${m.awayScore}` : 'Upcoming';
                const colour = m.status === 'completed' ? 'var(--green)' : 'var(--gold)';
                return `
                    <div class="admin-list-item">
                        <div class="admin-list-item-info">
                            <strong>${m.homeTeam} vs ${m.awayTeam}</strong>
                            <span>${m.date || 'No date'} · ${m.venue || 'No venue'} · <span style="color:${colour};">${score}</span></span>
                        </div>
                        <div class="admin-list-actions">
                            <button class="btn-edit" onclick="window.app.ui.editMatch(${m.id})">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            <button class="btn-delete" onclick="window.app.ui.deleteMatch(${m.id})">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join("");
        },

        deleteMatch: function(id) {
            if (!confirm('Are you sure you want to delete this match? This will also revert any associated goals and assists from the players roster.')) return;
            const idx = app.state.matches.findIndex(m => m.id == id);
            if (idx > -1) {
                const match = app.state.matches[idx];
                if (match.status === 'completed') {
                    app.stats.revert(match);
                }

                // Track explicitly deleted base match IDs so they never reload from the static JSON
                try {
                    const deletedIds = JSON.parse(localStorage.getItem('deletedBaseMatchIds') || '[]');
                    if (!deletedIds.includes(Number(match.id))) {
                        deletedIds.push(Number(match.id));
                        localStorage.setItem('deletedBaseMatchIds', JSON.stringify(deletedIds));
                    }
                } catch (e) {
                    console.error("Failed to track deleted match ID:", e);
                }

                app.state.matches.splice(idx, 1);
                app.data.saveMatches();
                this.renderMatches();
                this.updateDashboard();
            }
        },

        renderNews: function() {
            const container = document.getElementById("newsList");
            if (!container) return;
            if (app.state.news.length === 0) {
                container.innerHTML = `<p style="color:var(--muted);font-size:0.9rem;padding:16px 0;">No news articles published yet.</p>`;
                return;
            }
            container.innerHTML = app.state.news.map(article => {
                const date = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                return `
                    <div class="admin-list-item">
                        <div class="admin-list-item-info">
                            <strong>${article.title}</strong>
                            <span>Published on ${date} · Tag: ${article.tag || 'None'}</span>
                        </div>
                        <div class="admin-list-actions">
                            <button class="btn-edit" onclick="window.app.ui.editNews('${article.id}')">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            ${app.state.currentUser?.role === 'Admin' ? `
                            <button class="btn-delete" onclick="window.app.ui.deleteNews('${article.id}')">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join("");
        },

        renderMedia: function() {
            const container = document.getElementById("mediaList");
            if (!container) return;
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
                        <div class="admin-list-actions">
                            <button class="btn-edit" onclick="window.app.ui.editMedia('${item.id}')">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>
                            ${app.state.currentUser?.role === 'Admin' ? `
                            <button class="btn-delete" onclick="window.app.ui.deleteMedia('${item.id}')">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                            ` : ''}
                        </div>
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
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        },

        addStandingsRow: function() {
            this.addStandingsEditorRow();
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

            localStorage.setItem('leagueStandingsJson', JSON.stringify(parsed));
            if (window.db) {
                try {
                    await window.db.collection('settings').doc('standings').set({ data: JSON.stringify(parsed) });
                } catch (e) { console.error('Firebase save standings failed:', e); }
            }

            this.renderStandingsPreview(parsed);
            alert('League Standings saved.');
        },

        parseStandingText: function(text) {
            if (!text || typeof text !== 'string') return null;
            const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) return null;

            const headers = lines[0].match(/\S+/g) || [];
            if (headers.length < 3) return null;

            const rows = lines.slice(1).map(line => {
                const tokens = line.match(/\S+/g) || [];
                if (tokens.length === headers.length) return tokens;
                if (tokens.length >= headers.length + 1) {
                    const position = tokens[0];
                    const stats    = tokens.slice(-8);
                    const teamName = tokens.slice(1, tokens.length - 8).join(' ');
                    return [position, teamName, ...stats];
                }
                return null;
            }).filter(row => row && row.length === headers.length);

            return rows.length ? { headers, rows } : null;
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
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            preview.appendChild(table);
        },

        loadAdminStandings: function() {
            const stored = localStorage.getItem('leagueStandingsJson');
            if (!stored) return;
            try { 
                const parsed = JSON.parse(stored);
                this.renderStandingsPreview(parsed); 
                this.loadStandingsToEditor(parsed);
            }
            catch (e) { console.warn('Could not restore cached standings values.', e); }
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
            this.switchTab('players');
        },

        deletePlayer: function(id) {
            if (!confirm('Are you sure you want to delete this player?')) return;

            const index = app.state.players.findIndex(p => p.id === id);
            if (index > -1) {
                const player = app.state.players[index];
                
                // Track deleted IDs in localStorage to ensure they don't reappear on reload
                try {
                    const deletedIds = JSON.parse(localStorage.getItem('deletedBasePlayerIds') || '[]');
                    if (!deletedIds.includes(player.id)) {
                        deletedIds.push(player.id);
                        localStorage.setItem('deletedBasePlayerIds', JSON.stringify(deletedIds));
                    }
                } catch (e) {
                    console.error("Failed to track deleted player ID:", e);
                }

                app.state.players.splice(index, 1);
                app.data.savePlayers();
                app.ui.renderPlayers();
                app.ui.updateDashboard();
            }
        },

        deleteNews: function(id) {
            if (!confirm('Are you sure you want to delete this article?')) return;

            const index = app.state.news.findIndex(a => a.id == id);
            if (index > -1) {
                app.state.news.splice(index, 1);
                app.data.saveNews();
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

        deleteMedia: function(id) {
            if (!confirm('Are you sure you want to delete this media item?')) return;

            const index = app.state.media.findIndex(m => m.id == id);
            if (index > -1) {
                app.state.media.splice(index, 1);
                app.data.saveMedia();
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
            app.data.savePlayers();
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
            app.data.savePlayers();
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