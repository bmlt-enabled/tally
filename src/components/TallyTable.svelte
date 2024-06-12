<script lang="ts">
	import { afterUpdate } from 'svelte';
	import { tallyData } from '$lib/store';
	import { TableSort } from '$lib/TableSort';
	import type { Tally, Root } from '$lib/types';

	let tally: Tally;

	tallyData.subscribe((value) => {
		tally = value;
	});

	const tlsEnabled = (url: string): string => {
		return url.startsWith('https') ? 'Y' : 'N';
	};

	const semanticAdminEnabled = (root: Root): string => {
		return JSON.parse(root.server_info).semanticAdmin === '1' ? 'Y' : 'N';
	};

	const googleApiKeyPresent = (root: Root): string => {
		return JSON.parse(root.server_info).google_api_key ? 'Y' : 'N';
	};

	const serverInfo = (root: Root, key: string): string => {
		return JSON.parse(root.server_info)[key];
	};

	const tableRender = () => {
		const tableElement = document.getElementById('tallyHo') as HTMLTableElement;
		if (tableElement) {
			new TableSort(tableElement, { descending: false });
		}
	};

	afterUpdate(async () => {
		tableRender();
	});
</script>

{#if tally.serversCount > 0}
	<table id="tallyHo" class="tallyTable">
		<thead id="tallyHead">
			<tr>
				<th id="tallyName_Header"><span class="link-like">Server Name</span></th>
				<th id="tallySSL_Header"><span class="link-like">SSL<sup>1</sup></span></th>
				<th id="tallySemanticAdmin_Header"><span class="link-like">Admin<sup>2</sup></span></th>
				<th id="tallyGoogleApiKeyPresent_Header"><span class="link-like">GAPI<sup>3</sup></span></th>
				<th id="tallyVersion_Header" data-sort-method="dotsep"><span class="link-like">Version</span></th>
				<th id="tallyZones_Header"><span class="link-like">Zones</span></th>
				<th id="tallyRegion_Header"><span class="link-like">Regions</span></th>
				<th id="tallyArea_Header"><span class="link-like">Areas</span></th>
				<th id="tallyGroups_Header"><span class="link-like">Groups<sup>4</sup></span></th>
				<th id="tallyMeeting_Header" class="selected" data-sort-default><span class="link-like">Meetings</span></th>
			</tr>
		</thead>
		<tbody id="tallyBody">
			{#each tally.filteredRoots as root}
				<tr>
					<td class="tallyName"><a href={root.root_server_url} target="_blank">{root.name}</a> [<a href="{root.root_server_url}/semantic" target="_blank">Explore</a>]</td>
					<td>{tlsEnabled(root.root_server_url)}</td>
					<td>{semanticAdminEnabled(root)}</td>
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
				<td class="tallyName" colspan="5">TOTAL Servers <span id="serversTotal">{tally.serversCount}</span></td>
				<td>{tally.zonesCount}</td>
				<td>{tally.regionsCount}</td>
				<td>{tally.areasCount}</td>
				<td>{tally.groupsCount}</td>
				<td>{tally.meetingsCount}</td>
			</tr>
		</tfoot>
	</table>
{/if}
