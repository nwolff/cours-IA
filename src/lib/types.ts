export interface Vec2 {
	x: number;
	y: number;
}

export interface ArmConfig {
	L1: number;
	L2: number;
	origin: Vec2;
}

export interface ArmState {
	theta1: number;
	theta2: number;
	v1: number;
	v2: number;
}
