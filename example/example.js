function start() {

    function qsa(item) {
        return document.querySelectorAll(item);
    };

	qsa('#gridHolder')[0].gridOut({
		showGridLines: true,
		movables: '.widget'
	});

	function addElement() {
		qsa('#gridHolder').append("<div class='widget'></div>")
	};
};