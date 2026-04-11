import { tallyData, meetingData, currentView, isLoadingData } from './store';
import type { Tally, AggregatorRoot, Root, Reports, MeetingLocations } from '$lib/types';

const aggregatorUrl: string = 'https://aggregator.bmltenabled.org/main_server';
const concurrentRequests = 4;

export const fetchTallyData = async () => {
	try {
		const aggregatorRootData: AggregatorRoot[] = await getJSON(`${aggregatorUrl}/api/v1/rootservers/`);
		const newState = calculateTallyData(aggregatorRootData);

		tallyData.update((state) => ({
			...state,
			...newState
		}));

		const aggregatorMeetingData = await fetchMeetingData(concurrentRequests, newState);

		meetingData.update(() => aggregatorMeetingData);

		isLoadingData.set(false);
	} catch (error) {
		console.error('Error fetching tally data:', error);
	}
};

const fetchMeetingData = async (concurrentRequests: number, tallyData: Partial<Tally>) => {
	const shardSize = 1000;
	const shards = Math.ceil((tallyData.meetingsCount ?? 35000) / shardSize);
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

const calculateTallyData = (roots: AggregatorRoot[]): Partial<Tally> => {
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

	return {
		meetingsCount,
		groupsCount,
		areasCount,
		regionsCount,
		zonesCount,
		serversCount: roots.length,
		filteredRoots,
		roots,
		serviceBodiesCount: areasCount + regionsCount + zonesCount,
		reports: { byRootServerVersions }
	};
};

const getJSON = async (url: string): Promise<[]> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	return await response.json();
};
