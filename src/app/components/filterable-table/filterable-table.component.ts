import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  FilterBarComponent,
  FilterFieldConfig,
} from '../filter-bar/filter-bar.component';
import { SecuritiesFilter } from '../../models/securities-filter';

@Component({
  selector: 'filterable-table',
  standalone: true,
  imports: [FilterBarComponent, MatProgressSpinner, MatTable],
  templateUrl: './filterable-table.component.html',
  styleUrl: './filterable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterableTableComponent<T> implements AfterContentInit {
  @ContentChildren(MatHeaderRowDef) headerRowDefs?: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs?: QueryList<MatRowDef<T>>;
  @ContentChildren(MatColumnDef) columnDefs?: QueryList<MatColumnDef>;
  @ContentChild(MatNoDataRow) noDataRow?: MatNoDataRow;

  @ViewChild(MatTable, { static: true }) table?: MatTable<T>;

  @Input() columns: string[] = [];

  @Input() dataSource:
    | readonly T[]
    | DataSource<T>
    | Observable<readonly T[]>
    | null = null;
  @Input() isLoading: boolean | null = false;
  @Input() types: string[] = [];
  @Input() currencies: string[] = [];
  config: FilterFieldConfig<SecuritiesFilter>[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'types', label: 'Types', type: 'multi-select' },
    {
      name: 'currencies',
      label: 'Currencies',
      type: 'multi-select',
      options: this.currencies,
    },
    {
      name: 'isPrivate',
      label: 'Private',
      type: 'checkbox',
      options: this.types,
    },
  ];

  @Output() filtered = new EventEmitter<SecuritiesFilter>();

  public ngAfterContentInit(): void {
    this.columnDefs?.forEach((columnDef) =>
      this.table?.addColumnDef(columnDef)
    );
    this.rowDefs?.forEach((rowDef) => this.table?.addRowDef(rowDef));
    this.headerRowDefs?.forEach((headerRowDef) =>
      this.table?.addHeaderRowDef(headerRowDef)
    );
    this.table?.setNoDataRow(this.noDataRow ?? null);
  }

  onFilterUpdate(filterValues: Partial<SecuritiesFilter>) {
    this.filtered.emit(filterValues);
  }

  ngOnChanges() {
    this.config = [
      { name: 'name', label: 'Name', type: 'text' },
      {
        name: 'types',
        label: 'Types',
        type: 'multi-select',
        options: this.types!,
      },
      {
        name: 'currencies',
        label: 'Currencies',
        type: 'multi-select',
        options: this.currencies!,
      },
      {
        name: 'isPrivate',
        label: 'Private',
        type: 'checkbox',
      },
    ];
  }
}
