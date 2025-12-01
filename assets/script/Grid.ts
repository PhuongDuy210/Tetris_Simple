import { _decorator, Component, Node, Prefab, instantiate, UITransform, NodePool } from 'cc';
import { GameConfig } from './GameConfig';
import { GridBlock } from './GridBlock';
import { Tetromino } from './Tetromino/Tetromino';
import { TetrominoT } from './Tetromino/TetrominoT';
import { TetrominoL } from './Tetromino/TetrominoL';
import { TetrominoI } from './Tetromino/TetrominoI';
import { TetrominoO } from './Tetromino/TetrominoO';
import { TetrominoJ } from './Tetromino/TetrominoJ';
import { TetrominoZ } from './Tetromino/TetrominoZ';
import { TetrominoS } from './Tetromino/TetrominoS';

const { ccclass, property } = _decorator;

@ccclass('Grid')
export class Grid extends Component {
	private blocks: GridBlock[][] = [];

	private width = GameConfig.gridWidth;
	private height = GameConfig.gridHeight;

	@property(Prefab)
	public gridBlockPrefab: Prefab = null;

	@property(Prefab)
	public tetrominoBlockPrefab: Prefab = null;

	private highestOccupiedRow: number = 0;

	private tetrominoBlockPool: NodePool = new NodePool();

	private onLoad() { 		
		for (let i = 0; i < 4; i++) {
			const block = instantiate(this.tetrominoBlockPrefab);
			this.tetrominoBlockPool.put(block);
		}	
	}

	private getTetrominoBlock(): Node {
		return this.tetrominoBlockPool.size() > 0 ? this.tetrominoBlockPool.get() : instantiate(this.tetrominoBlockPrefab);
	}

	public releaseTetrominoBlock(block: Node) {
		block.removeFromParent();
		this.tetrominoBlockPool.put(block);
	}

	public initGrid() {
		// Anchor the grid in the bottom left corner of the canvas
		const canvasTransform = this.node.parent!.getComponent(UITransform)!;
		const canvasWidth = canvasTransform.width;
		const canvasHeight = canvasTransform.height;
		const padding = 25;
		
		this.node.setPosition(-Math.ceil(canvasWidth / 2) + padding, -Math.ceil(canvasHeight / 2) + padding);

		// Instantiate the grid
		this.blocks = [];

		for (let y = 0; y < this.height; y++) {
			const row: GridBlock[] = [];
			for (let x = 0; x < this.width; x++) {
				const blockNode = instantiate(this.gridBlockPrefab);
				blockNode.name = `Block_${x}_${y}`;
				this.node.addChild(blockNode);
				blockNode.setPosition(x * GameConfig.cellSize, y * GameConfig.cellSize); // adjust spacing as needed

				const block = blockNode.getComponent(GridBlock)!;
				row.push(block);
			}
			this.blocks.push(row);
		}
	}

	public resetGrid() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.blocks[y][x].clear();
			}
		}

		this.highestOccupiedRow = 0;
	}

	public instantiateTetromino(): Tetromino {
		const shapes = [TetrominoT, TetrominoL, TetrominoI, TetrominoO, TetrominoS, TetrominoZ, TetrominoJ];
		const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];

		const tetrominoNode = new Node('Tetromino');
		this.node.addChild(tetrominoNode);

		for (let i = 0; i < 4; i++) {
			const tetrominoBlock = this.getTetrominoBlock();
			tetrominoNode.addChild(tetrominoBlock);
		}
		const tetromino = tetrominoNode.addComponent(shapeClass) as Tetromino;
		tetromino.initShape(this);

		return tetromino;
	}

	protected isValidPosition(tetromino: Tetromino, offsets: Offset[]): boolean {
		for (const offset of offsets) {
			const x = tetromino.gridX + offset.x;
			const y = tetromino.gridY + offset.y;

			if (!this.inBounds(x, y)) {
				return false;
			}

			if (this.isOccupied(x, y)) {
				return false;
			}

		}
		return true;
	}

	public isOccupied(x: number, y: number): boolean {
		if (!this.inBounds(x, y)) return true;
		return this.blocks[y][x].isOccupied();
	}

	private inBounds(x: number, y: number): boolean {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	private canRotate(tetromino: Tetromino, offsets: Offset[]): boolean {
		for (const offset of offsets) {
			const x = tetromino.gridX + offset.x;
			const y = tetromino.gridY + offset.y;
			// Have 2 buffer rows to allow rotation when just spawned in
			if (!(x >= 0 && x < this.width && y >= 0 && y < (this.height + 2))) {
				return false;
			}
		}
		return true;
	}

	public placeBlock(x: number, y: number) {
		if (this.inBounds(x, y)) {
			this.blocks[y][x].setOccupied();
			this.highestOccupiedRow = Math.max(this.highestOccupiedRow, y);
		}
	}

	public clearFullLines(): number {
		let linesCleared = 0;

		for (let y = 0; y <= this.highestOccupiedRow; y++) {
			if (this.blocks[y].every(block => block.isOccupied())) {
				this.clearLine(y);
				linesCleared++;
				this.highestOccupiedRow--;
				y--;
			}
		}

	  	return linesCleared;
	}

	private clearLine(row: number) {
		for (let x = 0; x < this.width; x++) {
			this.blocks[row][x].clear();
		}

		// Move the row above down
		for (let y = row; y < this.height - 1; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.blocks[y + 1][x].isOccupied()) {
					this.blocks[y][x].setOccupied();
				} else {
					this.blocks[y][x].clear();
				}
			}
		}

		// Clear top row
		for (let x = 0; x < this.width; x++) {
			this.blocks[this.height - 1][x].clear();
		}
	}
}