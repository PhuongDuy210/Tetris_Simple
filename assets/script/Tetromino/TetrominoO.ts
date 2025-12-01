import { _decorator } from 'cc';
const { ccclass, property } = _decorator;
import { Tetromino } from './Tetromino';

@ccclass('TetrominoO')
export class TetrominoO extends Tetromino {
	protected rotationOffsets = [
		// Rotation 0 (initial)
		[ {x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 1, y: -1} ],
	];

	override rotateClockwise(): void {
		// No rotation needed
		this.applyShape(this.getCurrentOffsets());
	}
}