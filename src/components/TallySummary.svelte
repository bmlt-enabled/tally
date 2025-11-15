<script lang="ts">
	import { tallyData } from '$lib/store';

	const knownTotal = $derived($tallyData.knownTotal);
	const tallyTotal = $derived($tallyData.meetingsCount);
	const tallyServiceBodies = $derived($tallyData.serviceBodiesCount);
	const tallyPctTotal = $derived(Math.floor((tallyTotal / knownTotal) * 100));
</script>

<h3>
	<span id="tallyTotal">{tallyTotal}</span> total meetings tallied, across
	<span id="tallyServiceBodies">{tallyServiceBodies}</span> service bodies, which is
	<span id="tallyPctTotal">{tallyPctTotal}</span>% of the
	<span id="tallyKnownTotal">{knownTotal}</span> known meetings in the world.
</h3>
<h4><i>Contact admin@bmlt.app to get listed here.</i></h4>
