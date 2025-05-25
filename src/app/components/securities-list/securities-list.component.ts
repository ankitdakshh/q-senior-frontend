import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
} from '@angular/material/table';
import { Observable, BehaviorSubject, map } from 'rxjs';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { indicate } from '../../utils';
import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { FilterableTableComponent } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';
import { SecuritiesFilter } from '../../models/securities-filter';

@Component({
  selector: 'securities-list',
  standalone: true,
  imports: [
    FilterableTableComponent,
    AsyncPipe,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatNoDataRow,
    MatPaginatorModule,
    MatRowDef,
    MatRow,
    MatTableModule,
  ],
  templateUrl: './securities-list.component.html',
  styleUrl: './securities-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritiesListComponent {
  protected displayedColumns: string[] = ['name', 'type', 'currency'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  filterfield: SecuritiesFilter = {
    skip: this.currentPage,
    limit: this.pageSize,
  };
  types: string[] = [];
  currencies: string[] = [];
  private _securityService = inject(SecurityService);
  protected loadingSecurities$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    //We do not have any service which will provide us the list of types, currencies and total number of records.
    this._securityService
      .getSecurities({})
      .pipe(indicate(this.loadingSecurities$))
      .subscribe((securities: Security[]) => {
        this.totalItems = securities.length;
        const types = securities.map((s) => {
          this.currencies.push(s.currency);
          this.types.push(s.type);
        });
      });
  }

  protected securities$: Observable<Security[]> = this._securityService
    .getSecurities(this.filterfield)
    .pipe(indicate(this.loadingSecurities$));

  updateSecurities() {
    //we do not get the total record counts, pagination is not working correctly.
    this.securities$ = this._securityService
      .getSecurities(this.filterfield)
      .pipe(indicate(this.loadingSecurities$));
  }

  onFilterUpdate(filter: SecuritiesFilter) {
    const cleanedFilter = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return true;
        return value !== null && value !== undefined && value !== '';
      })
    );

    //   if (Object.keys(cleanedFilter).length > 0) {
    this.filterfield = {
      ...cleanedFilter,
      skip: this.currentPage,
      limit: this.pageSize,
    };
    // } else {
    //   this.filterfield = {
    //     skip: this.currentPage,
    //     limit: this.pageSize,
    //   };
    // }

    this.updateSecurities();

    console.log(this.filterfield);
  }

  onPageUpdate(page: PageEvent) {
    const start = page.pageIndex * page.pageSize;
    const end = start + page.pageSize;
    this.filterfield = {
      ...this.filterfield,
      skip: start,
      limit: end,
    };
    this.updateSecurities();
  }
}
