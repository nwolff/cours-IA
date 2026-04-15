import type { Vec2, ArmState } from './types';

const FRICTION = 0.96;
const GRAD_CLIP = 10;

export interface ForwardResult {
	joint: Vec2;
	endEffector: Vec2;
}

export function forwardKinematics(
	theta1: number,
	theta2: number,
	L1: number,
	L2: number,
	origin: Vec2
): ForwardResult {
	const joint: Vec2 = {
		x: origin.x + L1 * Math.cos(theta1),
		y: origin.y + L1 * Math.sin(theta1)
	};
	const endEffector: Vec2 = {
		x: joint.x + L2 * Math.cos(theta1 + theta2),
		y: joint.y + L2 * Math.sin(theta1 + theta2)
	};
	return { joint, endEffector };
}

export function computeLoss(endEffector: Vec2, target: Vec2): number {
	const dx = endEffector.x - target.x;
	const dy = endEffector.y - target.y;
	return 0.5 * (dx * dx + dy * dy);
}

/** Loss at arbitrary angles — used to build the 3D loss surface. */
export function computeLossAt(
	theta1: number,
	theta2: number,
	L1: number,
	L2: number,
	origin: Vec2,
	target: Vec2
): number {
	const { endEffector } = forwardKinematics(theta1, theta2, L1, L2, origin);
	return computeLoss(endEffector, target);
}

/** One gradient-descent step with momentum and gradient clipping. */
export function gradientStep(
	state: ArmState,
	target: Vec2,
	L1: number,
	L2: number,
	origin: Vec2,
	learningRate: number
): ArmState {
	const { theta1, theta2, v1, v2 } = state;

	const { endEffector } = forwardKinematics(theta1, theta2, L1, L2, origin);
	const dx = endEffector.x - target.x;
	const dy = endEffector.y - target.y;

	// Chain rule: ∂L/∂θ
	const dx_dt1 = -L1 * Math.sin(theta1) - L2 * Math.sin(theta1 + theta2);
	const dx_dt2 = -L2 * Math.sin(theta1 + theta2);
	const dy_dt1 = L1 * Math.cos(theta1) + L2 * Math.cos(theta1 + theta2);
	const dy_dt2 = L2 * Math.cos(theta1 + theta2);

	let grad1 = dx * dx_dt1 + dy * dy_dt1;
	let grad2 = dx * dx_dt2 + dy * dy_dt2;

	// Gradient clipping — prevents instability on fast target drags
	const mag = Math.sqrt(grad1 * grad1 + grad2 * grad2);
	if (mag > GRAD_CLIP) {
		grad1 = (grad1 / mag) * GRAD_CLIP;
		grad2 = (grad2 / mag) * GRAD_CLIP;
	}

	const newV1 = v1 * FRICTION - grad1 * learningRate;
	const newV2 = v2 * FRICTION - grad2 * learningRate;

	return {
		theta1: theta1 + newV1,
		theta2: theta2 + newV2,
		v1: newV1,
		v2: newV2
	};
}
