<script lang="ts">
	import { afterUpdate } from 'svelte';
	import { tallyData } from '$lib/store';
	import type { Tally } from '$lib/types';
	import { TableSort } from '$lib/TableSort';

	let tally: Tally;

	tallyData.subscribe((value) => {
		tally = value;
	});

	const tableReportSort = () => {
		const tableRootServerElement = document.getElementById('tallyRootServerVersionTable') as HTMLTableElement;
		const tableMeetingVenueReport = document.getElementById('meetingVenueReport') as HTMLTableElement;
		if (tableRootServerElement) {
			new TableSort(tableRootServerElement, { descending: true });
		}
		if (tableMeetingVenueReport) {
			new TableSort(tableMeetingVenueReport, { descending: true });
		}
	};

	afterUpdate(async () => {
		tableReportSort();
	});
</script>

<table id="tallyRootServerVersionTable" class="tallyTable">
	<thead id="tallyHead">
		<tr>
			<th data-sort-default data-sort-method="dotsep" class="selected"><span class="link-like">Version</span></th>
			<th><span class="link-like">Count</span></th>
		</tr>
	</thead>
	<tbody id="tallyBody">
		{#each Object.entries(tally.reports.byRootServerVersions) as [version, count] (version)}
			<tr>
				<td>{version}</td>
				<td>{count}</td>
			</tr>
		{/each}
	</tbody>
</table>

<hr />

<table id="meetingVenueReport" class="tallyTable">
	<thead id="tallyHead">
		<tr>
			<th data-sort-default class="selected"><span class="link-like">Type</span></th>
			<th><span class="link-like">Count</span></th>
		</tr>
	</thead>
	<tbody id="tallyBody">
		<tr>
			<td>virtual</td>
			<td>{tally.filteredRoots.reduce((sum, meeting) => sum + meeting.num_virtual, 0)}</td>
		</tr>
		<tr>
			<td>in_person</td>
			<td>{tally.filteredRoots.reduce((sum, meeting) => sum + meeting.num_in_person, 0)}</td>
		</tr>
		<tr>
			<td>hybrid</td>
			<td>{tally.filteredRoots.reduce((sum, meeting) => sum + meeting.num_hybrid, 0)}</td>
		</tr>
	</tbody>
</table>
