<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchTallyData } from './services';
	import { currentView } from './store';
	import TallySummary from '../components/TallySummary.svelte';
	import TallyButtons from '../components/TallyButtons.svelte';
	import TallyTable from '../components/TallyTable.svelte';
	import TallyLegend from '../components/TallyLegend.svelte';
	import TallyReports from '../components/TallyReports.svelte';
	import TallyMap from '../components/TallyMap.svelte';
	import '../css/tally.css';

	onMount(async () => {
		await fetchTallyData();
	});
</script>

<div id="tallyBannerContainer">
	<img id="tallyBannerImage" src="images/banner.png" alt="Tally Banner" />
</div>

{#if $currentView === 'default'}
	<div id="tallyMan">
		<TallySummary />
		<TallyButtons />
		<TallyTable />
		<TallyLegend />
	</div>
{:else if $currentView === 'reports'}
	<div id="tallyReports">
		<TallyButtons />
		<TallyReports />
	</div>
{:else if $currentView === 'map'}
	<div id="tallyMapDiv">
		<TallyMap />
	</div>
{/if}
