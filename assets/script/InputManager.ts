import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { GameManager } from './GameManager';
import { MoveDirection } from './Enums/MoveDirection';
import { input, Input, KeyCode, EventKeyboard } from 'cc';

@ccclass('InputManager')
export class InputManager extends Component {
	private gameManager: GameManager = null!;

	private moveDirection: MoveDirection = MoveDirection.None;

	start() {
		this.gameManager = this.getComponent(GameManager)!;

		this.disableInput();
		input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
	}

	private disableInput() {
		input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
		input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
	}

	public getMoveDirection(): MoveDirection {
		return this.moveDirection;
	}

	private onKeyDown(event: EventKeyboard) {
		if (!this.gameManager.isGameRunning) {
			if (event.keyCode === KeyCode.ENTER) {
				this.gameManager.startGame();
			}
			return;
		}

		switch (event.keyCode) {
			case KeyCode.ARROW_LEFT:
				if (this.moveDirection != MoveDirection.Left) {
					this.moveDirection = MoveDirection.Left
					this.gameManager.onMoveDirectionChanged(this.moveDirection);
				}
				break;

			case KeyCode.ARROW_RIGHT:
				if (this.moveDirection != MoveDirection.Right) {
					this.moveDirection = MoveDirection.Right
					this.gameManager.onMoveDirectionChanged(this.moveDirection);
				}
				break;

			case KeyCode.ARROW_UP:
				this.gameManager.tetromino.rotateClockwise();
				break;

			case KeyCode.ARROW_DOWN:
				if (this.moveDirection != MoveDirection.Down) {
					this.moveDirection = MoveDirection.Down
					this.gameManager.onMoveDirectionChanged(this.moveDirection);
				}
				break;

			default:
				break;
		}
	}

	private onKeyUp(event: EventKeyboard) {
		switch (event.keyCode) {
			case KeyCode.ARROW_LEFT:
			case KeyCode.ARROW_RIGHT:
			case KeyCode.ARROW_DOWN:
				this.moveDirection = MoveDirection.None;
				this.gameManager.onMoveDirectionChanged(this.moveDirection);
				break;

			default:
				break;
		}
	}

	onDestroy() {
		this.disableInput();
	}
}


