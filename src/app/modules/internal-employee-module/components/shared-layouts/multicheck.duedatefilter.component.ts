import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CompositeFilterDescriptor, distinct, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { FilterService } from '@progress/kendo-angular-grid';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { FilterModel } from 'src/app/core/models/user.model';

@Component({
    selector: 'multicheck-duedate-filter',
    template: `
        <ul>
            <li *ngIf="showFilter">
                <input class="k-textbox" (input)="onInput($event)" />
            </li>
            <li *ngFor="let item of filterList; let i = index" (click)="onSelectionChange(valueAccessor(item))" [ngClass]="{ 'k-state-selected': isItemSelected(item) }">
                <input type="checkbox" id="chk-{{ valueAccessor(item) }}" class="k-checkbox" [checked]="isItemSelected(item)" />
                <label class="k-multiselect-checkbox k-checkbox-label" for="chk-{{ valueAccessor(item) }}">
                    {{ textAccessor(item) }}
                </label>
            </li>
        </ul>
    `,
    styles: [
        `
            ul {
                list-style-type: none;
                height: 200px;
                overflow-y: scroll;
                padding-left: 0;
                padding-right: 12px;
            }

            ul > li {
                padding: 8px 12px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                border-bottom: none;
            }

            ul > li:last-of-type {
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            }

            .k-multiselect-checkbox {
                pointer-events: none;
            }
        `,
    ],
})
export class MultiCheckDueDateFilterComponent implements AfterViewInit {
    @Input() public isPrimitive: boolean;
    @Input() public currentFilter: CompositeFilterDescriptor;
    @Input() public data;
    @Input() public textField;
    @Input() public valueField;
    @Input() public filterService: FilterService;
    @Input() public field: string;
    @Output() public valueChange = new EventEmitter<number[]>();
    pageContent: any;
    filterList: FilterModel[] = [];
    serviceFilterList: string[] = [];
    public currentData: any;
    public showFilter = true;
    private value: any[] = [];
    public isDisabled: boolean[] = [];
    public elementToDisabled: any[] = [];
    public textAccessor = (dataItem: any) => {
        if (this.isPrimitive) {
            if (dataItem === null) {
                return 'EMPTY';
            } else if (dataItem === '') {
                return 'EMPTY';
            } else {
                return dataItem;
            }
        } else {
            return dataItem[this.textField];
        }
    };
    constructor(public _srvLanguage: InternalUserDetailsService) {}
    public valueAccessor = (dataItem: any) => (this.isPrimitive ? dataItem : dataItem[this.valueField]);

    ngOnInit() {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.translatedFilterList();
    }
    // to tranlsate data to default  language and push to the desired list
    translateEngToDefault(element, listName) {
        const { PastDue, Yesterday, Today, Tomorrow, SevenDays, ForteenDays, ThirtyDays, FortyDays, SixtyDays } = this.pageContent.MultiCheck_FilterKey.Key_Translated;
        if (element === 'Past Due') this[listName].push(PastDue);
        if (element === 'Yesterday') this[listName].push(Yesterday);
        if (element === 'Today') this[listName].push(Today);
        if (element === 'Tomorrow') this[listName].push(Tomorrow);
        if (element === '7-Days') this[listName].push(SevenDays);
        if (element === '14-Days') this[listName].push(ForteenDays);
        if (element === '30-Days') this[listName].push(ThirtyDays);
        if (element === '45-Days') this[listName].push(FortyDays);
        if (element === '60-Days') this[listName].push(SixtyDays);
    }
    // to translate and insert filter list to display list
    translatedFilterList() {
        for (const element of this.data) {
            this.translateEngToDefault(element, 'filterList');
        }
    }
    // to insert already checked filter back in value list
    translateCurrentFilter() {
        this.currentFilter.filters.forEach((obj: FilterDescriptor) => {
            this.translateEngToDefault(obj.value, 'value');
        });
    }
    translateResultToEng() {
        const { PastDue, Yesterday, Today, Tomorrow, SevenDays, ForteenDays, ThirtyDays, FortyDays, SixtyDays } = this.pageContent.MultiCheck_FilterKey.Key_Translated;
        this.serviceFilterList = [];
        for (const element of this.value) {
            if (element === PastDue) this.serviceFilterList.push('Past Due');
            if (element === Yesterday) this.serviceFilterList.push('Yesterday');
            if (element === Today) this.serviceFilterList.push('Today');
            if (element === Tomorrow) this.serviceFilterList.push('Tomorrow');
            if (element === SevenDays) this.serviceFilterList.push('7-Days');
            if (element === ForteenDays) this.serviceFilterList.push('14-Days');
            if (element === ThirtyDays) this.serviceFilterList.push('30-Days');
            if (element === FortyDays) this.serviceFilterList.push('45-Days');
            if (element === SixtyDays) this.serviceFilterList.push('60-Days');
        }
    }

    public ngAfterViewInit() {
        let isPresent: boolean = false;
        this.filterList = this.filterList.filter((res) => res !== null).sort();

        const { SevenDays } = this.pageContent.MultiCheck_FilterKey.Key_Translated;

        //removed 7days from the sorted array to put back at the start
        for (let i = 0; i < this.data.length; i++) {
            if (this.filterList[i] === SevenDays) {
                this.filterList.splice(i, 1);
                isPresent = true;
            }
        }
        this.filterList = isPresent ? [SevenDays, ...this.filterList] : this.filterList;
        this.currentData = this.filterList; //isPresent ? ['7-Days', ...this.data] : this.data;
        // this.value = this.currentFilter.filters.map((f: FilterDescriptor) => f.value);
        this.translateCurrentFilter();

        this.showFilter = typeof this.textAccessor(this.currentData[0]) === 'string';
    }
    public isItemSelected(item) {
        return this.value.some((x) => x === this.valueAccessor(item));
    }

    public onSelectionChange(item) {
        const { PastDue, Yesterday, Today, Tomorrow, SevenDays, ForteenDays, ThirtyDays, FortyDays, SixtyDays } = this.pageContent.MultiCheck_FilterKey.Key_Translated;
        let arr = [];
        if (item === SixtyDays) {
            arr = [SixtyDays, FortyDays, ThirtyDays, ForteenDays, SevenDays, Tomorrow, Today, Yesterday, PastDue];
        }
        if (item === FortyDays) {
            arr = [FortyDays, ThirtyDays, ForteenDays, SevenDays, Tomorrow, Today, Yesterday, PastDue];
        }
        if (item === ThirtyDays) {
            arr = [ThirtyDays, ForteenDays, SevenDays, Tomorrow, Today, Yesterday, PastDue];
        }
        if (item === ForteenDays) {
            arr = [ForteenDays, SevenDays, Tomorrow, Today, Yesterday, PastDue];
        }
        if (item === SevenDays) {
            arr = [SevenDays, Tomorrow, Today, Yesterday, PastDue];
        }
        if (item === PastDue) {
            arr = [PastDue, Yesterday];
        }
        if (this.value.some((x) => x === item)) {
            if (
                item === SixtyDays ||
                item === FortyDays ||
                item === ThirtyDays ||
                item === ForteenDays ||
                item === SevenDays ||
                item === Yesterday ||
                item === Today ||
                item === Tomorrow ||
                item === PastDue
            ) {
                if (this.value.includes(SixtyDays) || this.value.includes(ThirtyDays) || this.value.includes(ForteenDays) || this.value.includes(SevenDays)) {
                    this.value = [];
                } else {
                    this.value = this.value.filter((x) => x !== item);
                }
            } else {
                this.value = this.value.filter((x) => x !== item);
            }
        } else {
            if (item === SixtyDays) {
                arr.map((res) => this.value.push(res));
            } else if (item === FortyDays) {
                arr.map((res) => this.value.push(res));
            } else if (item === ThirtyDays) {
                arr.map((res) => this.value.push(res));
            } else if (item === ForteenDays) {
                arr.map((res) => this.value.push(res));
            } else if (item === SevenDays) {
                arr.map((res) => this.value.push(res));
            } else if (item === PastDue) {
                arr.map((res) => this.value.push(res));
            } else {
                this.value.push(item);
            }
        }
        this.serviceFilterList = [];
        this.translateResultToEng();
        this.filterService.filter({
            filters: this.serviceFilterList.map((value) => ({
                field: this.field,
                operator: this.getOperator(value),
                value,
            })),
            logic: 'or',
        });
    }

    public onInput(e: any) {
        this.filterList = distinct(
            [
                ...this.filterList.filter((dataItem) => this.value.some((val) => val === this.valueAccessor(dataItem))),
                ...filterBy(this.currentData, {
                    operator: 'contains',
                    field: this.textField,
                    value: e.target.value,
                }),
            ],
            this.textField
        );
    }

    private getOperator(value) {
        const options = {
            null: 'isnull',
            '': 'isempty',
        };
        return options[value] || 'eq';
    }
}
