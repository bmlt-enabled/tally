<script lang="ts">
	import { tallyData } from '$lib/store';
	import { TableSort } from '$lib/TableSort';
	import type { Root } from '$lib/types';

	const googleApiKeyPresent = (root: Root): string => {
		return JSON.parse(root.server_info).google_api_key ? 'Y' : 'N';
	};

	const serverInfo = (root: Root, key: string): string => {
		return JSON.parse(root.server_info)[key];
	};

	let tableElement = $state<HTMLTableElement>();

	$effect(() => {
		if (tableElement && $tallyData.serversCount > 0) {
			new TableSort(tableElement, { descending: false });
		}
	});
</script>

{#if $tallyData.serversCount > 0}
	<table id="tallyHo" class="tallyTable" bind:this={tableElement}>
		<thead id="tallyHead">
			<tr>
				<th id="tallyName_Header"><span class="link-like">Server Name</span></th>
				<th id="tallyGoogleApiKeyPresent_Header"><span class="link-like">GAPI<sup>1</sup></span></th>
				<th id="tallyVersion_Header" data-sort-method="dotsep"><span class="link-like">Version</span></th>
				<th id="tallyZones_Header"><span class="link-like">Zones</span></th>
				<th id="tallyRegion_Header"><span class="link-like">Regions</span></th>
				<th id="tallyArea_Header"><span class="link-like">Areas</span></th>
				<th id="tallyGroups_Header"><span class="link-like">Groups<sup>2</sup></span></th>
				<th id="tallyMeeting_Header" class="selected" data-sort-default><span class="link-like">Meetings</span></th>
			</tr>
		</thead>
		<tbody id="tallyBody">
			{#each $tallyData.filteredRoots as root}
				<tr>
					<td class="tallyName"><a href={root.root_server_url} target="_blank">{root.name}</a> [<a href="{root.root_server_url}/semantic" target="_blank">Explore</a>]</td>
					<td>{googleApiKeyPresent(root)}</td>
					<td>{serverInfo(root, 'version')}</td>
					<td>{root.num_zones}</td>
					<td>{root.num_regions}</td>
					<td>{root.num_areas}</td>
					<td>{root.num_groups}</td>
					<td>{root.num_total_meetings}</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr class="tallyTotal">
				<td class="tallyName" colspan="3">TOTAL Servers <span id="serversTotal">{$tallyData.serversCount}</span></td>
				<td>{$tallyData.zonesCount}</td>
				<td>{$tallyData.regionsCount}</td>
				<td>{$tallyData.areasCount}</td>
				<td>{$tallyData.groupsCount}</td>
				<td>{$tallyData.meetingsCount}</td>
			</tr>
		</tfoot>
	</table>
{/if}
