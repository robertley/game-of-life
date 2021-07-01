import { Component, OnInit } from '@angular/core';
import { Cell, Color } from './interfaces/cell.interface';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  cells: Cell[][];
  preGCells: any; // previous gereration cells
  firstGCells: any;

  cellAmtX = 100;
  cellAmtY = 100;

  tickRate = 100 // milliseconds;
  frame = 0;

  userColorHex: string = '#ffff00';
  userColorRgb: Color | null = {r: 255, g: 255, b: 0}

  gameRunning = false;

  windowIntervalObject: any;
  
  constructor() {
    this.cells = new Array(this.cellAmtX);
    for (let i = 0; i < this.cellAmtX; i++) {
      let row = new Array(this.cellAmtX);
      for (let j = 0; j < this.cellAmtY; j++) {
          row[j] = this.createCell();
      }
      this.cells[i] = row;
    }
  }

  ngOnInit() {

  }

  createCell(color?: Color): Cell {
    return {
      alive: false,
      color: null
    }
  }

  updateColorRgb() {
    this.userColorRgb = hexToRgb(this.userColorHex);
  }

  newCells() {
    this.cells = new Array(this.cellAmtX);
    for (let i = 0; i < this.cellAmtX; i++) {
      let row = new Array(this.cellAmtX);
      for (let j = 0; j < this.cellAmtY; j++) {
          row[j] = this.createCell();
      }
      this.cells[i] = row;
    }
  }

  toggleCell(cell: Cell, parentColors?: Color[]) {
    cell.alive = !cell.alive;
    if (cell.alive) {
      let newColor: Color = {r:0, g:0, b:0};
      if (parentColors) {
        for (let i in parentColors) {
          if (+i == 0) {
            newColor = parentColors[0];
            continue;
          }
          // newColor.r = Math.min(color.r + newColor.r, 255)
          // newColor.g = Math.min(color.g + newColor.g, 255)
          // newColor.b = Math.min(color.b + newColor.b, 255)
          // cell.color = newColor;
          newColor = this.averageColors(parentColors[i], newColor)
        }
        cell.color = newColor;
      }
      else {
        cell.color = this.userColorRgb;
      }
    }
  }

  averageColors(color1: Color, color2: Color): Color {
    let color = {
      r: Math.sqrt((color1.r**2 + color2.r**2) /2),
      g: Math.sqrt((color1.g**2 + color2.g**2) /2),
      b: Math.sqrt((color1.b**2 + color2.b**2) /2)
    }
    return color;
  }

  start() {
    this.gameRunning = true;
    this.firstGCells = cloneDeep(this.cells);
    this.windowIntervalObject = window.setInterval(this.game.bind(this), this.tickRate)
  }

  stop() {
    this.gameRunning = false;
    this.frame = 0;
    this.cells = this.firstGCells;
    window.clearInterval(this.windowIntervalObject);
  }

  reset() {
    this.newCells();
    this.frame = 0;
  }

  game() {
    this.frame++;

    this.checkCells();
  }

  checkCells() {
    this.preGCells = cloneDeep(this.cells);
    for (let i = 0; i < this.cellAmtY; i++) {
      for (let j = 0; j < this.cellAmtX; j++) {
        if (this.preGCells[i][j].alive) {
          this.evaluateAliveCell(i, j);
        } else {
          this.evaluateDeadCell(i, j);
        }
      }
    }
  }

  evaluateAliveCell(y: number, x: number) {
    // console.log(`evaluating {${x},${y}} \n top cell: {${x},${y-1}}} \n left cell: {${x - 1},${y}}}`)

    const TOP_VALUE: boolean = this.preGCells[y - 1][x].alive;
    const LEFT_VALUE: boolean = this.preGCells[y ][x - 1].alive;
    const RIGHT_VALUE: boolean = this.preGCells[y][x + 1].alive;
    const BOTTOM_VALUE: boolean = this.preGCells[y + 1][x].alive;
    const TOP_LEFT_VALUE: boolean = this.preGCells[y - 1][x - 1].alive;
    const TOP_RIGHT_VALUE: boolean = this.preGCells[y - 1][x + 1].alive;
    const BOTTOM_LEFT_VALUE: boolean = this.preGCells[y + 1][x - 1].alive;
    const BOTTOM_RIGHT_VALUE: boolean = this.preGCells[y + 1][x + 1].alive;

    let aliveNeightbors = 0;
    if (TOP_VALUE) {
      aliveNeightbors++;
    }
    if (LEFT_VALUE) {
      aliveNeightbors++;
    }
    if (RIGHT_VALUE) {
      aliveNeightbors++;
    }
    if (BOTTOM_VALUE) {
      aliveNeightbors++;
    }
    if (TOP_LEFT_VALUE) {
      aliveNeightbors++;
    }
    if (TOP_RIGHT_VALUE) {
      aliveNeightbors++;
    }
    if (BOTTOM_LEFT_VALUE) {
      aliveNeightbors++;
    }
    if (BOTTOM_RIGHT_VALUE) {
      aliveNeightbors++;
    }

    if (aliveNeightbors < 2) {
      this.cells[y][x].alive = false;
      return;
    }
    if (aliveNeightbors < 4) {
      return;
    }
    // more than 3 neighbors
    this.cells[y][x].alive = false;
  }

  evaluateDeadCell(y: number, x: number) {
    try {
      const TOP_CELL: Cell = this.preGCells[y - 1][x];
      const LEFT_CELL: Cell = this.preGCells[y ][x - 1];
      const RIGHT_CELL: Cell = this.preGCells[y][x + 1];
      const BOTTOM_CELL: Cell = this.preGCells[y + 1][x];
      const TOP_LEFT_CELL: Cell = this.preGCells[y - 1][x - 1];
      const TOP_RIGHT_CELL: Cell = this.preGCells[y - 1][x + 1];
      const BOTTOM_LEFT_CELL: Cell = this.preGCells[y + 1][x - 1];
      const BOTTOM_RIGHT_CELL: Cell = this.preGCells[y + 1][x + 1];

      let parentColors: any[] = [];

      let aliveNeightbors = 0;
      if (TOP_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(TOP_CELL.color)
      }
      if (LEFT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(LEFT_CELL.color)
      }
      if (RIGHT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(RIGHT_CELL.color)
      }
      if (BOTTOM_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(BOTTOM_CELL.color)
      }
      if (TOP_LEFT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(TOP_LEFT_CELL.color)
      }
      if (TOP_RIGHT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(TOP_RIGHT_CELL.color)
      }
      if (BOTTOM_LEFT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(BOTTOM_LEFT_CELL.color)
      }
      if (BOTTOM_RIGHT_CELL.alive) {
        aliveNeightbors++;
        parentColors.push(BOTTOM_RIGHT_CELL.color)
      }
  
      if (aliveNeightbors == 3) {
        this.toggleCell(this.cells[y][x], parentColors);
      }
    } catch {
      return;
    }
  }
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
