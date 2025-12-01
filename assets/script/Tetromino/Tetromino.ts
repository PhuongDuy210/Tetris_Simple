import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { GameConfig } from '../GameConfig';

type Offset = { x: number; y: number };

@ccclass('Tetromino')
export abstract class Tetromino extends Component {
	@property
	public cellSize: number = GameConfig.cellSize;

	protected grid: Grid = null;

	// Starting position
	public gridX: number = Math.floor(GameConfig.gridWidth / 2);
	public gridY: number = GameConfig.gridHeight - 1;

	protected blocks: Node[] = [];
	protected rotationState: number = 0;
	protected rotationOffsets: Offset[][] = [];

	public initShape(grid: Grid) {
		this.blocks = this.node.children;
		this.rotationState = 0;
		this.applyShape(this.getCurrentOffsets());
		this.grid = grid;
	}

	public move(dx: number, dy: number): boolean {
		this.gridX += dx;
		this.gridY += dy;
		const offsets = this.getCurrentOffsets();
		if (this.grid.isValidPosition(this, offsets)) {
			this.applyShape(offsets);
			return true;
		}

		// Revert movement
		this.gridX -= dx;
		this.gridY -= dy;
		return false;
	}

	public getGridPosition(): { x: number; y: number } {
		return { x: this.gridX, y: this.gridY };
	}

	public getCurrentOffsets(): Offset[] {
		return this.rotationOffsets[this.rotationState];
	}

	protected applyShape(offsets: Offset[]) {
		for (let i = 0; i < offsets.length && i < this.blocks.length; i++) {
			const worldX = (this.gridX + offsets[i].x) * this.cellSize;
			const worldY = (this.gridY + offsets[i].y) * this.cellSize;
			this.blocks[i].setPosition(worldX, worldY);
		}
	}

	public rotateClockwise() {
		const nextState = (this.rotationState + 1) % this.rotationOffsets.length;
		const nextOffsets = this.rotationOffsets[nextState];

		const originalX = this.gridX;

		const kicks = [0, -1, 1, -2, 2];
		for (const kick of kicks) {
			this.gridX = originalX + kick;
			if (this.grid.canRotate(this, nextOffsets)) {
				this.rotationState = nextState;
				this.applyShape(nextOffsets);
				return;
			}
		}

		// Revert if all fail
		this.gridX = originalX;
	}

	public destroyBlock() {
		if (this.node && this.node.isValid && this.node.children) {
			this.node.children.forEach(child => {
				this.grid.releaseTetrominoBlock(child);
			});
			this.node.destroy();
		}
	}
}