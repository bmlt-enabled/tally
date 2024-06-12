<script lang="ts">
	import { tallyData } from '$lib/store';
	import type { Tally } from '$lib/types';

	let tally: Tally;

	tallyData.subscribe((value) => {
		tally = value;
	});

	$: knownTotal = tally.knownTotal;
	$: tallyTotal = tally.meetingsCount;
	$: tallyServiceBodies = tally.serviceBodiesCount;
	$: tallyPctTotal = Math.floor((tallyTotal / knownTotal) * 100);
</script>

<h3>
	<span id="tallyTotal">{tallyTotal}</span> total meetings tallied, across
	<span id="tallyServiceBodies">{tallyServiceBodies}</span> service bodies, which is
	<span id="tallyPctTotal">{tallyPctTotal}</span>% of the
	<span id="tallyKnownTotal">{knownTotal}</span> known meetings in the world.
</h3>
<h4><i>Contact admin@bmlt.app to get listed here.</i></h4>
