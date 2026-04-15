<script lang="ts">
	interface Props {
		learningRate: number;
		onlearningratechange: (lr: number) => void;
		onreset: () => void;
	}

	let { learningRate, onlearningratechange, onreset }: Props = $props();
</script>

<div class="card bg-base-100 shadow p-6 flex flex-col gap-4">
	<div class="form-control w-full">
		<label class="label" for="lr-slider">
			<span class="label-text font-bold">Vitesse d'apprentissage (LR)</span>
			<span class="label-text-alt font-mono font-bold text-info">{learningRate.toFixed(5)}</span>
		</label>
		<input
			id="lr-slider"
			type="range"
			min="0.00001"
			max="0.00080"
			step="0.00001"
			value={learningRate}
			class="range range-primary"
			oninput={(e) => onlearningratechange(parseFloat((e.target as HTMLInputElement).value))}
		/>
	</div>
	<p class="text-sm text-base-content/60 italic">
		Le sol du graphique 3D représente le Loss = 0. La sphère bleue cherche à atteindre ce niveau.
	</p>
	<button class="btn btn-error w-full" onclick={onreset}> Réinitialiser les Angles </button>
</div>
