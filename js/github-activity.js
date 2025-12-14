document.addEventListener('DOMContentLoaded', () => {
    const username = 'StaticVish'; // Hardcoded for now, or could be fetched/parsed
    const eventList = document.getElementById('github-events');
    const repoGrid = document.getElementById('github-repos');

    if (!eventList || !repoGrid) return;

    // Fetch Events
    fetch(`https://api.github.com/users/${username}/events?per_page=5`)
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.startsWith('API rate limit')) {
                eventList.innerHTML = '<div class="error-state">Rate limit exceeded. Try again later.</div>';
                return;
            }
            if (data.length === 0) {
                eventList.innerHTML = '<div class="empty-state">No recent activity.</div>';
                return;
            }

            const events = data.filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'PullRequestEvent').slice(0, 5);
            
            eventList.innerHTML = events.map(event => {
                let action = '';
                let details = '';
                
                if (event.type === 'PushEvent') {
                    action = 'pushed to';
                    if (event.payload.commits && event.payload.commits.length > 0) {
                        details = `<div class="event-details">"${event.payload.commits[0].message}"</div>`;
                    }
                } else if (event.type === 'CreateEvent') {
                    action = `created ${event.payload.ref_type}`;
                } else if (event.type === 'PullRequestEvent') {
                    action = `${event.payload.action} PR`;
                    details = `<div class="event-details">${event.payload.pull_request.title}</div>`;
                }

                const repoName = event.repo.name.split('/')[1]; // Show mostly the repo name
                const date = new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                return `
                    <div class="github-event animate-slide-in">
                        <div class="event-icon">
                            <i class="fab fa-github"></i>
                        </div>
                        <div class="event-content">
                            <div class="event-header">
                                <span class="event-action">${action}</span>
                                <a href="https://github.com/${event.repo.name}" target="_blank" class="event-repo">${repoName}</a>
                                <span class="event-date">${date}</span>
                            </div>
                            ${details}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('GitHub API Error:', err);
            eventList.innerHTML = '<div class="error-state">Failed to load activity.</div>';
        });

    // Fetch Repos
    fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`)
        .then(response => response.json())
        .then(data => {
             if (data.message && data.message.startsWith('API rate limit')) {
                repoGrid.innerHTML = '<div class="error-state">Rate limit exceeded.</div>';
                return;
            }
            
            // Filter out forks if desired, or keep them. Let's keep genuine top work.
            const repos = data.slice(0, 4); 

            repoGrid.innerHTML = repos.map((repo, index) => {
                return `
                    <a href="${repo.html_url}" target="_blank" class="repo-card animate-fade-in" style="animation-delay: ${index * 0.1}s">
                        <div class="repo-header">
                            <h4>${repo.name}</h4>
                            <div class="repo-stats">
                                <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                                <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                            </div>
                        </div>
                        <p class="repo-desc">${repo.description || 'No description available.'}</p>
                        <div class="repo-footer">
                            <span class="repo-lang">
                                <span class="lang-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
                                ${repo.language || 'Unknown'}
                            </span>
                        </div>
                    </a>
                `;
            }).join('');
        })
        .catch(err => {
            console.error('GitHub Repos Error:', err);
            repoGrid.innerHTML = '<div class="error-state">Failed to load repos.</div>';
        });
});

function getLanguageColor(lang) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Go': '#00ADD8',
        'Shell': '#89e051'
    };
    return colors[lang] || '#ccc';
}
