let grid = Array(81).fill().map(x=>[1,2,3,4,5,6,7,8,9]);
let start = Array(81);
//let start = [0,0,0,0,1,5,8,0,0,0,0,5,3,9,0,0,7,0,0,4,0,0,6,0,9,0,0,0,2,0,1,0,0,0,0,8,5,0,0,0,0,0,0,0,4,4,0,0,0,0,2,0,1,0,0,0,6,0,2,0,0,9,0,0,7,0,0,5,6,3,0,0,0,0,9,8,3,0,0,0,0];
//    158    539  7  4  6 9   2 1    85       44    2 1   6 2  9  7  563    983    
let queue = [];
let selected = null;

window.onload = () => {
    drawGrid();
    let solveButton = document.createElement('button');
    solveButton.innerHTML = 'Solve';
    solveButton.onclick = solve;
    document.body.appendChild(solveButton);
}
window.onkeypress = e => {
    if (selected == null)   return;
    if (e.keyCode == 48) {
        document.getElementById('cell' + selected).innerHTML = '0';
        document.getElementById('cell' + selected).removeAttribute('filled');
    }
    if (e.keyCode >= 49 && e.keyCode <= 57) {
        document.getElementById('cell' + selected).innerHTML = e.keyCode - 48;
        document.getElementById('cell' + selected).setAttribute('filled', '');
    }
}

const drawGrid = () => {
    let gridDiv = document.getElementById('grid');
    let table = document.createElement('table');
    for (i = 0; i < 9; i++) {
        let row = document.createElement('tr');
        for (j = 0; j < 9; j++) {
            let cell = document.createElement('td');
            cell.id = 'cell' + (i * 9 + j);
            cell.innerHTML = '0';
            cell.onclick = clickCell;
            row.append(cell);
        }
        table.append(row);
    }
    gridDiv.append(table);
}

const clickCell = e => {
    if (selected != null) {
        document.getElementById('cell' + selected).removeAttribute('selected');
    }
    selected = +e.target.id.substring(4);
    document.getElementById('cell' + selected).setAttribute('selected', '');
}

const solve = () => {
    for (i = 0; i < 81; i++) {
        start[i] = +document.getElementById('cell' + i).innerHTML;
        if (start[i]) {
            grid[i] = [start[i]];
            queue.push(i);
        }
    }
    eliminate();
    printGrid();
}

const eliminate = () => {
    while (queue.length) {
        let i = queue[0];
        let allparts = [rowParts(row(i)), colParts(col(i)), boxParts(box(i))];
        for (let p = 0; p < 3; p++) {
            let parts = allparts[p];
            for (let a = 0; a < 9; a++) {
                let cell = parts[a];
                if (cell != i && grid[cell].length > 1) {
                    let index = grid[cell].indexOf(grid[i][0]);
                    if (index >= 0) {
                        grid[cell].splice(index, 1);
                        if (grid[cell].length == 1) {
                            queue.push(cell);
                            console.log('adding', cell);
                        }
                    }
                }
            }
        }
        queue.shift();
    }
    for (let i = 0; i < 3; i++) {
        for (let a = 0; a < 9; a++) {
            let c = a;
            let increment = 1;
            switch (i) {
                case 0: // row
                    c = a * 9;
                    break;
                case 1: // col
                    increment = 9;
                    break;
                case 2: // box
                    c = ((a / 3) >> 0) * 27 + (a % 3) * 3;
                    break;
            }
            let possible = Array(10).fill().map(x => []);
            for (let b = 0; b < 9; b++) {
                for (let d = 0; d < grid[c].length; d++) {
                    possible[grid[c][d]].push(c);
                }
                c += increment;
                i == 2 && b % 3 == 2 && (c += 6);
            }
            for (let p = 1; p <= 9; p++) {
                if (grid[possible[p][0]].length == 1)   continue;
                if (possible[p].length == 1) {
                    grid[possible[p][0]] = [p];
                    queue.push(possible[p][0]);
                    console.log('adding by elimination', possible[p][0]);
                }
                else if (possible[p].length <= 3) { // pointing
                    if (i != 2) { // box
                        let boxToMatch = box(possible[p][0]);
                        for (let q = 1; q < possible[p].length; q++) {
                            if (box(possible[p][q]) != boxToMatch)   break;
                            if (q == possible[p].length - 1) {
                                //console.log(possible[p], 'are all', p, 'in box', boxToMatch);
                                //pointingBox(p, boxToMatch, possible[p]);
                                pointing(p, boxParts(boxToMatch), possible[p]);
                            }
                        }
                    }
                    else { // row/col
                        let rowToMatch = row(possible[p][0]);
                        let colToMatch = col(possible[p][0]);
                        for (let q = 1; q < possible[p].length; q++) {
                            if (row(possible[p][q]) != rowToMatch) {
                                rowToMatch = null;
                            }
                            if (col(possible[p][q]) != colToMatch) {
                                colToMatch = null;
                            }
                            if (q == possible[p].length - 1) {
                                //console.log(rowToMatch, colToMatch);
                                //rowToMatch != null && pointingRow(p, rowToMatch, possible[p]);
                                //colToMatch != null && pointingCol(p, colToMatch, possible[p]);
                                rowToMatch != null && pointing(p, rowParts(rowToMatch), possible[p]);
                                colToMatch != null && pointing(p, colParts(colToMatch), possible[p]);
                            }
                        }
                    }
                }
            }
        }
    }
    console.log('queue', queue.toString());
    queue.length && eliminate();
}

const printGrid = () => {    
    for (i = 0; i < 81; i++) {
        if (grid[i].length == 1) {
            document.getElementById('cell' + i).setAttribute(start[i] && 'filled' || 'solved', '');
            document.getElementById('cell' + i).innerHTML = grid[i][0];
        }
    }
}
const rowParts = row => {
    let cells = [];
    for (let c = 0; c < 9; c++) {
        cells.push(row * 9 + c);
    }
    return cells;
}
const colParts = col => {
    let cells = [];
    for (let r = 0; r < 9; r++) {
        cells.push(col + (r * 9));
    }
    return cells;
}
const boxParts = box => {
    let cells = [];
    let pos = ((box / 3) >> 0) * 27 + (box % 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            cells.push(pos + c);
        }
        pos += 9;
    }
    return cells;
}
const row = i => (i / 9) >> 0;
const col = i => i % 9;
const box = i => ((i / 9) >> 0) - (((i / 9) >> 0) % 3) + ((i % 9) / 3) >> 0;
/*const pointingBox = (number, box, except) => {
    console.log('cleaning box', box, 'of', number, 'except', except);
    let parts = boxParts(box);
    for (let e = 0; e < except.length; e++) {
        parts.splice(parts.indexOf(except[e]), 1); 
    }
    for (let a = 0; a < parts.length; a++) {
        let cell = parts[a];
        if (grid[cell].length > 1) {
            let index = grid[cell].indexOf(number);
            if (index >= 0) {
                grid[cell].splice(index, 1);
                console.log('used pointing (box) to get rid of', number, 'in', cell, '( box', box, ')');
                if (grid[cell].length == 1) {
                    queue.push(cell);
                    console.log('adding by pointing (box)', cell);
                }
            }
        }
    }
}
const pointingRow = (number, row, except) => {
    console.log('cleaning row', row, 'of', number, 'except', except);
    let parts = rowParts(row);
    for (let e = 0; e < except.length; e++) {
        parts.splice(parts.indexOf(except[e]), 1); 
    }
    for (let a = 0; a < parts.length; a++) {
        let cell = parts[a];
        if (grid[cell].length > 1) {
            let index = grid[cell].indexOf(number);
            if (index >= 0) {
                grid[cell].splice(index, 1);
                console.log('used pointing to get rid of', number, 'in', cell, '( row', row, ')');
                if (grid[cell].length == 1) {
                    queue.push(cell);
                    console.log('adding by pointing (row)', cell);
                }
            }
        }
    }
}
const pointingCol = (number, col, except) => {
    console.log('cleaning col', col, 'of', number, 'except', except);
    let parts = colParts(col);
    for (let e = 0; e < except.length; e++) {
        parts.splice(parts.indexOf(except[e]), 1); 
    }
    for (let a = 0; a < parts.length; a++) {
        let cell = parts[a];
        if (grid[cell].length > 1) {
            let index = grid[cell].indexOf(number);
            if (index >= 0) {
                grid[cell].splice(index, 1);
                console.log('used pointing to get rid of', number, 'in', cell, '( col', col, ')');
                if (grid[cell].length == 1) {
                    queue.push(cell);
                    console.log('adding by pointing (col)', cell);
                }
            }
        }
    }
}*/

const pointing = (number, parts, except) => {
    for (let e = 0; e < except.length; e++) {
        parts.splice(parts.indexOf(except[e]), 1); 
    }
    for (let a = 0; a < parts.length; a++) {
        let cell = parts[a];
        if (grid[cell].length > 1) {
            let index = grid[cell].indexOf(number);
            if (index >= 0) {
                grid[cell].splice(index, 1);
                console.log('used pointing to get rid of', number, 'in', cell);
                if (grid[cell].length == 1) {
                    queue.push(cell);
                    console.log('adding by pointing!!', cell);
                }
            }
        }
    }
}