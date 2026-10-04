<script lang="ts">
	import { tallyData } from '$lib/store';
	import { TableSort } from '$lib/TableSort';

	let tableRootServerElement = $state<HTMLTableElement>();
	let tableMeetingVenueReport = $state<HTMLTableElement>();

	let rootServerSort: TableSort | undefined;
	let meetingVenueSort: TableSort | undefined;

	// Data can update while this view is open (extra roots load in the background), so build each
	// sorter once and re-apply the current sort afterwards; re-instantiating would stack header listeners.
	$effect(() => {
		if (tableRootServerElement && $tallyData.reports) {
			if (rootServerSort?.el === tableRootServerElement) {
				rootServerSort.refresh();
			} else {
				rootServerSort = new TableSort(tableRootServerElement, { descending: true });
			}
		}
		if (tableMeetingVenueReport && $tallyData.filteredRoots.length > 0) {
			if (meetingVenueSort?.el === tableMeetingVenueReport) {
				meetingVenueSort.refresh();
			} else {
				meetingVenueSort = new TableSort(tableMeetingVenueReport, { descending: true });
			}
		}
	});
</script>

<table id="tallyRootServerVersionTable" class="tallyTable" bind:this={tableRootServerElement}>
	<thead id="tallyHead">
		<tr>
			<th data-sort-default data-sort-method="dotsep" class="selected"><span class="link-like">Version</span></th>
			<th><span class="link-like">Count</span></th>
		</tr>
	</thead>
	<tbody id="tallyBody">
		{#each Object.entries($tallyData.reports.byRootServerVersions) as [version, count]}
			<tr>
				<td>{version}</td>
				<td>{count}</td>
			</tr>
		{/each}
	</tbody>
</table>

<hr />

<table id="meetingVenueReport" class="tallyTable" bind:this={tableMeetingVenueReport}>
	<thead id="tallyHead">
		<tr>
			<th data-sort-default class="selected"><span class="link-like">Type</span></th>
			<th><span class="link-like">Count</span></th>
		</tr>
	</thead>
	<tbody id="tallyBody">
		<tr>
			<td>virtual</td>
			<td>{$tallyData.filteredRoots.reduce((sum, meeting) => sum + meeting.num_virtual, 0)}</td>
		</tr>
		<tr>
			<td>in_person</td>
			<td>{$tallyData.filteredRoots.reduce((sum, meeting) => sum + meeting.num_in_person, 0)}</td>
		</tr>
		<tr>
			<td>hybrid</td>
			<td>{$tallyData.filteredRoots.reduce((sum, meeting) => sum + meeting.num_hybrid, 0)}</td>
		</tr>
	</tbody>
</table>
