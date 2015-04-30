(function () {
    'use strict';

    var defaults = {
        gridSize: [12, 12],
        showGridLines: false,
        movables: ""
    };

    Element.prototype.goSetStyles = function(properties) {
        for (var prop in properties) {
            this.style[prop] = properties[prop];
        }
    }


    function getBlocks(gridSize) {
        var newBlockString = "<div class='gridOut--layoutHolder' style='width: 100%; height: 100%; position: relative; z-index: -1;'>";
        var newGrid = document.createElement('div');
        newGrid.className = "gridOut--layoutHolder";
        newGrid.goSetStyles({
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: -1
        })
        var newGridBlocks = "";
        var width = (100/gridSize[0]) + "%",
            height = (100/gridSize[1]) + "%";
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

    function animateToPosAndSize(ele, master, grid) {

        var first = null,
            last = null,
            distanceToTravel = [],
            sizeTochange = [];

        function step(timestamp) {
            if (!first) first=timestamp;
            if (!last) last=timestamp;
            var gap = timestamp - last;
            last = timestamp;
            if ((timestamp - first) < 100) {
                ele.goSetStyles({
                    left: (ele.offsetLeft - distanceToTravel[0]*(gap/100)) + "px",
                    top: (ele.offsetTop - distanceToTravel[1]*(gap/100)) + "px",
                    width: (ele.clientWidth - sizeTochange[0]*(gap/100)) + "px",
                    height: (ele.clientHeight - sizeTochange[1]*(gap/100)) + "px"
                });
                window.requestAnimationFrame(step);
            } else {
                ele.goSetStyles({
                    left: (tarPos[0]*(100/grid[0])) + "%",
                    top: (tarPos[1]*(100/grid[1])) + "%",
                    width: (tarSize[0]*(100/grid[0])) + "%",
                    height: (tarSize[1]*(100/grid[1])) + "%"
                });
            };
        };

        var curPos = [ele.offsetLeft, ele.offsetTop];
        var curSize = [ele.clientWidth, ele.clientHeight];
        var tarPos = [getClosestGrid(curPos[0], master[0], grid[0]), getClosestGrid(curPos[1], master[1], grid[1])];
        var tarSize = [getClosestGrid(curSize[0], master[0], grid[0]), getClosestGrid(curSize[1], master[1], grid[1])];

        distanceToTravel = [curPos[0] - (tarPos[0]*(master[0]/grid[0])), curPos[1] - (tarPos[1]*(master[1]/grid[1]))];
        sizeTochange = [curSize[0] - (tarSize[0]*(master[0]/grid[0])), curSize[1] - (tarSize[1]*(master[1]/grid[1]))];

        window.requestAnimationFrame(step);
    };

    Element.prototype.gridOut = function (params) {

        var that = this,
            settings = defaults,
            elementArray = [];

        function setupElement(ele) {
            function moveElement(event) {
                ele.goSetStyles({
                    left: event.clientX-(ele.clientWidth/2),
                    top:event.clientY-(ele.clientHeight/2)
                });
            };
            ele.className = ele.className + ' gridOut--movable';
            ele.goSetStyles({
                resize: "both",
                overflow:"auto"
            });
            ele.addEventListener('mousedown', function() {
                this.addEventListener('mousemove', moveElement);
            });
            ele.addEventListener('mouseup', function() {
                this.removeEventListener('mousemove', moveElement);
                animateToPosAndSize(ele, [that.clientWidth, that.clientHeight], settings.gridSize)
            });
        };

        if (typeof params === "object") {
            for (var key in defaults) {
                if (params[key]) settings[key] = params[key];
            };
        };

        if (settings.movables!="") elementArray = document.querySelectorAll(settings.movables);

        // Append background grid if needed.
        if (settings.showGridLines) this.appendChild(getBlocks(settings.gridSize));

        for(var i=0; i<elementArray.length;i++) {
            setupElement(elementArray[i]);
        };
    };

})();