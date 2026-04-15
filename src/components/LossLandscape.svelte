<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { createLossScene, updateLossScene, type LossSceneObjects } from '../lib/lossLandscape';
	import type { Vec2 } from '../lib/types';

	interface Props {
		theta1: number;
		theta2: number;
		loss: number;
		L1: number;
		L2: number;
		origin: Vec2;
		target: Vec2;
	}

	let { theta1, theta2, loss, L1, L2, origin, target }: Props = $props();

	let canvas: HTMLCanvasElement;
	let objects: LossSceneObjects;
	let renderer: THREE.WebGLRenderer;
	let isReady = $state(false);

	onMount(() => {
		objects = createLossScene();
		renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
		renderer.setSize(450, 450);
		isReady = true;
		return () => renderer.dispose();
	});

	$effect(() => {
		if (!isReady) return;
		updateLossScene(objects, theta1, theta2, loss, L1, L2, origin, target);
		renderer.render(objects.scene, objects.camera);
	});
</script>

<div class="relative bg-white border border-base-300 rounded-xl shadow-lg overflow-hidden">
	<span
		class="absolute top-2 left-4 bg-white/80 px-2 py-0.5 rounded text-xs font-bold text-base-content/50 pointer-events-none z-10"
	>
		Espace des Poids (Vallée 3D)
	</span>
	<canvas bind:this={canvas} width="450" height="450"></canvas>
</div>
