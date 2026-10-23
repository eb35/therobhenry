(function () {
	document.documentElement.classList.remove('no-js');
	try {
		if (localStorage.getItem('wordpressArchiveTheme') === 'dark') {
			document.documentElement.classList.add('is-dark-theme');
		}
	} catch {
		/* Storage can be blocked; the archive stays on the light theme. */
	}
})();
