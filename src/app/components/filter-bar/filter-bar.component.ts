import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface FilterFieldConfig<T, K extends keyof T = keyof T> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'checkbox';
  //options?: T[K] extends (infer U)[] ? U[] : T[K] extends string ? string[] : never;
  options?: string[];
}
@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent<T> implements OnInit {
  @Output() filterChanged = new EventEmitter<Partial<T>>();
  @Input() config: FilterFieldConfig<T>[] = [];
  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    const group: Record<string, any> = {};
    for (const field of this.config) {
      group[field.name as string] = [''];
      if (
        (field.type === 'multi-select' || field.type === 'select') &&
        !field.options
      ) {
        console.warn(
          `No options available "${String(field.name)}" of type "${field.type}"`
        );
      }
    }
    this.filterForm = this.fb.group(group);
    this.config.forEach((field) => {
      const defaultValue =
        field.type === 'multi-select'
          ? []
          : field.type === 'checkbox'
          ? false
          : '';

      this.filterForm.addControl(field.name, this.fb.control(defaultValue));
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((values) => {
        const cleanedValues = Object.entries(values)
          .filter(([_, value]) => {
            if (typeof value === 'string') return value.trim() !== '';
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'boolean') return value === true;
            return value !== null && value !== undefined;
          })
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Partial<typeof values>);
        this.filterChanged.emit(cleanedValues);
      });
  }
}
