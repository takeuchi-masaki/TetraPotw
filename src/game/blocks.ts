export enum BlockType {
    Empty = 0,
    Z = 1,
    L = 2,
    O = 3,
    S = 4,
    I = 5,
    J = 6,
    T = 7,
};

export class Block {
    public type: BlockType;
    public rotation: number;
    public x: number; // x position of top left corner
    public y: number; // y position of top left corner
    public ghost_y: number; // y position of ghost block

    constructor(type: BlockType) {
        this.type = type;
        this.x = 3;
        this.y = 3;
        this.rotation = 0;
    }
}

export const rotations: number[][][][] = [
    [], // Empty
    [   // Z
        [
            [2, 2, 0],
            [0, 2, 2],
            [0, 0, 0],
        ],
        [
            [0, 0, 2],
            [0, 2, 2],
            [0, 2, 0],
        ],
        [
            [0, 0, 0],
            [2, 2, 0],
            [0, 2, 2],
        ],
        [
            [0, 2, 0],
            [2, 2, 0],
            [2, 0, 0],
        ]
    ],
    [   // L
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ],
        [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ],
        [
            [0, 0, 0],
            [3, 3, 3],
            [3, 0, 0],
        ],
        [
            [3, 3, 0],
            [0, 3, 0],
            [0, 3, 0],
        ]
    ],
    [   // O
        [
            [0, 4, 4],
            [0, 4, 4],
        ]
    ],
    [   // S
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
        ],
        [
            [0, 5, 0],
            [0, 5, 5],
            [0, 0, 5],
        ],
        [
            [0, 0, 0],
            [0, 5, 5],
            [5, 5, 0],
        ],
        [
            [5, 0, 0],
            [5, 5, 0],
            [0, 5, 0],
        ]
    ],
    [   // I
        [
            [0, 0, 0, 0],
            [6, 6, 6, 6],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        [
            [0, 0, 6, 0],
            [0, 0, 6, 0],
            [0, 0, 6, 0],
            [0, 0, 6, 0],
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [6, 6, 6, 6],
            [0, 0, 0, 0],
        ],
        [
            [0, 6, 0, 0],
            [0, 6, 0, 0],
            [0, 6, 0, 0],
            [0, 6, 0, 0],
        ]
    ],
    [   // J
        [
            [7, 0, 0],
            [7, 7, 7],
            [0, 0, 0]
        ],
        [
            [0, 7, 7],
            [0, 7, 0],
            [0, 7, 0],
        ],
        [
            [0, 0, 0],
            [7, 7, 7],
            [0, 0, 7],
        ],
        [
            [0, 7, 0],
            [0, 7, 0],
            [7, 7, 0],
        ]
    ],
    [   // T
        [
            [0, 8, 0],
            [8, 8, 8],
            [0, 0, 0],
        ],
        [
            [0, 8, 0],
            [0, 8, 8],
            [0, 8, 0],
        ],
        [
            [0, 0, 0],
            [8, 8, 8],
            [0, 8, 0],
        ],
        [
            [0, 8, 0],
            [8, 8, 0],
            [0, 8, 0],
        ]
    ]
];

const kickJLTSZ: number[][][][] = [];
const kickJLTSZ01 = [[-1, 0], [-1, 1], [0, -2], [-1, -2]];
const kickJLTSZ10 = [[1, 0], [1, -1], [0, 2], [1, 2]];
const kickJLTSZ12 = [[1, 0], [1, -1], [0, 2], [1, 2]];
const kickJLTSZ21 = [[-1, 0], [-1, 1], [0, -2], [-1, -2]];
const kickJLTSZ23 = [[1, 0], [1, 1], [0, -2], [1, -2]];
const kickJLTSZ32 = [[-1, 0], [-1, -1], [0, 2], [-1, 2]];
const kickJLTSZ30 = [[-1, 0], [-1, -1], [0, 2], [-1, 2]];
const kickJLTSZ03 = [[1, 0], [1, 1], [0, -2], [1, -2]];

const kickI: number[][][][] = [];
const kickI01 = [[-2, 0], [1, 0], [-2, -1], [1, 2]];
const kickI10 = [[2, 0], [-1, 0], [2, 1], [-1, -2]];
const kickI12 = [[-1, 0], [2, 0], [-1, 2], [2, -1]];
const kickI21 = [[1, 0], [-2, 0], [1, -2], [-2, 1]];
const kickI23 = [[2, 0], [-1, 0], [2, 1], [-1, -2]];
const kickI32 = [[1, 0], [-2, 0], [1, -2], [-2, 1]];
const kickI30 = [[1, 0], [-2, 0], [1, -2], [-2, 1]];
const kickI03 = [[-1, 0], [2, 0], [-1, 2], [2, -1]];

export function init_kickJLTSZ() {
    kickJLTSZ.push([[], kickJLTSZ01, [], kickJLTSZ03]);
    kickJLTSZ.push([kickJLTSZ10, [], kickJLTSZ12, []]);
    kickJLTSZ.push([[], kickJLTSZ21, [], kickJLTSZ23]);
    kickJLTSZ.push([kickJLTSZ30, [], kickJLTSZ32, []]);
}

export function init_kickI() {
    kickI.push([[], kickI01, [], kickI03]);
    kickI.push([kickI10, [], kickI12, []]);
    kickI.push([[], kickI21, [], kickI23]);
    kickI.push([kickI30, [], kickI32, []]);
}

export function wallkick_offset(type: BlockType, prev_rotation: number, next_rotation: number): number[][] {
    if (type == BlockType.I) {
        return kickI[prev_rotation][next_rotation];
    } else {
        return kickJLTSZ[prev_rotation][next_rotation];
    }
}
