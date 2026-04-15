<script lang="ts">
	interface Props {
		loss: number;
		theta1: number;
		theta2: number;
	}

	let { loss, theta1, theta2 }: Props = $props();
</script>

<div class="stats stats-vertical shadow w-full bg-neutral text-neutral-content h-full">
	<div class="stat">
		<div class="stat-title text-neutral-content/60">DONNÉES EN TEMPS RÉEL</div>
		<div class="stat-value text-error">{Math.round(loss).toLocaleString('fr-FR')}</div>
		<div class="stat-desc text-neutral-content/50">Erreur Actuelle (Loss)</div>
	</div>
	<div class="stat">
		<div class="stat-title text-neutral-content/60">θ₁ — Épaule</div>
		<div class="stat-value text-info text-3xl font-mono">{theta1.toFixed(2)} rad</div>
	</div>
	<div class="stat">
		<div class="stat-title text-neutral-content/60">θ₂ — Coude</div>
		<div class="stat-value text-info text-3xl font-mono">{theta2.toFixed(2)} rad</div>
	</div>
</div>
