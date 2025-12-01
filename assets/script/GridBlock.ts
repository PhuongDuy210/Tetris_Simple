import { _decorator, Component, Node, Color, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GridBlock')
export class GridBlock extends Component {
	@property(Sprite)
	public fillSprite: Sprite = null!;

	@property
	private occupied: boolean = false;

	@property
	private defaultColor: Color = new Color(255, 255, 255, 255);

	@property
	private fillColor: Color = new Color(128, 128, 128, 255); // standard gray

	public setOccupied() {
		this.occupied = true;
		this.fillSprite.color = this.fillColor;
	}

	public isOccupied() {
		return this.occupied;
	}

	public clear() {
		this.occupied = false;
		this.fillSprite.color = this.defaultColor;
	}
}