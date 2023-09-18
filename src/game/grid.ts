import { grid_width, grid_height } from "../constants";
import { Block, BlockType, rotations } from "./blocks";

export class Grid {
    public grid: number[][];

    constructor() {
        this.grid = [];
        const row = [];
        for (let i = 0; i < grid_width; i++) {
            row.push(0);
        }
        for (let i = 0; i < grid_height + 4; i++) {
            this.grid.push(row);
        }
    }

    public rotate_cw(block: Block): void {
        if (block.type == BlockType.O) {
            return;
        }
        const next_rotation = (block.rotation + 1) % 4;
        for (let i = 0; i < rotations[block.type][next_rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][next_rotation][i].length; j++) {
                if (rotations[block.type][next_rotation][i][j] == 1
                    && (
                        block.x + j < 0
                        || block.x + j >= grid_width
                        || block.y + i < 0
                        || this.grid[block.y + i][block.x + j] != 0
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
                if (rotations[block.type][next_rotation][i][j] == 1
                    && (
                        block.x + j < 0
                        || block.x + j >= grid_width
                        || block.y + i < 0
                        || this.grid[block.y + i][block.x + j] != 0
                    )
                ) {
                    return;
                }
            }
        }
        block.rotation = next_rotation;
    }

    public tap_left(block: Block): void {
        for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                if (rotations[block.type][block.rotation][i][j] == 1
                    && (
                        (block.x + j - 1 < 0)
                        || (this.grid[block.y + i][block.x + j - 1] != 0)
                    )) {
                    return;
                }
            }
        }
        block.x--;
    }

    public tap_right(block: Block): void {
        for (let i = 0; i < rotations[block.type][block.rotation].length; i++) {
            for (let j = 0; j < rotations[block.type][block.rotation][i].length; j++) {
                if (rotations[block.type][block.rotation][i][j] == 1
                    && (
                        (block.x + j + 1 >= grid_width)
                        || (this.grid[block.y + i][block.x + j + 1] != 0)
                    )) {
                    return;
                }
            }
        }
        block.x++;
    }

    public hard_left(block: Block): void {

    }

    public hard_right(block: Block): void {

    }

    public hard_drop(block: Block): void {

    }
};