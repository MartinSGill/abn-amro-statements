/**
* Simple iterator class, to make it possible to pass an iterator
* between functions by reference.
*/
export class Iter<T> {
    private _pos: number;
    private _target: T[];

    constructor(target: T[]) {
        this._target = target;
        this._pos = -1;
    }

    public position(): number {
        return this._pos + 1;
    }

    public canMoveNext(): boolean {
        return this._pos < (this._target.length - 1);
    }

    public previous(): T {
        if (this._pos > 0) {
            return this._target[--this._pos];
        }
        else {
            return null;
        }
    }

    public next(): T {
        if (this.canMoveNext()) {
            return this._target[++this._pos];
        }
        else {
            return null;
        }
    }

    public value(): T {
        return this._target[this._pos];
    }

}
