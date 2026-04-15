import * as THREE from 'three';
import { computeLossAt } from './kinematics';
import type { Vec2 } from './types';

const GRID_RES = 40;
const GRID_SIZE = 120;
const ANGLE_RANGE = 2.0;
const LOSS_SCALE = 0.08;
const LOSS_MAX_Y = 100;

export interface LossSceneObjects {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	surfaceGeometry: THREE.BufferGeometry;
	sphere: THREE.Mesh;
}

export function createLossScene(): LossSceneObjects {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xffffff);
	scene.add(new THREE.AmbientLight(0xffffff, 0.6));
	const directional = new THREE.DirectionalLight(0xffffff, 0.4);
	directional.position.set(50, 50, 50);
	scene.add(directional);
	scene.add(new THREE.AxesHelper(GRID_SIZE / 2 + 10));

	const surfaceGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_RES, GRID_RES);
	surfaceGeometry.rotateX(-Math.PI / 2);
	const surfaceMaterial = new THREE.MeshLambertMaterial({
		color: 0xbdc3c7,
		wireframe: true,
		transparent: true,
		opacity: 0.5
	});
	scene.add(new THREE.Mesh(surfaceGeometry, surfaceMaterial));

	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(3, 16, 16),
		new THREE.MeshLambertMaterial({ color: 0x3498db })
	);
	scene.add(sphere);

	const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
	camera.position.set(130, 80, 130);
	camera.lookAt(0, 15, 0);

	return { scene, camera, surfaceGeometry, sphere };
}

/** Update the loss surface mesh and sphere position for the current state. */
export function updateLossScene(
	objects: LossSceneObjects,
	theta1: number,
	theta2: number,
	loss: number,
	L1: number,
	L2: number,
	origin: Vec2,
	target: Vec2
): void {
	const { surfaceGeometry, sphere } = objects;
	const positions = surfaceGeometry.attributes.position.array as Float32Array;

	for (let i = 0; i <= GRID_RES; i++) {
		for (let j = 0; j <= GRID_RES; j++) {
			const t1 = theta1 + (i / GRID_RES - 0.5) * ANGLE_RANGE;
			const t2 = theta2 + (j / GRID_RES - 0.5) * ANGLE_RANGE;
			const lossVal = computeLossAt(t1, t2, L1, L2, origin, target);
			const idx = (i * (GRID_RES + 1) + j) * 3;
			positions[idx] = (i / GRID_RES - 0.5) * GRID_SIZE;
			positions[idx + 2] = (j / GRID_RES - 0.5) * GRID_SIZE;
			positions[idx + 1] = Math.min(lossVal * LOSS_SCALE, LOSS_MAX_Y);
		}
	}
	surfaceGeometry.attributes.position.needsUpdate = true;

	sphere.position.set(0, Math.min(loss * LOSS_SCALE, LOSS_MAX_Y), 0);
}
