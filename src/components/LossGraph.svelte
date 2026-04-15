<script lang="ts">
	const CANVAS_W = 250;
	const CANVAS_H = 450;
	const MAX_HISTORY = 200;

	interface Props {
		lossHistory: number[];
	}

	let { lossHistory }: Props = $props();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
		if (lossHistory.length < 2) return;

		const maxL = Math.max(...lossHistory, 1000);
		ctx.strokeStyle = '#e74c3c';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		lossHistory.forEach((v, i) => {
			const x = (i / MAX_HISTORY) * CANVAS_W;
			const y = CANVAS_H - (v / maxL) * 410;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();
	});
</script>

<div class="relative bg-base-50 border border-base-300 rounded-xl shadow-lg overflow-hidden">
	<span
		class="absolute top-2 left-4 bg-white/80 px-2 py-0.5 rounded text-xs font-bold text-base-content/50 pointer-events-none z-10"
	>
		Historique d'Apprentissage
	</span>
	<canvas bind:this={canvas} width={CANVAS_W} height={CANVAS_H} class="block"></canvas>
</div>
