(function () {
    'use strict';

    var defaults = {
        gridSize: [12, 12],
        gridSpacing: [5, 5]
        showGridLines: false,
        movables: ""
    };

    function goSetStyles(element, properties) {
        for (var prop in properties) {
            element.style[prop] = properties[prop];
        }
    }

    function getBlocks(gS) {
        // create grid holder
        var newGrid = document.createElement('div');
        newGrid.className = "gridOut--layoutHolder";
        goSetStyles(newGrid, {
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: -1
        })
        // create grid elements
        var newGridBlocks = "",
            width = (100/gS[0]) + "%",
            height = (100/gS[1]) + "%";
        for (var i=0;i<(gS[0]*gS[1]); i++) {
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
            var gap = (timestamp - last)/100;
                last = timestamp;
            if ((timestamp - first) < 100) {
                goSetStyles(ele, {
                    left: (ele.offsetLeft - distanceToTravel[0]*gap) + "px",
                    top: (ele.offsetTop - distanceToTravel[1]*gap) + "px",
                    width: (ele.clientWidth - sizeTochange[0]*gap) + "px",
                    height: (ele.clientHeight - sizeTochange[1]*gap) + "px"
                });
                window.requestAnimationFrame(step);
            } else {
                goSetStyles(ele, {
                    left: (tarPos[0]*(100/grid[0])) + "%",
                    top: (tarPos[1]*(100/grid[1])) + "%",
                    width: (tarSize[0]*(100/grid[0])) + "%",
                    height: (tarSize[1]*(100/grid[1])) + "%"
                });
            };
        };

        var curPos = [ele.offsetLeft, ele.offsetTop],
            curSize = [ele.clientWidth, ele.clientHeight];
        var tarPos = [getClosestGrid(curPos[0], master[0], grid[0]), getClosestGrid(curPos[1], master[1], grid[1])],
            tarSize = [getClosestGrid(curSize[0], master[0], grid[0]), getClosestGrid(curSize[1], master[1], grid[1])];

        distanceToTravel = [curPos[0] - (tarPos[0]*(master[0]/grid[0])), curPos[1] - (tarPos[1]*(master[1]/grid[1]))];
        sizeTochange = [curSize[0] - (tarSize[0]*(master[0]/grid[0])), curSize[1] - (tarSize[1]*(master[1]/grid[1]))];

        window.requestAnimationFrame(step);
    };

    Element.prototype.gridOut = function (params) {

        var that = this,
            settings = defaults,
            elementArray = [];

        goSetStyles(this, {
            overflow: "hidden"
        });

        function setupElement(ele) {
            var mouseOffset = [0,0];
            function moveElement(event) {
                goSetStyles(ele, {
                    left: (event.clientX-mouseOffset[0]),
                    top: (event.clientY-mouseOffset[1])
                });
            };

            ele.classList.add("gridOut--movable");
            goSetStyles(ele, {
                resize: "both",
                overflow:"auto"
            });
            ele.addEventListener('mousedown', function(e) {
                that.getElementsByClassName('gridOut--layoutHolder')[0].classList.add("gridOut--somethingActive");
                this.classList.add("gridOut--movableActive");
                this.style.zIndex = 2;

                mouseOffset = [(e.clientX - ele.offsetLeft), (e.clientY - ele.offsetTop)];

                this.addEventListener('mousemove', moveElement);
            });
            ele.addEventListener('mouseup', function() {
                that.getElementsByClassName('gridOut--layoutHolder')[0].classList.remove("gridOut--somethingActive");
                this.classList.remove("gridOut--movableActive");
                this.style.zIndex = null;
                this.removeEventListener('mousemove', moveElement);
                animateToPosAndSize(ele, [that.clientWidth, that.clientHeight], settings.gridSize);
            });
            animateToPosAndSize(ele, [that.clientWidth, that.clientHeight], settings.gridSize)
        };

        if (typeof params === "object") {
            for (var key in defaults) {
                if (params[key]) settings[key] = params[key];
            };
        };

        if (settings.movables!="") elementArray = document.querySelectorAll(settings.movables);

        // Append background grid
        this.appendChild(getBlocks(settings.gridSize));

        for(var i=0; i<elementArray.length;i++) {
            setupElement(elementArray[i]);
        };
    };

})();