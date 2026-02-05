document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token-input');
    const saveBtn = document.getElementById('save-token');
    const scrapeBtn = document.getElementById('scrape-btn');
    const resetBtn = document.getElementById('reset-token');
    const authSection = document.getElementById('auth-section');
    const actionSection = document.getElementById('action-section');
    const statusDiv = document.getElementById('status');

    // Load Token
    chrome.storage.local.get(['authToken'], (result) => {
        if (result.authToken) {
            showActions();
        }
    });

    // Save Token
    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (!token) return;
        chrome.storage.local.set({ authToken: token }, () => {
            showActions();
            setStatus('Token saved!');
        });
    });

    // Reset Token
    resetBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['authToken'], () => {
            authSection.classList.remove('hidden');
            actionSection.classList.add('hidden');
            tokenInput.value = '';
            setStatus('');
        });
    });

    // Scrape & Sync
    scrapeBtn.addEventListener('click', async () => {
        setStatus('Scraping LinkedIn...');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.url.includes('linkedin.com/my-items/saved-jobs')) {
            setStatus('You are not on the "Applied Jobs" page.');

            // Create a link dynamically
            const link = document.createElement('a');
            link.href = 'https://www.linkedin.com/my-items/saved-jobs/?cardType=APPLIED';
            link.target = '_blank';
            link.className = 'premium-link';

            link.innerHTML = `
              <svg style="width:16px;height:16px;margin-bottom:-3px;margin-right:5px;fill:currentColor;" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Go to Applied Jobs Vault
            `;

            const existingLink = document.getElementById('redirect-link');
            if (!existingLink) {
                link.id = 'redirect-link';
                statusDiv.appendChild(link);
            }
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scrapeLinkedInJobs,
        }, async (results) => {
            if (!results || !results[0] || !results[0].result) {
                setStatus('❌ Failed to scrape. Are you on the right page?');
                return;
            }

            const jobs = results[0].result;
            if (jobs.length === 0) {
                setStatus('⚠️ No jobs found on this page.');
                return;
            }

            setStatus(`Found ${jobs.length} jobs. Syncing...`);

            // Send to Backend
            chrome.storage.local.get(['authToken'], async (data) => {
                try {
                    const res = await fetch('http://localhost:5001/api/automation/extension-sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.authToken}`
                        },
                        body: JSON.stringify({ jobs })
                    });

                    if (res.ok) {
                        const json = await res.json();
                        setStatus(`✅ Success! Added ${json.added} new jobs.`);
                    } else {
                        setStatus('❌ Sync failed. Check token.');
                    }
                } catch (err) {
                    setStatus('❌ Network error. Check if server is running.');
                }
            });
        });
    });

    function showActions() {
        authSection.classList.add('hidden');
        actionSection.classList.remove('hidden');
    }

    function setStatus(msg) {
        statusDiv.textContent = msg;
    }
});

// The Function injected into the page
function scrapeLinkedInJobs() {
    const jobs = [];
    // Select the job cards (List view in 'My Items')
    const cards = document.querySelectorAll('.reusable-search__result-container');

    cards.forEach(card => {
        try {
            const titleEl = card.querySelector('.entity-result__title-text a');
            const companyEl = card.querySelector('.entity-result__primary-subtitle');
            const secondarySubtitle = card.querySelector('.entity-result__secondary-subtitle'); // Often location or metadata

            if (titleEl && companyEl) {
                let role = titleEl.innerText.trim().replace(/\n/g, '');
                // Remove "View" or other screen reader text usually hidden but grabbed by innerText
                // LinkedIn scraping is messy, keeping it simple for now

                const company = companyEl.innerText.trim();

                jobs.push({
                    company,
                    role,
                    status: 'Applied',
                    date: new Date().toISOString(), // Default to now, as "Applied X ago" is hard to parse
                    source: 'linkedin_extension'
                });
            }
        } catch (e) {
            console.error('Error parsing card', e);
        }
    });

    return jobs;
}
