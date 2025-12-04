import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="issue-detail" *ngIf="issue">
      <h2>Incidencia #{{ issue.id }}</h2>
      <div><strong>Moto ID:</strong> {{ issue.motorcycle_id }}</div>
      <div><strong>Tipo:</strong> {{ issue.issue_type }}</div>
      <div><strong>Descripción:</strong> {{ issue.description }}</div>

      <div>
        <label>
          Estado:
          <select [(ngModel)]="issue.status">
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </label>
        <button (click)="save()">Guardar</button>
      </div>

      <h3>Fotos</h3>
      <div class="photos">
        <div *ngFor="let p of issue.photos" class="thumb">
          <img [src]="p.image_url" alt="foto" />
        </div>
      </div>

      <div class="actions">
        <button (click)="back()">Volver</button>
      </div>
    </div>
  `,
  styles: [
    `
      .issue-detail {
        padding: 16px;
      }
      .photos {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .thumb img {
        width: 120px;
        height: 80px;
        object-fit: cover;
        border: 1px solid #ccc;
      }
    `,
  ],
})
export class IssueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private issueService = inject(IssueService);
  private router = inject(Router);

  issue?: Issue;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.issueService.getById(id).subscribe((i) => (this.issue = i));
    }
  }

  save() {
    if (!this.issue) return;

    const id = this.issue.id; // 👈 esto evita el error de TS
    const payload: Partial<Issue> = { status: this.issue.status };

    this.issueService.update(id, payload).subscribe(() => {
      this.issueService.getById(id).subscribe((i) => (this.issue = i));
    });
  }

  back() {
    this.router.navigateByUrl('/dashboard/admin/issues');
  }
}
