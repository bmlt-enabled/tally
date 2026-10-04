import { tallyData, meetingData, currentView, isLoadingData } from './store';
import { ExtraRoots, type ExtraRoot } from '$lib/ExtraRoots';
import type { Tally, AggregatorRoot, Root, Reports, ServerInfo, ServiceBody, Meeting, MeetingLocations } from '$lib/types';

const aggregatorUrl: string = 'https://aggregator.bmltenabled.org/main_server';
const concurrentRequests = 4;
const extraRootTimeoutMs = 60000;

export const fetchTallyData = async () => {
	try {
		// Extra roots load in the background so a slow or unreachable server never blocks the aggregator data.
		// getExtraRootsDetails never rejects; a failed root is logged and left out.
		const extraRootsDetailsPromise = getExtraRootsDetails(ExtraRoots);

		const aggregatorRootData: AggregatorRoot[] = await getJSON(`${aggregatorUrl}/api/v1/rootservers/`);

		tallyData.update((state) => ({
			...state,
			...calculateTallyData(aggregatorRootData, [])
		}));

		extraRootsDetailsPromise.then((extraRootsDetails) => {
			if (extraRootsDetails.length === 0) return;
			tallyData.update((state) => ({
				...state,
				...calculateTallyData(
					aggregatorRootData,
					extraRootsDetails.map((details) => details.root)
				)
			}));
		});

		const aggregatorMeetingData = await fetchMeetingData(concurrentRequests, aggregatorMeetingsCount(aggregatorRootData));

		meetingData.update((meetings) => [...meetings, ...aggregatorMeetingData]);

		isLoadingData.set(false);

		extraRootsDetailsPromise.then((extraRootsDetails) => {
			meetingData.update((meetings) => [...meetings, ...extraRootsDetails.flatMap((details) => details.locations)]);
		});
	} catch (error) {
		console.error('Error fetching tally data:', error);
	}
};

const aggregatorMeetingsCount = (roots: AggregatorRoot[]) => roots.reduce((sum, root) => sum + root.statistics.meetings.numTotal, 0);

const fetchMeetingData = async (concurrentRequests: number, meetingsCount: number) => {
	const shardSize = 1000;
	const shards = Math.ceil(meetingsCount / shardSize);
	const results: MeetingLocations[] = [];
	const pages = Array.from({ length: shards }, (_, i) => i + 1);

	const fetchPage = async (page: number) => {
		const response: { longitude: string; latitude: string }[] = await getJSON(
			`${aggregatorUrl}/client_interface/json/?switcher=GetSearchResults&data_field_key=longitude,latitude&page_num=${page}&page_size=${shardSize}`
		);
		const convertedResponse = response.map((location) => ({
			longitude: parseFloat(location.longitude),
			latitude: parseFloat(location.latitude)
		}));
		results.push(...convertedResponse);
	};

	const fetchInBatches = async (pages: number[]) => {
		while (pages.length) {
			await Promise.all(pages.splice(0, concurrentRequests).map(fetchPage));
		}
	};

	await fetchInBatches(pages);
	return results;
};

export const displayTallyReports = () => {
	currentView.set('reports');
};

export const displayTallyTable = () => {
	currentView.set('default');
};

export const displayTallyMap = () => {
	currentView.set('map');
};

const getExtraRootsDetails = async (roots: ExtraRoot[]): Promise<{ root: Root; locations: MeetingLocations[] }[]> => {
	const results = await Promise.all(
		roots.map(async (root) => {
			try {
				const [serviceBodies, serverInfo, meetings] = await Promise.all([
					getJSON(`${root.root_server_url}/client_interface/json/?switcher=GetServiceBodies`, extraRootTimeoutMs) as Promise<ServiceBody[]>,
					getJSON(`${root.root_server_url}/client_interface/json/?switcher=GetServerInfo`, extraRootTimeoutMs) as Promise<ServerInfo[]>,
					getJSON(`${root.root_server_url}/client_interface/json/?switcher=GetSearchResults&data_field_key=id_bigint,meeting_name,venue_type,longitude,latitude`, extraRootTimeoutMs) as Promise<
						Meeting[]
					>
				]);

				const serviceBodyCounts = serviceBodies.reduce(
					(acc, serviceBody) => {
						if (serviceBody.type === 'ZF') {
							acc.zones++;
						} else if (serviceBody.type === 'RS') {
							acc.regions++;
						} else {
							acc.areas++;
						}
						return acc;
					},
					{ zones: 0, regions: 0, areas: 0 }
				);

				// venue_type: 1 = in person, 2 = virtual, 3 = hybrid
				const venueCounts = meetings.reduce(
					(acc, meeting) => {
						if (meeting.venue_type === '1') {
							acc.inPerson++;
						} else if (meeting.venue_type === '2') {
							acc.virtual++;
						} else if (meeting.venue_type === '3') {
							acc.hybrid++;
						} else {
							acc.unknown++;
						}
						return acc;
					},
					{ inPerson: 0, virtual: 0, hybrid: 0, unknown: 0 }
				);

				const locations: MeetingLocations[] = meetings
					.filter((meeting) => meeting.venue_type !== '2')
					.map((meeting) => ({
						longitude: parseFloat(meeting.longitude ?? ''),
						latitude: parseFloat(meeting.latitude ?? '')
					}))
					.filter((location) => !isNaN(location.longitude) && !isNaN(location.latitude));

				return {
					root: {
						root_server_url: root.root_server_url,
						name: root.name,
						num_zones: serviceBodyCounts.zones,
						num_regions: serviceBodyCounts.regions,
						num_areas: serviceBodyCounts.areas,
						num_groups: new Set(meetings.map((meeting) => meeting.meeting_name)).size,
						num_total_meetings: meetings.length,
						num_in_person: venueCounts.inPerson,
						num_virtual: venueCounts.virtual,
						num_hybrid: venueCounts.hybrid,
						num_unknown: venueCounts.unknown,
						server_info: JSON.stringify(serverInfo[0])
					},
					locations
				};
			} catch (error) {
				console.error(`Error fetching data for root ${root.root_server_url}:`, error);
				return null;
			}
		})
	);

	return results.filter((result) => result !== null);
};

const calculateTallyData = (roots: AggregatorRoot[], extraRoots: Root[]): Partial<Tally> => {
	let meetingsCount = 0;
	let groupsCount = 0;
	let areasCount = 0;
	let regionsCount = 0;
	let zonesCount = 0;
	const byRootServerVersions: Reports['byRootServerVersions'] = {};
	const filteredRoots: Root[] = [];

	roots.forEach((root) => {
		root.root_server_url = root.url.replace(/\/$/, '');
		const version = JSON.parse(root.serverInfo).version;
		const stats = root.statistics;

		byRootServerVersions[version] = (byRootServerVersions[version] || 0) + 1;
		meetingsCount += stats.meetings.numTotal;
		groupsCount += stats.serviceBodies.numGroups;
		areasCount += stats.serviceBodies.numAreas;
		regionsCount += stats.serviceBodies.numRegions;
		zonesCount += stats.serviceBodies.numZones;

		filteredRoots.push({
			root_server_url: root.root_server_url,
			name: root.name,
			num_zones: stats.serviceBodies.numZones,
			num_regions: stats.serviceBodies.numRegions,
			num_areas: stats.serviceBodies.numAreas,
			num_groups: stats.serviceBodies.numGroups,
			num_total_meetings: stats.meetings.numTotal,
			num_in_person: stats.meetings.numInPerson,
			num_virtual: stats.meetings.numVirtual,
			num_hybrid: stats.meetings.numHybrid,
			num_unknown: stats.meetings.numUnknown,
			server_info: root.serverInfo
		});
	});

	extraRoots.forEach((root) => {
		const version = JSON.parse(root.server_info).version;
		byRootServerVersions[version] = (byRootServerVersions[version] || 0) + 1;
		meetingsCount += root.num_total_meetings;
		groupsCount += root.num_groups;
		areasCount += root.num_areas;
		regionsCount += root.num_regions;
		zonesCount += root.num_zones;
	});

	filteredRoots.push(...extraRoots);

	return {
		meetingsCount,
		groupsCount,
		areasCount,
		regionsCount,
		zonesCount,
		serversCount: roots.length + extraRoots.length,
		filteredRoots,
		roots,
		serviceBodiesCount: areasCount + regionsCount + zonesCount,
		reports: { byRootServerVersions }
	};
};

const getJSON = async (url: string, timeoutMs?: number): Promise<[]> => {
	const response = await fetch(url, timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : undefined);
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	return await response.json();
};
