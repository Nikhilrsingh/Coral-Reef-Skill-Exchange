/*
 * Skill Challenges — reusable coin-reward component
 * -------------------------------------------------
 * Demo mode: stores completed demo challenges in localStorage and awards coins
 * through the onReward callback. This is useful for a frontend prototype only.
 *
 * Production mode: pass verifyChallenge(challengeId). Your backend must verify
 * completion and update the user's wallet securely. Never trust client-side
 * coin values or localStorage for real rewards.
 *
 * Usage:
 *   SkillChallenges.mount({
 *     container: '#skill-challenges',
 *     getCoins: () => currentCoins,
 *     onReward: ({ challenge, coins }) => addCoinsToFrontend(coins),
 *     verifyChallenge: async (challengeId) => {
 *       const res = await fetch('/api/skill-challenges/claim', {
 *         method: 'POST', headers: {'Content-Type':'application/json'},
 *         body: JSON.stringify({ challengeId })
 *       });
 *       if (!res.ok) throw new Error('Challenge could not be verified');
 *       return await res.json(); // { success:true, coinsAwarded:50 }
 *     }
 *   });
 */
(function (global) {
  'use strict';

  const CHALLENGES = [
    {
      id: 'vc-hour', title: 'Complete a 1-hour VC learning session',
      description: 'Attend a full video-call session to learn a skill.',
      coins: 50, icon: '🎧', requirement: 'One completed 60-minute session'
    },
    {
      id: 'teach-learn', title: 'Teach or learn a simple skill',
      description: 'Share or practise a skill such as baking, cooking, drawing or coding in a VC session.',
      coins: 20, icon: '🧁', requirement: 'A completed skill interaction'
    },
    {
      id: 'perfect-test', title: 'Get every answer correct',
      description: 'Finish a skill quiz with a perfect score.',
      coins: 25, icon: '📝', requirement: '100% quiz score'
    },
    {
      id: 'no-hints', title: 'Complete a skill test without hints',
      description: 'Show what you know by completing a test without opening hints.',
      coins: 15, icon: '🌟', requirement: 'Completed test with zero hints used'
    }
  ];

  const STORAGE_KEY = 'reefSkillChallengesDemo_v1';
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function mount(options) {
    options = options || {};
    const root = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;
    if (!root) throw new Error('SkillChallenges: container element not found.');

    const getCoins = typeof options.getCoins === 'function' ? options.getCoins : () => 0;
    const onReward = typeof options.onReward === 'function' ? options.onReward : () => {};
    const verifyChallenge = typeof options.verifyChallenge === 'function' ? options.verifyChallenge : null;
    const demoMode = options.demoMode !== false && !verifyChallenge;
    let busy = new Set();
    let claimed = new Set();
    let notice = '';

    if (demoMode) {
      try { claimed = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
      catch (_) { claimed = new Set(); }
    }

    const styleId = 'reef-skill-challenges-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .reef-challenges{font-family:inherit;color:#30405c}
        .reef-challenges__notice{font-size:13px;margin:8px 0;color:#427d70;min-height:1.2em}
        .reef-challenges__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
        .reef-challenge{background:#fff;border:2px solid #eadcf5;border-radius:16px;padding:13px;box-shadow:0 3px 0 #eee4f5;display:flex;flex-direction:column;gap:7px}
        .reef-challenge__icon{font-size:25px}.reef-challenge__title{font-size:14px;font-weight:800;line-height:1.3}
        .reef-challenge__description,.reef-challenge__requirement{font-size:12px;color:#71809b;line-height:1.45}
        .reef-challenge__coins{font-size:13px;font-weight:900;color:#936a1b;margin-top:auto}
        .reef-challenge__claim{margin-top:4px;padding:9px 12px;border:2px solid #f4c7dd;border-radius:12px;background:#fff0f7;color:#784568;font:inherit;font-weight:800;cursor:pointer}
        .reef-challenge__claim:disabled{opacity:.55;cursor:not-allowed}
        .reef-challenges__demo{font-size:11px;color:#9a7b45;margin:10px 0 0}
        @media(max-width:520px){.reef-challenges__grid{grid-template-columns:1fr}}
      `;
      document.head.appendChild(style);
    }

    function render() {
      root.innerHTML = `
        <section class="reef-challenges" aria-label="Skill challenges">
          <div class="reef-challenges__grid">
            ${CHALLENGES.map(challenge => {
              const done = claimed.has(challenge.id);
              const isBusy = busy.has(challenge.id);
              return `<article class="reef-challenge" data-challenge="${challenge.id}">
                <div class="reef-challenge__icon" aria-hidden="true">${challenge.icon}</div>
                <div class="reef-challenge__title">${escapeHTML(challenge.title)}</div>
                <div class="reef-challenge__description">${escapeHTML(challenge.description)}</div>
                <div class="reef-challenge__requirement">Goal: ${escapeHTML(challenge.requirement)}</div>
                <div class="reef-challenge__coins">+${challenge.coins} reef coins</div>
                <button class="reef-challenge__claim" type="button" data-claim="${challenge.id}" ${done || isBusy ? 'disabled' : ''}>
                  ${done ? '✓ Reward collected' : isBusy ? 'Checking…' : 'Claim demo reward'}
                </button>
              </article>`;
            }).join('')}
          </div>
          <div class="reef-challenges__notice" role="status" aria-live="polite">${escapeHTML(notice)}</div>
          ${demoMode ? '<p class="reef-challenges__demo">Demo mode: progress is stored in this browser only. Connect a backend verifier before using real rewards.</p>' : ''}
        </section>`;
      root.querySelectorAll('[data-claim]').forEach(button => {
        button.addEventListener('click', () => claim(button.dataset.claim));
      });
    }

    async function claim(id) {
      const challenge = CHALLENGES.find(item => item.id === id);
      if (!challenge || claimed.has(id) || busy.has(id)) return;
      busy.add(id); notice = ''; render();
      try {
        let result;
        if (verifyChallenge) {
          result = await verifyChallenge(id);
          if (!result || result.success !== true) throw new Error((result && result.message) || 'The challenge has not been verified yet.');
          const awarded = Number.isFinite(result.coinsAwarded) ? result.coinsAwarded : challenge.coins;
          await onReward({ challenge, coins: awarded, result, demo: false });
          claimed.add(id);
        } else {
          if (!demoMode) throw new Error('A backend verifier is required to claim rewards.');
          claimed.add(id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(claimed)));
          await onReward({ challenge, coins: challenge.coins, demo: true });
        }
        notice = `🎉 ${challenge.coins} reef coins earned! Current balance: ${getCoins()}`;
      } catch (error) {
        notice = error && error.message ? error.message : 'Could not claim this reward. Please try again.';
      } finally {
        busy.delete(id); render();
      }
    }

    render();
    return {
      challenges: CHALLENGES.map(item => ({ ...item })),
      refresh: render,
      resetDemoProgress() {
        if (!demoMode) throw new Error('Demo progress reset is only available in demo mode.');
        claimed.clear();
        localStorage.removeItem(STORAGE_KEY);
        notice = 'Demo challenge progress reset.';
        render();
      }
    };
  }

  global.SkillChallenges = { mount, challenges: CHALLENGES.map(item => ({ ...item })) };
})(window);
