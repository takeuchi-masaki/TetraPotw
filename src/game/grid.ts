import { grid_width, grid_height } from "../constants";
import { Block, BlockType, rotations } from "./blocks";

export class Grid {
    public grid: number[][];

    constructor() {
        this.grid = [];
        for (let i = 0; i < grid_height + 4; i++) {
            var row = [];
            for (let i = 0; i < grid_width; i++) {
                row.push(0);
            }
            this.grid.push(row);
        }
    }

    public find_ghost(block: Block) {
        var ghost_y = block.y;
        while (true) {
            for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
                for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                    if (rotations[block.type][block.rotation][i][j]
                        && (
                            (ghost_y + i + 1 >= this.grid.length)
                            || this.grid[ghost_y + i + 1][block.x + j]
                        )) {
                        block.ghost_y = ghost_y;
                        return;
                    }
                }
            }
            ghost_y++;
        }
    }

    public rotate_cw(block: Block): void {
        if (block.type == BlockType.O) {
            return;
        }
        const next_rotation = (block.rotation + 1) % 4;
        for (let i = 0; i < rotations[block.type][next_rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][next_rotation][i].length; j++) {
                if (rotations[block.type][next_rotation][i][j]
                    && (
                        block.x + j < 0
                        || block.x + j >= grid_width
                        || block.y + i >= this.grid.length
                        || this.grid[block.y + i][block.x + j]
                    )
                ) {
                    return;
                }
            }
        }
        block.rotation = next_rotation;
    }

    public rotate_ccw(block: Block): void {
        if (block.type == BlockType.O) {
            return;
        }
        const next_rotation = (block.rotation + 3) % 4;
        for (let i = 0; i < rotations[block.type][next_rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][next_rotation][i].length; j++) {
                if (rotations[block.type][next_rotation][i][j]
                    && (
                        block.x + j < 0
                        || block.x + j >= grid_width
                        || block.y + i >= this.grid.length
                        || this.grid[block.y + i][block.x + j]
                    )
                ) {
                    return;
                }
            }
        }
        block.rotation = next_rotation;
    }

    public tap_left(block: Block): boolean {
        for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                if (rotations[block.type][block.rotation][i][j]
                    && (
                        (block.x + j - 1 < 0)
                        || this.grid[block.y + i][block.x + j - 1]
                    )) {
                    return false;
                }
            }
        }
        block.x--;
        return true;
    }

    public tap_right(block: Block): boolean {
        for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                if (rotations[block.type][block.rotation][i][j]
                    && (
                        (block.x + j + 1 >= grid_width)
                        || this.grid[block.y + i][block.x + j + 1]
                    )) {
                    return false;
                }
            }
        }
        block.x++;
        return true;
    }

    public hard_left(block: Block): void {
        while (this.tap_left(block)) { }
    }

    public hard_right(block: Block): void {
        while (this.tap_right(block)) { }
    }

    public soft_drop(block: Block): void {
        while (true) {
            for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
                for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                    if (rotations[block.type][block.rotation][i][j]
                        && (
                            (block.y + i + 1 >= this.grid.length)
                            || this.grid[block.y + i + 1][block.x + j]
                        )) {
                        return;
                    }
                }
            }
            block.y++;
        }
    }

    public hard_drop(block: Block): void {
        var down = true;
        while (true) {
            for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
                for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                    if (rotations[block.type][block.rotation][i][j]
                        && (
                            (block.y + i + 1 >= this.grid.length)
                            || (this.grid[block.y + i + 1][block.x + j] != 0)
                        )) {
                        down = false;
                        break;
                    }
                }
                if (!down) {
                    break;
                }
            }
            if (!down) {
                break;
            }
            block.y++;
        }
        for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                if (rotations[block.type][block.rotation][i][j]) {
                    this.grid[block.y + i][block.x + j] = block.type + 1;
                }
            }
        }
    }

    public clear_lines(): number {
        var lines_cleared = 0;
        for (let i = 0; i < this.grid.length; i++) {
            var full = true;
            for (let j = 0; j < this.grid[i].length; j++) {
                if (!this.grid[i][j]) {
                    full = false;
                    break;
                }
            }
            if (full) {
                lines_cleared++;
                this.grid.splice(i, 1);
                var row = [];
                for (let j = 0; j < grid_width; j++) {
                    row.push(0);
                }
                this.grid.unshift(row);
            }
        }
        return lines_cleared;
    }

    public game_over(): boolean {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j]) {
                    return true;
                }
            }
        }
        for (let j = 4; j < 8; j++) {
            if (this.grid[4][j]) {
                return true;
            }
        }
        return false;
    }
};