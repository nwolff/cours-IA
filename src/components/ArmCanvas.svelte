<script lang="ts">
	import { onMount } from 'svelte';
	import type { Vec2 } from '../lib/types';

	const CANVAS_SIZE = 450;

	interface Props {
		theta1: number;
		theta2: number;
		L1: number;
		L2: number;
		origin: Vec2;
		target: Vec2;
		ontargetchange: (t: Vec2) => void;
	}

	let { theta1, theta2, L1, L2, origin, target, ontargetchange }: Props = $props();

	let canvas: HTMLCanvasElement;
	let isDragging = $state(false);

	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;

		const x1 = origin.x + L1 * Math.cos(theta1);
		const y1 = origin.y + L1 * Math.sin(theta1);
		const x2 = x1 + L2 * Math.cos(theta1 + theta2);
		const y2 = y1 + L2 * Math.sin(theta1 + theta2);

		ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

		// Grid
		ctx.strokeStyle = '#f1f1f1';
		ctx.lineWidth = 1;
		for (let i = 0; i < CANVAS_SIZE; i += 50) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, CANVAS_SIZE);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(CANVAS_SIZE, i);
			ctx.stroke();
		}

		// Target
		ctx.fillStyle = '#e74c3c';
		ctx.beginPath();
		ctx.arc(target.x, target.y, 14, 0, Math.PI * 2);
		ctx.fill();

		// Arm segments
		ctx.strokeStyle = '#3498db';
		ctx.lineWidth = 12;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(origin.x, origin.y);
		ctx.lineTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();

		// Joints
		ctx.fillStyle = '#2c3e50';
		for (const p of [origin, { x: x1, y: y1 }, { x: x2, y: y2 }]) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
			ctx.fill();
		}
	});

	function getCanvasPos(e: MouseEvent): Vec2 {
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	onMount(() => {
		function onMouseMove(e: MouseEvent) {
			if (isDragging) ontargetchange(getCanvasPos(e));
		}
		function onMouseUp() {
			isDragging = false;
		}
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	});

	function onMouseDown(e: MouseEvent) {
		const pos = getCanvasPos(e);
		if (Math.hypot(pos.x - target.x, pos.y - target.y) < 25) isDragging = true;
	}
</script>

<div class="relative bg-white border border-base-300 rounded-xl shadow-lg overflow-hidden">
	<span
		class="absolute top-2 left-4 bg-white/80 px-2 py-0.5 rounded text-xs font-bold text-base-content/50 pointer-events-none z-10"
	>
		Espace Physique (Bras Robot)
	</span>
	<canvas
		bind:this={canvas}
		width={CANVAS_SIZE}
		height={CANVAS_SIZE}
		class={isDragging ? 'cursor-grabbing block' : 'cursor-grab block'}
		onmousedown={onMouseDown}
	></canvas>
</div>
