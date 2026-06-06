(function () {
	const STORAGE_KEY = 'theme';
	const stored = localStorage.getItem(STORAGE_KEY);
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	const theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
	document.documentElement.dataset.theme = theme;
})();
