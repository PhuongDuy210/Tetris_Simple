import { _decorator, Component, Label } from 'cc';
import { Grid } from './Grid';
import { InputManager } from './InputManager';
import { Tetromino } from './Tetromino/Tetromino';
import { MoveDirection } from './Enums/MoveDirection';

const { ccclass, property } = _decorator;
import { view, ResolutionPolicy } from 'cc';

@ccclass('GameManager')
export class GameManager extends Component {
	@property(Grid)
	public grid: Grid = null!;

	private inputManager: InputManager = null!;

	@property(Label)
	public gameStateUI: Label = null!;

	@property(Label)
	public scoreUI: Label = null!;

	private tetromino: Tetromino = null;

	private isGameRunning: boolean = false;

	private score: number = 0;

	private moveInterval = 0.5;
	private holdMoveInterval = 0.05; // seconds between movement when holding

	start() {
		view.resizeWithBrowserSize(true);

		this.inputManager = this.getComponent(InputManager)!;
		this.grid.initGrid();
		this.gameStateUI.string = "Press Enter to Start";
	}

	public startGame() {
		// Clean up leftover gamestates
		this.isDropping = false;
		this.unschedule(this.horizontalWrapper);
		this.unschedule(this.verticalWrapper);
		this.grid.resetGrid();
		this.score = 0;
		this.isGameRunning =  true;
	
		this.updateScore();
		this.gameStateUI.node.active = false;
		this.spawnTetromino();
	}

	public gameOver() {
		this.gameStateUI.string = "Game Over\nPress Enter to Start";
		this.gameStateUI.node.active = true;
		this.isGameRunning = false;

		if (this.tetromino) {
			this.tetromino.destroyBlock();
			this.tetromino = null;
		}
	}
	
	//Wrappers for scheduling
	private horizontalWrapper = () => {
		const direction = this.inputManager.getMoveDirection();
		if (direction == MoveDirection.Left || direction == MoveDirection.Right) {
			this.moveTetromino(direction);
		}
	};
	
	private verticalWrapper = () => {
		this.moveTetromino(MoveDirection.Down);
	};

	public onMoveDirectionChanged(direction: MoveDirection) {
		//Handle horizontal movement separately to avoid interfering with auto dropping
		if (direction == MoveDirection.Left || direction == MoveDirection.Right) {
			this.unschedule(this.horizontalWrapper);
			this.schedule(this.horizontalWrapper, this.holdMoveInterval);
		} 
		
		if (direction == MoveDirection.Down || direction == MoveDirection.None) {
			let interval = this.moveInterval;
			if (direction == MoveDirection.Down) {
				interval = this.holdMoveInterval;
			}
			this.unschedule(this.verticalWrapper);
			this.schedule(this.verticalWrapper, interval);
		}
	}

	private moveTetromino(moveDirection: MoveDirection) {
		if (!this.tetromino) return;

		let moved = false;
		switch (moveDirection) {
			case MoveDirection.None:	//Auto dropping
			case MoveDirection.Down:
				moved = this.tetromino.move(0, -1);
				break;

			case MoveDirection.Left:
				moved = this.tetromino.move(-1, 0);
				break;

			case MoveDirection.Right:
				moved = this.tetromino.move(1, 0);
				break;

			default:
				break;
		}

		// If can no longer move, lock Tetromino in place and spawn a new one
		if (!moved && moveDirection == MoveDirection.Down) {
			this.unschedule(this.horizontalWrapper);
			this.unschedule(this.verticalWrapper);
			const offsets = this.tetromino.getCurrentOffsets();
			for (const offset of offsets) {
				const x = this.tetromino.gridX + offset.x;
				const y = this.tetromino.gridY + offset.y;
				this.grid.placeBlock(x, y);
			}
			this.tetromino.destroyBlock();

			// Check to confirm gamestate
			this.score += this.grid.clearFullLines();
			this.updateScore();
			if (this.checkGameOver()) {
				return
			}

			this.spawnTetromino();
		}
	}

	private spawnTetromino() {
		if (!this.isGameRunning) return;
		this.tetromino = this.grid.instantiateTetromino();
		this.onMoveDirectionChanged(MoveDirection.None); // Schedule for auto dropping
	}

	public checkGameOver(): boolean {
		const spawnX = Math.floor(this.grid.width / 2);
		const spawnY = this.grid.height - 1;
		
		if (this.grid.isOccupied(spawnX, spawnY)) {
			this.gameOver();
			return true;
		}

		return false;
	}

	public updateScore() {
		this.scoreUI.string = `Score: ${this.score}`;
	}
}