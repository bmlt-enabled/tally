<script lang="ts">
	import { currentView, isLoadingData } from '$lib/store';
	import { displayTallyReports, displayTallyTable, displayTallyMap } from '$lib/services';

	const showTallyReports = () => {
		displayTallyReports();
		currentView.set('reports');
	};

	const showTable = () => {
		displayTallyTable();
		currentView.set('default');
	};

	const showTallyMap = () => {
		displayTallyMap();
		currentView.set('map');
	};

	const openMetrics = () => {
		window.open('https://metrics.bmlt.app/', '_blank');
	};
</script>

<div class="tallyButtons">
	{#if $isLoadingData}
		<div id="tallyRootServerDataLoading">
			<img src="images/spinner3.gif" alt="Loading" /> Loading Meeting Details for Map
		</div>
	{/if}
	{#if $currentView === 'default' && !$isLoadingData}
		<input class="tallyButton" id="tallyMapButton" type="button" value="Display Map" on:click={showTallyMap} />
		<input class="tallyButton" id="tallyReportsButton" type="button" value="Reports" on:click={showTallyReports} />
	{/if}
	{#if $currentView === 'default'}
		<input class="tallyButton" id="tallyMetrics" type="button" value="Metrics" on:click={openMetrics} />
	{/if}
	{#if $currentView === 'reports'}
		<input class="tallyButton" id="tallyRootServers" type="button" value="Root Servers" on:click={showTable} />
	{/if}
</div>
