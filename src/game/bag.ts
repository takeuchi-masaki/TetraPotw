export class Bag {
    bag_position: number;
    bag1: number[];
    bag2: number[];

    constructor() {
        this.bag_position = 0;
        this.bag1 = getBag();
        this.bag2 = getBag();
    }

    public next(): number {
        if (this.bag_position >= this.bag1.length) {
            this.bag1 = this.bag2;
            this.bag2 = getBag();
            this.bag_position = 0;
        }
        return this.bag1[this.bag_position++];
    }

    public print() {
        console.log(this.bag1);
        console.log(this.bag2);
    }
}

function getBag() {
    var bag = [1, 2, 3, 4, 5, 6, 7];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}
