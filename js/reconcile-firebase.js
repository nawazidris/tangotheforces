/*
  Reconcile Firestore `players` docs from match events.
  Usage (open site in browser where firebase is initialized):
    // preview only (no writes)
    reconcileFirestoreFromMatches({useFirestoreMatches:true, dryRun:true})

    // apply updates (will attempt backups)
    reconcileFirestoreFromMatches({useFirestoreMatches:true, dryRun:false})

  Notes:
  - Uses `firebase.firestore()` as the project already does elsewhere.
  - Backups are written to `players_backups` collection (may fail if rules deny writes).
  - The function exposes itself on `window` for easy console use.
*/

(async function(){
  function norm(s){ return (s||'').toString().toLowerCase().replace(/\s+/g,' ').trim(); }

  async function fetchMatchesFromServer(){
    try{
      const res = await fetch('/data/matches.json');
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(err){ console.warn('fetch /data/matches.json failed:', err); return []; }
  }

  async function reconcileFirestoreFromMatches(opts = {}){
    const { useFirestoreMatches = true, dryRun = true } = opts;
    if(typeof firebase === 'undefined' || !firebase.firestore){
      console.error('firebase not found on window. Ensure your site has initialized firebase.');
      return;
    }

    const db = firebase.firestore();

    // load matches
    let matches = [];
    if(useFirestoreMatches){
      try{
        const snap = await db.collection('matches').get();
        snap.forEach(d=> matches.push(d.data()));
      }catch(e){
        console.warn('reading matches from Firestore failed, falling back to /data/matches.json', e);
        matches = await fetchMatchesFromServer();
      }
    }else{
      matches = await fetchMatchesFromServer();
    }

    // build totals map keyed by normalized name
    const totals = {};
    function ensure(name){ const k = norm(name); if(!k) return null; if(!totals[k]) totals[k] = {name: name.trim(), goals:0, assists:0}; return totals[k]; }

    for(const m of matches || []){
      if(!m.events) continue;
      for(const e of m.events){
        if(!e || !e.type) continue;
        if(e.type === 'goal'){
          if(e.player){ const t = ensure(e.player); if(t) t.goals += 1; }
          if(e.assist){ const a = ensure(e.assist); if(a) a.assists += 1; }
        }else if(e.type === 'assist'){
          if(e.player){ const a = ensure(e.player); if(a) a.assists += 1; }
        }
      }
    }

    // get players from Firestore
    const playersSnap = await db.collection('players').get();
    const updates = [];

    function stripDiacritics(s){ return s.normalize ? s.normalize('NFD').replace(/\p{Diacritic}/gu,'') : s; }
    function normalizeNameFull(s){ if(!s) return ''; return stripDiacritics(s).toString().toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
    function tokens(s){ return (s||'').split(/\s+/).filter(Boolean); }

    function editDistance(a,b){
      // simple Levenshtein
      const A = a||''; const B = b||''; const m = A.length, n = B.length; if(m===0) return n; if(n===0) return m;
      const dp = Array.from({length:m+1},()=>new Array(n+1).fill(0));
      for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j;
      for(let i=1;i<=m;i++){
        for(let j=1;j<=n;j++){
          const cost = A[i-1]===B[j-1]?0:1;
          dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
        }
      }
      return dp[m][n];
    }

    function scoreNameMatch(candidateNorm, totalsKey){
      if(!candidateNorm || !totalsKey) return 0;
      if(candidateNorm === totalsKey) return 1.0;
      if(totalsKey.startsWith(candidateNorm) || candidateNorm.startsWith(totalsKey)) return 0.92;

      const cTokens = tokens(candidateNorm);
      const kTokens = tokens(totalsKey);
      // token overlap
      const setK = new Set(kTokens);
      const overlap = cTokens.filter(t=> setK.has(t)).length;
      const tokenScore = overlap / Math.max(kTokens.length, cTokens.length || 1);
      if(tokenScore > 0) {
        // boost if last name matches
        const lastC = cTokens[cTokens.length-1]; const lastK = kTokens[kTokens.length-1];
        const lastMatch = lastC && lastK && (lastC === lastK);
        return Math.min(0.9, 0.5 + tokenScore*0.5 + (lastMatch?0.15:0));
      }

      // fallback to edit distance similarity
      const maxLen = Math.max(candidateNorm.length, totalsKey.length, 1);
      const dist = editDistance(candidateNorm, totalsKey);
      const sim = 1 - (dist / maxLen);
      return sim;
    }

    function findTotalsForPlayer(docData){
      const candList = [];
      if(docData.nickname) candList.push(normalizeNameFull(docData.nickname));
      if(docData.name) candList.push(normalizeNameFull(docData.name));
      if(docData.aliases && Array.isArray(docData.aliases)){
        for(const a of docData.aliases) candList.push(normalizeNameFull(a));
      }
      // try number as textual token as last resort
      if(docData.number) candList.push(String(docData.number));

      const keys = Object.keys(totals).map(k=>({key:k, norm:k}));
      let best = null; let bestScore = 0;

      for(const cand of candList){
        if(!cand) continue;
        // exact quick-hit
        if(totals[cand]) return totals[cand];

        for(const k of keys){
          const score = scoreNameMatch(cand, k.norm);
          if(score > bestScore){ bestScore = score; best = k.norm; }
        }
      }

      // accept only confident matches
      if(bestScore >= 0.65 && best) return totals[best];

      return null;
    }

    for(const doc of playersSnap.docs){
      const data = doc.data();
      const found = findTotalsForPlayer(data);
      const newGoals = found ? found.goals : 0;
      const newAssists = found ? found.assists : 0;

      // compare with current
      const curGoals = (data.goals||0);
      const curAssists = (data.assists||0);
      if(curGoals === newGoals && curAssists === newAssists){
        // nothing to do
        continue;
      }

      updates.push({id: doc.id, ref: doc.ref, before: data, after: {goals:newGoals, assists:newAssists}});
    }

    console.log('Reconcile preview: found', updates.length, 'player(s) with differing totals. dryRun=', !!dryRun);
    if(updates.length === 0) return updates;

    for(const u of updates){
      console.group('Player update', u.id);
      console.log('before', u.before);
      console.log('after', u.after);
      if(dryRun){ console.log('dryRun - not writing'); console.groupEnd(); continue; }

      try{
        // backup original
        try{
          await db.collection('players_backups').add({playerId: u.id, before: u.before, ts: firebase.firestore.FieldValue.serverTimestamp()});
        }catch(bkErr){ console.warn('backup write failed for', u.id, bkErr); }

        // update player doc
        await u.ref.update(u.after);
        console.log('updated', u.id);
      }catch(err){
        console.error('failed to update', u.id, err);
      }
      console.groupEnd();
    }

    return updates;
  }

  // expose
  window.reconcileFirestoreFromMatches = reconcileFirestoreFromMatches;
  window._reconcileTotalsPreview = function(){ return console.warn('call reconcileFirestoreFromMatches({useFirestoreMatches:true,dryRun:true})'); };

})();
