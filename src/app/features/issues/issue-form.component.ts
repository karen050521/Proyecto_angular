import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Motorcycle } from '../../core/models/motorcycle.model';
import { IssueService } from '../../core/services/issue.service';
import { MotorcycleService } from '../../core/services/motorcycle.service';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="issue-form" *ngIf="form">
      <h2>{{ isEdit ? 'Editar' : 'Nueva' }} incidencia</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Motorcycle
          <select formControlName="motorcycle_id">
            <option [ngValue]="null">Seleccione una moto</option>
            <option *ngFor="let m of motorcycles" [value]="m.id">
              {{ m.id }}
            </option>
          </select>
        </label>

        <label>
          Tipo
          <select formControlName="issue_type">
            <option value="accident">accident</option>
            <option value="breakdown">breakdown</option>
            <option value="maintenance">maintenance</option>
          </select>
        </label>

        <label>
          Descripción
          <textarea formControlName="description"></textarea>
        </label>

        <label>
          Estado
          <select formControlName="status">
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </label>

        <label>
          Fotos
          <input type="file" (change)="onFiles($event)" multiple />
        </label>

        <div class="buttons">
          <button type="submit" [disabled]="form.invalid">
            {{ isEdit ? 'Guardar' : 'Crear' }}
          </button>
          <button type="button" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .issue-form {
        padding: 16px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 600px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .buttons {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
    `,
  ],
})
export class IssueFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private issueService = inject(IssueService);
  private photoService = inject(PhotoService);
  private motorcycleService = inject(MotorcycleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    motorcycle_id: [null, Validators.required],
    description: ['', Validators.required],
    issue_type: ['accident', Validators.required],
    status: ['open', Validators.required],
    date_reported: [null],
  });

  motorcycles: Motorcycle[] = [];
  files: File[] = [];
  isEdit = false;
  editId?: number;

  ngOnInit(): void {
    this.motorcycleService
      .getAll()
      .subscribe((m) => (this.motorcycles = (m as Motorcycle[]) || []));
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.editId = Number(idParam);
      this.issueService.getById(this.editId).subscribe((issue) => {
        this.form.patchValue({
          motorcycle_id: issue.motorcycle_id,
          description: issue.description,
          issue_type: issue.issue_type,
          status: issue.status,
        });
      });
    }
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      this.files = [];
      return;
    }
    this.files = Array.from(input.files as FileList);
  }

  submit() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    if (this.isEdit && this.editId) {
      this.issueService.update(this.editId, payload).subscribe({
        next: () => {
          if (this.files.length) {
            this.uploadFiles(this.editId!);
          } else {
            this.router.navigateByUrl('/dashboard/admin/issues');
          }
        },
        error: () => {},
      });
      return;
    }

    this.issueService.create(payload).subscribe({
      next: (created) => {
        const id = created.id;
        if (this.files.length) {
          this.uploadFiles(id);
        } else {
          this.router.navigateByUrl('/dashboard/admin/issues');
        }
      },
      error: () => {},
    });
  }

  uploadFiles(issueId: number) {
    const uploads = this.files.map((f) => this.photoService.upload(issueId, f));
    let i = 0;
    const next = () => {
      if (i >= uploads.length) {
        this.router.navigateByUrl('/dashboard/admin/issues');
        return;
      }
      uploads[i].subscribe({
        next: () => {
          i++;
          next();
        },
        error: () => {
          i++;
          next();
        },
      });
    };
    if (!uploads.length) {
      this.router.navigateByUrl('/dashboard/admin/issues');
      return;
    }
    next();
  }

  cancel() {
    this.router.navigateByUrl('/dashboard/admin/issues');
  }
}
    