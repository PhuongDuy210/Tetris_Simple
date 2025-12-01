import { _decorator } from 'cc';
const { ccclass, property } = _decorator;
import { Tetromino } from './Tetromino';

@ccclass('TetrominoJ')
export class TetrominoJ extends Tetromino {
	protected rotationOffsets = [
		// Rotation 0 (initial)
		[ {x: -1, y: 1}, {x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0} ],
		// Rotation 1 (90° clockwise)
		[ {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 0}, {x: 0, y: -1} ],
		// Rotation 2 (180°)
		[ {x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: 0}, {x: -1, y: 0} ],
		// Rotation 3 (270°)
		[ {x: -1, y: -1}, {x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1} ]
	];
}