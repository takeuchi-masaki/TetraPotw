import { off } from "process";
import { grid_width, grid_height } from "../constants";
import { Block, BlockType, rotations, wallkick_offset } from "./blocks";

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
        var basic_rotation = true;
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
                    basic_rotation = false;
                    break;
                }
            }
            if (!basic_rotation) {
                break;
            }
        }
        if (basic_rotation) {
            block.rotation = next_rotation;
            return;
        }
        const kick_offsets = wallkick_offset(block.type, block.rotation, next_rotation);
        for (let o = 0; o < kick_offsets.length; o++) {
            var ok = true;
            for (let i = 0; i < rotations[block.type][next_rotation].length; i++) {
                for (let j = 0; j < rotations[block.type][next_rotation][i].length; j++) {
                    const curr_x = block.x + j + kick_offsets[o][0];
                    const curr_y = block.y + i - kick_offsets[o][1];
                    if (rotations[block.type][next_rotation][i][j]
                        && (
                            curr_x < 0
                            || curr_x >= grid_width
                            || curr_y < 0
                            || curr_y >= this.grid.length
                            || this.grid[curr_y][curr_x]
                        )
                    ) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) {
                    break;
                }
            }
            if (ok) {
                block.rotation = next_rotation;
                block.x += kick_offsets[o][0];
                block.y -= kick_offsets[o][1];
                return;
            }
        }
    }

    public rotate_ccw(block: Block): void {
        if (block.type == BlockType.O) {
            return;
        }
        var basic_rotation = true;
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
                    basic_rotation = false;
                    break;
                }
            }
            if (!basic_rotation) {
                break;
            }
        }
        if (basic_rotation) {
            block.rotation = next_rotation;
            return;
        }
        const kick_offsets = wallkick_offset(block.type, block.rotation, next_rotation);
        for (let o = 0; o < kick_offsets.length; o++) {
            var ok = true;
            for (let i = 0; i < rotations[block.type][next_rotation].length; i++) {
                for (let j = 0; j < rotations[block.type][next_rotation][i].length; j++) {
                    const curr_x = block.x + j + kick_offsets[o][0];
                    const curr_y = block.y + i - kick_offsets[o][1];
                    if (rotations[block.type][next_rotation][i][j]
                        && (
                            curr_x < 0
                            || curr_x >= grid_width
                            || curr_y < 0
                            || curr_y >= this.grid.length
                            || this.grid[curr_y][curr_x]
                        )
                    ) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) {
                    break;
                }
            }
            if (ok) {
                block.rotation = next_rotation;
                block.x += kick_offsets[o][0];
                block.y -= kick_offsets[o][1];
                return;
            }
        }
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