//  http://tristen.ca/tablesort/demo/
type CompareFn = (a: string, b: string) => number;

const sortOptions: {
	name: string;
	pattern?: (s: string) => boolean;
	sort: CompareFn;
}[] = [
	{
		name: 'number',
		sort: (a: string, b: string) => {
			let aa = parseFloat(a);
			let bb = parseFloat(b);
			aa = isNaN(aa) ? 0 : aa;
			bb = isNaN(bb) ? 0 : bb;
			return aa - bb;
		}
	}
];

const createEvent = (name: string): CustomEvent => {
	return new CustomEvent(name);
};

const getInnerText = (el: HTMLTableHeaderCellElement): string => {
	return el.getAttribute('data-sort') || el.textContent || el.innerText || '';
};

const caseInsensitiveSort: CompareFn = (a, b) => {
	a = a.trim().toLowerCase();
	b = b.trim().toLowerCase();

	if (a === b) return 0;
	if (a < b) return 1;

	return -1;
};

const getCellByKey = (cells: HTMLCollectionOf<HTMLTableDataCellElement | HTMLTableHeaderCellElement>, key: string) => {
	return Array.from(cells).find((cell) => cell.getAttribute('data-sort-column-key') === key);
};

const stabilize = (sort: CompareFn, antiStabilize: boolean) => {
	return (a: { td: string; index: number }, b: { td: string; index: number }) => {
		const unstableResult = sort(a.td, b.td);

		if (unstableResult === 0) {
			return antiStabilize ? b.index - a.index : a.index - b.index;
		}

		return unstableResult;
	};
};

interface Obj {
	tr: HTMLTableRowElement;
	td: string;
	index: number;
}

class TableSort {
	private current?: HTMLTableCellElement;
	private readonly defaultSort?: HTMLTableCellElement;

	constructor(
		public el: HTMLTableElement,
		public options: { descending?: boolean } = {}
	) {
		let firstRow: HTMLTableRowElement | undefined;

		if (el.rows.length > 0) {
			if (el.tHead && el.tHead.rows && el.tHead.rows.length > 0) {
				firstRow = Array.from(el.tHead.rows).find((row) => row.getAttribute('data-sort-method') === 'thead') || el.tHead.rows[el.tHead.rows.length - 1];
			} else {
				firstRow = el.rows[0];
			}
		}

		if (!firstRow) {
			return;
		}

		for (const cell of firstRow.cells) {
			cell.setAttribute('role', 'columnheader');
			if (cell.getAttribute('data-sort-method') !== 'none') {
				cell.tabIndex = 0;
				cell.addEventListener(
					'click',
					() => {
						if (this.current && this.current !== cell) {
							this.current.removeAttribute('aria-sort');
						}
						this.current = cell;
						this.sortTable(cell);
					},
					false
				);

				if (cell.getAttribute('data-sort-default') !== null) {
					this.defaultSort = cell;
				}
			}
		}

		if (this.defaultSort) {
			this.current = this.defaultSort;
			this.sortTable(this.defaultSort);
		}
	}

	static extend(name: string, pattern: (s: string) => boolean, sort: CompareFn) {
		if (typeof pattern !== 'function' || typeof sort !== 'function') {
			throw new Error('Pattern and sort must be functions');
		}
		sortOptions.push({ name, pattern, sort });
	}

	hasThead(): boolean {
		return (this.el.tHead?.rows.length ?? 0) > 0;
	}

	sortTable(header: HTMLTableHeaderCellElement, update = false) {
		const columnKey = header.getAttribute('data-sort-column-key');
		const column = header.cellIndex;
		let sortFunction = caseInsensitiveSort;
		const items: string[] = [];
		const sortMethod = header.getAttribute('data-sort-method');
		let sortOrder = header.getAttribute('aria-sort');

		this.el.dispatchEvent(createEvent('beforeSort'));

		if (!update) {
			sortOrder = sortOrder === 'ascending' ? 'descending' : sortOrder === 'descending' ? 'ascending' : this.options.descending ? 'descending' : 'ascending';
			header.setAttribute('aria-sort', sortOrder);
		}

		if (this.el.rows.length < 2) {
			return;
		}

		if (!sortMethod) {
			let i = this.hasThead() ? 0 : 1;
			while (items.length < 3 && i < this.el.tBodies[0].rows.length) {
				const cell = columnKey ? getCellByKey(this.el.tBodies[0].rows[i].cells, columnKey) : this.el.tBodies[0].rows[i].cells[column];
				let item = cell ? getInnerText(cell) : '';
				item = item.trim();

				if (item.length > 0) {
					items.push(item);
				}

				i++;
			}

			if (!items) {
				return;
			}
		}

		for (const item of sortOptions) {
			if (sortMethod) {
				if (item.name === sortMethod) {
					sortFunction = item.sort;
					break;
				}
			} else if (item.pattern && items.every(item.pattern)) {
				sortFunction = item.sort;
				break;
			}
		}
		for (const tBody of this.el.tBodies) {
			const newRows: Obj[] = [];
			const noSorts: HTMLTableRowElement[] = [];
			let totalRows = 0;
			let noSortsSoFar = 0;

			if (tBody.rows.length < 2) {
				continue;
			}

			for (const row of tBody.rows) {
				if (row.getAttribute('data-sort-method') === 'none') {
					noSorts[totalRows] = row;
				} else {
					const cell = columnKey ? getCellByKey(row.cells, columnKey) : row.cells[column];
					newRows.push({
						tr: row,
						td: cell ? getInnerText(cell) : '',
						index: totalRows
					});
				}
				totalRows++;
			}

			if (sortOrder === 'descending') {
				newRows.sort(stabilize(sortFunction, true));
			} else {
				newRows.sort(stabilize(sortFunction, false));
				newRows.reverse();
			}

			for (let j = 0; j < totalRows; j++) {
				let item: HTMLTableRowElement;
				if (noSorts[j]) {
					item = noSorts[j];
					noSortsSoFar++;
				} else {
					item = newRows[j - noSortsSoFar].tr;
				}

				tBody.appendChild(item);
			}
		}

		this.el.dispatchEvent(createEvent('afterSort'));
	}

	refresh() {
		if (this.current !== undefined) {
			this.sortTable(this.current, true);
		}
	}
}

// Add custom sort methods here
(() => {
	const cleanNumber = (i: string) => i.replace(/[^\-?0-9.]/g, '');

	const compareNumber = (a: string, b: string) => {
		const numA = parseFloat(a);
		const numB = parseFloat(b);

		return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
	};

	TableSort.extend(
		'number',
		(item) =>
			/^[-+]?[£\x24Û¢´€]?\d+\s*([,.]\d{0,2})/.test(item) || // Prefixed currency
			/^[-+]?\d+\s*([,.]\d{0,2})?[£\x24Û¢´€]/.test(item) || // Suffixed currency
			/^[-+]?(\d)*-?([,.])?-?(\d)+([E,e][-+]\d+)?%?$/.test(item), // Number
		(a, b) => compareNumber(cleanNumber(a), cleanNumber(b))
	);

	TableSort.extend(
		'dotsep',
		(item) => /^(\d+\.)+\d+$/.test(item),
		(a, b) => {
			const partsA = a.split('.').map(Number);
			const partsB = b.split('.').map(Number);

			for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
				if ((partsA[i] || 0) !== (partsB[i] || 0)) {
					return (partsA[i] || 0) - (partsB[i] || 0);
				}
			}
			return 0;
		}
	);

	const parseDate = (date: string): number => {
		date = date.replace(/-/g, '/');
		date = date.replace(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/, '$3-$2-$1'); // format before getTime

		return new Date(date).getTime() || -1;
	};

	TableSort.extend(
		'date',
		(item) =>
			(item.search(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?,?\s*/i) !== -1 ||
				item.search(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/) !== -1 ||
				item.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) !== -1) &&
			!isNaN(parseDate(item)),
		(a, b) => {
			const dateA = parseDate(a.toLowerCase());
			const dateB = parseDate(b.toLowerCase());

			return dateB - dateA;
		}
	);

	TableSort.extend(
		'monthname',
		(item) => /(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(item),
		(a, b) => {
			const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return monthNames.indexOf(b) - monthNames.indexOf(a);
		}
	);
})();

export { TableSort };
