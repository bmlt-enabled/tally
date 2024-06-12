<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchTallyData } from './services';
	import TallySummary from '../components/TallySummary.svelte';
	import TallyButtons from '../components/TallyButtons.svelte';
	import TallyTable from '../components/TallyTable.svelte';
	import TallyLegend from '../components/TallyLegend.svelte';
	import '../css/tally.css';

	onMount(async () => {
		await fetchTallyData();
	});
</script>

<div id="tallyBannerContainer">
	<img id="tallyBannerImage" src="images/banner.png" alt="Tally Banner" />
</div>
<div id="tallyMan">
	<TallySummary />
	<TallyButtons />
	<TallyTable />
	<TallyLegend />
</div>
<div id="tallyReports" style="display: none;">
	<TallyButtons />
	<div id="tallyReportsTemplate"></div>
</div>
<div id="tallyMapDiv" style="display: none;">
	<div id="map"></div>
</div>
