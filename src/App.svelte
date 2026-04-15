<script lang="ts">
	import { onMount } from 'svelte';
	import ArmCanvas from './components/ArmCanvas.svelte';
	import LossLandscape from './components/LossLandscape.svelte';
	import LossGraph from './components/LossGraph.svelte';
	import Controls from './components/Controls.svelte';
	import Metrics from './components/Metrics.svelte';
	import About from './components/About.svelte';
	import { gradientStep, forwardKinematics, computeLoss } from './lib/kinematics';
	import type { Vec2 } from './lib/types';

	let modal: HTMLDialogElement;

	const L1 = 120;
	const L2 = 90;
	const ORIGIN: Vec2 = { x: 225, y: 225 };
	const MAX_HISTORY = 200;

	let theta1 = $state(Math.random() * Math.PI);
	let theta2 = $state(Math.random() * Math.PI);
	let v1 = 0;
	let v2 = 0;

	let target = $state<Vec2>({ x: 350, y: 150 });
	let learningRate = $state(0.00025);
	let loss = $state(0);
	let lossHistory = $state<number[]>([]);

	function reset() {
		theta1 = Math.random() * 6;
		theta2 = Math.random() * 6;
		v1 = 0;
		v2 = 0;
		lossHistory = [];
	}

	onMount(() => {
		let animId: number;

		function tick() {
			const next = gradientStep({ theta1, theta2, v1, v2 }, target, L1, L2, ORIGIN, learningRate);
			theta1 = next.theta1;
			theta2 = next.theta2;
			v1 = next.v1;
			v2 = next.v2;

			const { endEffector } = forwardKinematics(theta1, theta2, L1, L2, ORIGIN);
			loss = computeLoss(endEffector, target);

			lossHistory.push(loss);
			if (lossHistory.length > MAX_HISTORY) lossHistory.shift();

			animId = requestAnimationFrame(tick);
		}

		animId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animId);
	});
</script>

<div class="min-h-screen bg-base-200 p-5 flex flex-col items-center gap-5">
	<div class="flex w-full max-w-5xl items-center">
		<h2 class="flex-1 text-2xl font-bold uppercase tracking-widest text-base-content text-center">
			IK vs Backprop : La Vallée du Loss
		</h2>
		<button class="text-base-content/40 hover:text-base-content text-2xl" onclick={() => modal.showModal()} title="À propos">ⓘ</button>
	</div>

	<div class="flex gap-4">
		<ArmCanvas
			{theta1}
			{theta2}
			{L1}
			{L2}
			origin={ORIGIN}
			{target}
			ontargetchange={(t) => (target = t)}
		/>
		<LossLandscape {theta1} {theta2} {loss} {L1} {L2} origin={ORIGIN} {target} />
		<LossGraph {lossHistory} />
	</div>

	<div class="flex gap-5 w-full max-w-5xl">
		<div class="flex-1">
			<Controls {learningRate} onlearningratechange={(lr) => (learningRate = lr)} onreset={reset} />
		</div>
		<div class="flex-1">
			<Metrics {loss} {theta1} {theta2} />
		</div>
	</div>

</div>

<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg mb-4">À propos</h3>
		<About />
		<div class="modal-action">
			<form method="dialog"><button class="btn">Fermer</button></form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
