(function () {
    'use strict';

    var defaults = {
        gridSize: [10, 10],
        showGridLines: false,
        movables: ""
    };


    function getBlocks(gridSize) {
        var newBlockString = "<div class='gridOut--layoutHolder' style='width: 100%; height: 100%; position: relative; z-index: -1;'>";
        var newGrid = document.createElement('div');
        newGrid.className = "gridOut--layoutHolder";
        newGrid.style.width = "100%";
        newGrid.style.height = "100%";
        newGrid.style.position = "relative";
        newGrid.style.zIndex = -1;
        var newGridBlocks = "";
        var width = ((gridSize[0]/100)*100) + "%",
            height = ((gridSize[1]/100)*100) + "%";
        for (var i=0;i<(gridSize[0]*gridSize[1]); i++) {
            newGridBlocks+="<div style='width:" + width + "; height:" + height + "'></div>";
        };
        newGrid.innerHTML = newGridBlocks;
        return newGrid;
    };

    function getClosestGrid(pxElem, pxRef, gS) {
        if ((pxElem%(pxRef / gS)) < (pxRef / (gS*2))) {
            return Math.round(((pxElem - (pxElem%(pxRef / gS))) / pxRef)*gS);
        } else {
            return Math.round(((pxElem - (pxElem%(pxRef / gS))) / pxRef)*gS) + 1;
        };
    };

    function animateToPos(ele, master, grid) {

        var first = null,
            last = null,
            distanceToTravel = [];

        function step(timestamp) {
            if (!first) first=timestamp;
            if (!last) last=timestamp;
            var gap = timestamp - last;
            last = timestamp;
            if ((timestamp - first) < 100) {
                ele.style.left = (ele.offsetLeft - distanceToTravel[0]*(gap/100)) + "px";
                ele.style.top = (ele.offsetTop - distanceToTravel[1]*(gap/100)) + "px";
                window.requestAnimationFrame(step);
            } else {
                ele.style.left = (tarPos[0]*10) + "%";
                ele.style.top = (tarPos[1]*10) + "%";
            };
        };

        var curPos = [ele.offsetLeft, ele.offsetTop];
        var tarPos = [getClosestGrid(curPos[0], master[0], defaults.gridSize[0]), getClosestGrid(curPos[1], master[1], defaults.gridSize[1])];

        distanceToTravel = [curPos[0] - (tarPos[0]*(master[0]/grid[0])), curPos[1] - (tarPos[1]*(master[1]/grid[1]))];

        window.requestAnimationFrame(step);
    };

    function animateToSize() {
        
    };

    Element.prototype.gridOut = function (params) {

        var that = this,
            settings = defaults,
            elementArray = [];

        function setupElement(ele) {
            function moveElement(event) {
                ele.style.left=event.clientX-(ele.clientWidth/2);
                ele.style.top=event.clientY-(ele.clientHeight/2);
            };
            ele.className = ele.className + ' gridOut--movable';
            ele.addEventListener('mousedown', function() {
                this.addEventListener('mousemove', moveElement);
            });
            ele.addEventListener('mouseup', function() {
                this.removeEventListener('mousemove', moveElement);
                animateToPos(ele, [that.clientWidth, that.clientHeight], settings.gridSize)
            });
        };

        if (typeof params === "object") {
            for (var key in defaults) {
                if (params[key]) defaults[key] = params[key];
            };
        };

        if (settings.movables!="") elementArray = document.querySelectorAll(settings.movables);

        // Append background grid if needed.
        if (defaults.showGridLines) this.appendChild(getBlocks(settings.gridSize));

        for(var i=0; i<elementArray.length;i++) {
            setupElement(elementArray[i]);
        };
    };

})();