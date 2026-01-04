/* EduQuest App Logic (Updated: Player profile + Back to Home menu)
   - Multi-game support
   - Levels locked/unlocked
   - Score, badges
   - localStorage persistence
   - Player profile (data diri pemain): create/update/display
*/
(() => {
  const SELECTORS = {
    pageHome: '#page-home',
    pageGames: '#page-games',
    pageLevels: '#page-levels',
    pageGame: '#page-game',
    pageProfile: '#page-profile',
    pageAbout: '#page-about',
    pageContact: '#page-contact'
  };

  // --- Game definitions (simple demo content) ---
  const GAMES = {
    'logic-quest': {
      id: 'logic-quest',
      title: 'Logic Quest',
      levels: [
        {
          title: 'Level 1 - Urutan Angka',
          instruction: 'Pilih angka yang melengkapi deret: 2, 4, 6, ?',
          question: '2, 4, 6, ?',
          choices: ['7', '8', '9', '10'],
          correct: 1,
          points: 10
        },
        {
          title: 'Level 2 - Pola Sederhana',
          instruction: 'Pilih simbol yang melengkapi pola: ★, ★★, ★★★, ?',
          question: '★, ★★, ★★★, ?',
          choices: ['★★★★', '★★', '★★★★★', '★'],
          correct: 0,
          points: 15
        },
        {
          title: 'Level 3 - Sekuen Bilangan',
          instruction: 'Cari angka selanjutnya: 1, 1, 2, 3, 5, ? (deret Fibonacci)',
          question: '1, 1, 2, 3, 5, ?',
          choices: ['6', '7', '8', '5'],
          correct: 2,
          points: 20
        }
      ]
    },
    'it-quest': {
      id: 'it-quest',
      title: 'IT Quest',
      levels: [
        {
          title: 'Level 1 - Password Kuat',
          instruction: 'Mana yang paling baik untuk membuat password kuat?',
          question: 'Pilih opsi terbaik untuk password',
          choices: ['12345678', 'password', 'NamaAnda2026!', 'qwerty'],
          correct: 2,
          points: 10
        },
        {
          title: 'Level 2 - Keamanan Akun',
          instruction: 'Mana tindakan paling aman untuk akun online?',
          question: 'Pilih tindakan yang paling aman',
          choices: ['Berbagi password dengan teman', 'Mengaktifkan 2FA', 'Menggunakan koneksi Wi‑Fi publik tanpa VPN', 'Tidak update software'],
          correct: 1,
          points: 15
        },
        {
          title: 'Level 3 - Internet Dasar',
          instruction: 'Apa itu browser?',
          question: 'Pilih jawaban yang benar',
          choices: ['Aplikasi untuk membuka situs web', 'Jenis hardware jaringan', 'Bahasa pemrograman', 'Sistem operasi'],
          correct: 0,
          points: 20
        }
      ]
    },
    'think-quest': {
      id: 'think-quest',
      title: 'Think Quest',
      levels: [
        {
          title: 'Level 1 - Pilihan Bijak',
          instruction: 'Jika Anda kehilangan tugas, tindakan terbaik adalah?',
          question: 'Apa yang harus dilakukan?',
          choices: ['Mengabaikannya', 'Menghubungi guru dan minta perpanjangan', 'Menyalin dari teman', 'Menghapus akun'],
          correct: 1,
          points: 10
        },
        {
          title: 'Level 2 - Skenario Cepat',
          instruction: 'Anda punya 30 menit untuk tugas dan 2 jam untuk bermain. Prioritas?',
          question: 'Pilih respon terbaik',
          choices: ['Main dulu', 'Kerjakan tugas terlebih dahulu', 'Lihat media sosial', 'Tidur'],
          correct: 1,
          points: 15
        },
        {
          title: 'Level 3 - Problem Solving',
          instruction: 'Bagaimana memecah masalah besar menjadi tugas kecil?',
          question: 'Pilih langkah pertama',
          choices: ['Tunda sampai selesai sendiri', 'Buat daftar sub-tugas', 'Hapus semua file', 'Langsung menyerah'],
          correct: 1,
          points: 20
        }
      ]
    },
    'edu-quiz': {
      id: 'edu-quiz',
      title: 'Edu Quiz',
      levels: [
        {
          title: 'Level 1 - Umum',
          instruction: 'Pengetahuan umum singkat',
          question: 'Ibu kota Indonesia?',
          choices: ['Bandung', 'Surabaya', 'Jakarta', 'Medan'],
          correct: 2,
          points: 10
        },
        {
          title: 'Level 2 - Sains Ringan',
          instruction: 'Apa gas yang kita hirup paling banyak?',
          question: 'Pilih jawaban',
          choices: ['Oksigen', 'Nitrogen', 'Karbondioksida', 'Hidrogen'],
          correct: 1,
          points: 15
        },
        {
          title: 'Level 3 - Sejarah Singkat',
          instruction: 'Peristiwa yang menandai kemerdekaan Indonesia?',
          question: 'Tahun proklamasi kemerdekaan?',
          choices: ['1945', '1950', '1939', '1965'],
          correct: 0,
          points: 20
        }
      ]
    }
  };

  // --- localStorage helpers ---
  const LS_KEYS = {
    progress: 'eduquest_progress',
    scores: 'eduquest_scores',
    badges: 'eduquest_badges',
    player: 'eduquest_player'
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  // initialize progress and scores
  let progress = readJSON(LS_KEYS.progress, {});
  let scores = readJSON(LS_KEYS.scores, {});
  let badges = readJSON(LS_KEYS.badges, []);
  let player = readJSON(LS_KEYS.player, null);

  // ensure each game has at least level 0 unlocked
  Object.keys(GAMES).forEach(gid => {
    if (!progress[gid]) progress[gid] = { unlocked: 1 }; // unlocked = number of unlocked levels (starts with 1)
    if (!scores[gid]) scores[gid] = 0;
  });
  writeJSON(LS_KEYS.progress, progress);
  writeJSON(LS_KEYS.scores, scores);
  writeJSON(LS_KEYS.badges, badges);

  // --- UI helpers ---
  function showPage(name) {
    Object.values(SELECTORS).forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.classList.remove('active');
    });
    const sel = SELECTORS[name];
    if (sel) {
      const el = document.querySelector(sel);
      if (el) el.classList.add('active');
    }
    // update player summary if switching to home/profile
    renderProfileSummary();
  }

  // elements
  const els = {
    playNow: document.getElementById('play-now'),
    homePlay: document.getElementById('home-play'),
    navHome: document.getElementById('nav-home'),
    navGames: document.getElementById('nav-games'),
    navLevels: document.getElementById('nav-levels'),
    navProfile: document.getElementById('nav-profile'),
    navAbout: document.getElementById('nav-about'),
    navContact: document.getElementById('nav-contact'),
    footerGames: document.getElementById('footer-games'),
    footerAbout: document.getElementById('footer-about'),
    footerProfile: document.getElementById('footer-profile'),
    pageGames: document.getElementById('page-games'),
    selectGameBtns: () => Array.from(document.querySelectorAll('.select-game')),
    levelsTitle: document.getElementById('levels-title'),
    levelsGrid: document.getElementById('levels-grid'),
    backToGames: document.getElementById('back-to-games'),
    backToLevels: document.getElementById('back-to-levels'),
    gameTitle: document.getElementById('game-title'),
    instruction: document.getElementById('instruction'),
    question: document.getElementById('question'),
    choices: document.getElementById('choices'),
    feedback: document.getElementById('feedback'),
    nextBtn: document.getElementById('next-btn'),
    restartLevel: document.getElementById('restart-level'),
    scoreSpan: document.getElementById('score'),
    levelNumberSpan: document.getElementById('level-number'),
    progressList: document.getElementById('progress-list'),
    profileForm: document.getElementById('profile-form'),
    profileName: document.getElementById('profile-name'),
    profileSchool: document.getElementById('profile-school'),
    profileType: document.getElementById('profile-type'),
    profileEmail: document.getElementById('profile-email'),
    profileDisplay: document.getElementById('profile-display'),
    profileCta: document.getElementById('profile-cta'),
    clearProfileBtn: document.getElementById('clear-profile'),
    playerBadge: document.getElementById('player-badge'),
    uiPlayerName: document.getElementById('ui-player-name'),
    profileSummary: document.getElementById('profile-summary')
  };

  // initial navigation handlers
  function setupNavigation() {
    els.playNow?.addEventListener('click', () => navigateToGames());
    els.homePlay?.addEventListener('click', () => navigateToGames());
    document.getElementById('nav-games')?.addEventListener('click', () => navigateToGames());
    document.getElementById('nav-home')?.addEventListener('click', () => showPage('pageHome'));
    document.getElementById('nav-about')?.addEventListener('click', () => showPage('pageAbout'));
    document.getElementById('nav-contact')?.addEventListener('click', () => showPage('pageContact'));
    document.getElementById('nav-profile')?.addEventListener('click', () => showPage('pageProfile'));
    document.getElementById('nav-levels')?.addEventListener('click', () => showPage('pageLevels'));
    document.getElementById('footer-games')?.addEventListener('click', () => navigateToGames());
    document.getElementById('footer-about')?.addEventListener('click', () => showPage('pageAbout'));
    document.getElementById('footer-profile')?.addEventListener('click', () => showPage('pageProfile'));

    // Back-to-home buttons present on pages
    document.querySelectorAll('.back-home').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.dataset.target || 'page-home';
        showPage(target);
      });
    });
  }

  function navigateToGames() {
    refreshProgressSummary();
    showPage('pageGames');
  }

  // Refresh small progress numbers on game cards
  function refreshProgressSummary() {
    Object.keys(GAMES).forEach(gid => {
      const el = document.getElementById(`progress-${gid}`);
      if (el) {
        el.textContent = `${progress[gid].unlocked}/${GAMES[gid].levels.length}`;
      }
    });
  }

  // When a game is selected, render level buttons
  let currentGameId = null;
  let currentLevelIndex = 0;
  function openLevelsForGame(gid) {
    currentGameId = gid;
    const game = GAMES[gid];
    els.levelsTitle.textContent = `${game.title} — Pilih Level`;
    els.levelsGrid.innerHTML = '';
    game.levels.forEach((lvl, idx) => {
      const btn = document.createElement('button');
      btn.className = 'level-btn neon-btn';
      btn.textContent = `${idx + 1}. ${lvl.title}`;
      if (idx + 1 > progress[gid].unlocked) {
        btn.classList.add('level-locked');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => startLevel(gid, idx));
      }
      els.levelsGrid.appendChild(btn);
    });
    showPage('pageLevels');
  }

  // Start a level
  let state = {
    answersGiven: 0,
    currentChoiceIndex: null
  };

  function startLevel(gid, idx) {
    currentGameId = gid;
    currentLevelIndex = idx;
    state.answersGiven = 0;
    state.currentChoiceIndex = null;
    const game = GAMES[gid];
    const lvl = game.levels[idx];
    els.gameTitle.textContent = `${game.title} — ${lvl.title}`;
    els.instruction.textContent = lvl.instruction;
    els.question.textContent = lvl.question;
    els.choices.innerHTML = '';
    els.feedback.textContent = '';
    els.nextBtn.disabled = true;
    els.levelNumberSpan.textContent = (idx + 1);
    els.scoreSpan.textContent = scores[gid] || 0;
    els.uiPlayerName.textContent = player ? player.name : 'Tamu';
    // render choices
    lvl.choices.forEach((c, i) => {
      const cb = document.createElement('button');
      cb.className = 'choice-btn';
      cb.textContent = c;
      cb.addEventListener('click', () => handleChoice(cb, i));
      els.choices.appendChild(cb);
    });
    renderProgressPanel();
    showPage('pageGame');
  }

  function handleChoice(btn, idxChoice) {
    if (state.currentChoiceIndex !== null) return; // already answered
    const game = GAMES[currentGameId];
    const lvl = game.levels[currentLevelIndex];
    const children = Array.from(els.choices.children);

    if (idxChoice === lvl.correct) {
      btn.classList.add('correct');
      els.feedback.textContent = 'Benar! +' + lvl.points + ' poin';
      // add points
      scores[currentGameId] = (scores[currentGameId] || 0) + lvl.points;
      writeJSON(LS_KEYS.scores, scores);
      // unlock next level if exists
      const unlockedNow = progress[currentGameId].unlocked;
      if (currentLevelIndex + 1 >= unlockedNow && currentLevelIndex + 1 < game.levels.length) {
        progress[currentGameId].unlocked = currentLevelIndex + 2; // unlock next
        writeJSON(LS_KEYS.progress, progress);
      }
      // visual neon success
      pulseGlow('#00ffb0');
    } else {
      btn.classList.add('wrong');
      els.feedback.textContent = 'Salah. Coba lagi atau lanjutkan.';
      pulseGlow('#ff6464');
    }
    // highlight correct one
    children[lvl.correct].classList.add('correct');
    state.currentChoiceIndex = idxChoice;
    els.nextBtn.disabled = false;
    els.scoreSpan.textContent = scores[currentGameId];
    evaluateBadges();
    renderProgressPanel();
    refreshProgressSummary();
  }

  function pulseGlow(color) {
    // temporary effect on body
    const orig = document.body.style.boxShadow;
    document.body.style.boxShadow = `inset 0 0 120px ${color}30`;
    setTimeout(() => { document.body.style.boxShadow = orig }, 500);
  }

  // Next button moves to next level or back to levels
  els.nextBtn.addEventListener('click', () => {
    const game = GAMES[currentGameId];
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex < game.levels.length && nextIndex < progress[currentGameId].unlocked) {
      startLevel(currentGameId, nextIndex);
    } else {
      // finished this branch: go back to levels
      openLevelsForGame(currentGameId);
    }
  });

  // restart level
  els.restartLevel.addEventListener('click', () => {
    startLevel(currentGameId, currentLevelIndex);
  });

  // Back buttons
  els.backToGames?.addEventListener('click', () => {
    navigateToGames();
  });
  els.backToLevels?.addEventListener('click', () => {
    openLevelsForGame(currentGameId);
  });

  // attach select game buttons (cards)
  function attachGameCardListeners() {
    document.querySelectorAll('.select-game').forEach(btn => {
      const gid = btn.getAttribute('data-game');
      btn.addEventListener('click', () => openLevelsForGame(gid));
    });
    // also support dynamically bound selects
    document.addEventListener('click', (e) => {
      if (e.target.matches('.select-game')) {
        const gid = e.target.dataset.game;
        openLevelsForGame(gid);
      }
    });
  }

  // Badges evaluation
  function evaluateBadges() {
    // simple badge rules: total score across all games
    const totalScore = Object.values(scores).reduce((a,b)=>a+b,0);
    const existing = new Set(badges);
    if (totalScore >= 30 && !existing.has('Bronze')) badges.push('Bronze');
    if (totalScore >= 60 && !existing.has('Silver')) badges.push('Silver');
    if (totalScore >= 100 && !existing.has('Gold')) badges.push('Gold');
    if (badges.length > 0) {
      writeJSON(LS_KEYS.badges, badges);
    }
  }

  function renderProgressPanel() {
    els.progressList.innerHTML = '';
    // show per game score + unlocked
    Object.keys(GAMES).forEach(gid => {
      const item = document.createElement('div');
      item.className = 'progress-item';
      item.innerHTML = `<strong>${GAMES[gid].title}</strong><div>Score: ${scores[gid] || 0}</div><div>Unlocked: ${progress[gid].unlocked}/${GAMES[gid].levels.length}</div>`;
      els.progressList.appendChild(item);
    });
    // badges
    const badgeItem = document.createElement('div');
    badgeItem.className = 'progress-item';
    badgeItem.innerHTML = `<strong>Badges</strong><div>${badges.length ? badges.join(', ') : 'Belum ada'}</div>`;
    els.progressList.appendChild(badgeItem);

    // show player data summary in progress panel area if needed (also visible in header)
    renderProfileSummary();
  }

  // --- Player profile functions ---
  function savePlayerFromForm(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    const name = els.profileName.value?.trim();
    if (!name) {
      alert('Nama wajib diisi.');
      return;
    }
    const p = {
      name,
      school: els.profileSchool.value?.trim() || '',
      type: els.profileType.value || 'umum',
      email: els.profileEmail.value?.trim() || '',
      createdAt: (player && player.createdAt) ? player.createdAt : new Date().toISOString()
    };
    player = p;
    writeJSON(LS_KEYS.player, player);
    renderProfileDisplay();
    renderProfileSummary();
    alert('Profil tersimpan.');
  }

  function clearPlayerData() {
    if (!confirm('Hapus data profil pemain?')) return;
    player = null;
    localStorage.removeItem(LS_KEYS.player);
    renderProfileDisplay();
    renderProfileSummary();
  }

  function renderProfileDisplay() {
    if (!els.profileDisplay) return;
    if (!player) {
      els.profileDisplay.innerHTML = `<div>Belum ada data pemain. Klik "Isi / Perbarui Data Diri" untuk menambah.</div>`;
      els.profileName.value = '';
      els.profileSchool.value = '';
      els.profileEmail.value = '';
      els.profileType.value = 'umum';
      return;
    }
    const html = `
      <div><strong>Nama:</strong> ${escapeHtml(player.name)}</div>
      <div><strong>Sekolah / Kelas:</strong> ${escapeHtml(player.school || '-')}</div>
      <div><strong>Jenis:</strong> ${escapeHtml(player.type)}</div>
      <div><strong>Email:</strong> ${escapeHtml(player.email || '-')}</div>
      <div style="margin-top:8px;color:var(--muted);font-size:12px;"><em>Terdaftar: ${new Date(player.createdAt).toLocaleString()}</em></div>
    `;
    els.profileDisplay.innerHTML = html;
    // populate form inputs
    els.profileName.value = player.name || '';
    els.profileSchool.value = player.school || '';
    els.profileType.value = player.type || 'umum';
    els.profileEmail.value = player.email || '';
  }

  function renderProfileSummary() {
    // show small summary in home and header
    if (player) {
      if (els.playerBadge) els.playerBadge.textContent = `Player: ${player.name}`;
      if (els.profileSummary) els.profileSummary.innerHTML = `<strong>${escapeHtml(player.name)}</strong><div style="font-size:13px;color:var(--muted)">${escapeHtml(player.school || player.type || '')}</div><div style="margin-top:6px"><button id="profile-cta-inline" class="neon-btn small">Lihat Profil</button></div>`;
      // update UI player name in game header
      if (els.uiPlayerName) els.uiPlayerName.textContent = player.name;
      // attach inline CTA listener (if present)
      const inline = document.getElementById('profile-cta-inline');
      if (inline) inline.addEventListener('click', () => showPage('pageProfile'));
    } else {
      if (els.playerBadge) els.playerBadge.textContent = 'Player: Tamu';
      if (els.profileSummary) els.profileSummary.innerHTML = `Belum ada data pemain. <br><button id="profile-cta" class="neon-btn small">Isi Profil</button>`;
      const cta = document.getElementById('profile-cta');
      if (cta) cta.addEventListener('click', () => showPage('pageProfile'));
      if (els.uiPlayerName) els.uiPlayerName.textContent = 'Tamu';
    }
  }

  // utility to prevent injection
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
  }

  // initial render
  function init() {
    setupNavigation();
    attachGameCardListeners();
    refreshProgressSummary();
    renderProgressPanel();
    renderProfileDisplay();
    renderProfileSummary();

    // profile form events
    els.profileForm?.addEventListener('submit', savePlayerFromForm);
    els.clearProfileBtn?.addEventListener('click', clearPlayerData);
    els.profileCta?.addEventListener('click', () => showPage('pageProfile'));

    // set initial page
    showPage('pageHome');
  }

  // clear data - for development (not exposed in UI)
  window._eduquest_clear_data = function(){
    localStorage.removeItem(LS_KEYS.progress);
    localStorage.removeItem(LS_KEYS.scores);
    localStorage.removeItem(LS_KEYS.badges);
    localStorage.removeItem(LS_KEYS.player);
    location.reload();
  };

  // run
  init();
})();