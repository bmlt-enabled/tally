import { writable } from 'svelte/store';
import type { Tally, MeetingLocations } from './types'; // Adjust the import path as necessary

export const initialTally: Tally = {
	knownTotal: 76075,
	meetingsCount: 0,
	groupsCount: 0,
	areasCount: 0,
	regionsCount: 0,
	zonesCount: 0,
	serversCount: 0,
	serviceBodiesCount: 0,
	filteredRoots: [],
	roots: [],
	reports: {
		byRootServerVersions: {
			'3.0.5': 24
		}
	}
};

export const initialMeetingData: MeetingLocations[] = [];
export const tallyData = writable<Tally>(initialTally);
export const meetingData = writable<MeetingLocations[]>(initialMeetingData);
export const currentView = writable('default');
export const isLoadingData = writable(true);
