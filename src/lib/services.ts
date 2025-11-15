import { tallyData, meetingData, currentView, isLoadingData } from './store';
import { VirtualRoots } from '$lib/VirtualRoots';
import type { Tally, AggregatorRoot, Root, Reports, ServerInfo, ServiceBody, Meeting, MeetingLocations } from '$lib/types';

const aggregatorUrl: string = 'https://aggregator.bmltenabled.org/main_server';
const concurrentRequests = 4;

export const fetchTallyData = async () => {
	try {
		const aggregatorRootData: AggregatorRoot[] = await getJSON(`${aggregatorUrl}/api/v1/rootservers/`);
		const newState = await calculateTallyData(aggregatorRootData);

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

const getVirtualRootsDetails = async (roots: Root[]): Promise<Root[]> => {
	const updatedRoots: Root[] = [];

	for (const root of roots) {
		try {
			const serviceBodies: ServiceBody[] = await getJSON(`${root.root_server_url}client_interface/json/?switcher=GetServiceBodies`);

			const counts = serviceBodies.reduce(
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
				{ regions: 0, areas: 0, zones: 0 }
			);

			const serverInfo: ServerInfo[] = await getJSON(`${root.root_server_url}client_interface/json/?switcher=GetServerInfo`);
			const meetings: Meeting[] = await getJSON(`${root.root_server_url}client_interface/json/?switcher=GetSearchResults&data_field_key=id_bigint,meeting_name`);

			const virtualGroupDistinction: Set<string> = new Set(meetings.map((meeting) => meeting.meeting_name));

			updatedRoots.push({
				root_server_url: root.root_server_url,
				name: root.name,
				num_zones: counts.zones,
				num_regions: counts.regions,
				num_areas: counts.areas,
				num_groups: virtualGroupDistinction.size,
				num_total_meetings: meetings.length,
				num_in_person: root.num_in_person,
				num_virtual: root.num_virtual,
				num_hybrid: root.num_hybrid,
				num_unknown: root.num_unknown,
				server_info: JSON.stringify(serverInfo[0])
			});
		} catch (error) {
			console.error(`Error fetching data for root ${root.id}:`, error);
		}
	}

	return updatedRoots;
};

const calculateTallyData = async (roots: AggregatorRoot[]): Promise<Partial<Tally>> => {
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

	const virtualRoots = await getVirtualRootsDetails(VirtualRoots);

	virtualRoots.forEach((virtualRoot) => {
		virtualRoot.root_server_url = virtualRoot.root_server_url.replace(/\/$/, '');
		const version = JSON.parse(virtualRoot.server_info).version;
		byRootServerVersions[version] = (byRootServerVersions[version] || 0) + 1;
		meetingsCount += virtualRoot.num_total_meetings;
		groupsCount += virtualRoot.num_groups;
		areasCount += virtualRoot.num_areas;
		regionsCount += virtualRoot.num_regions;
		zonesCount += virtualRoot.num_zones;
	});

	filteredRoots.push(...virtualRoots);
	return {
		meetingsCount,
		groupsCount,
		areasCount,
		regionsCount,
		zonesCount,
		serversCount: roots.length + virtualRoots.length,
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
