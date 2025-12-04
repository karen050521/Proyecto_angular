import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="issues-list">
      <h2>Incidencias</h2>

      <div class="filters">
        <label>
          Estado:
          <select [(ngModel)]="filterStatus" (change)="load()">
            <option value="">Todos</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </label>

        <label>
          Moto ID:
          <input type="number" [(ngModel)]="filterMotorcycleId" (keyup.enter)="load()" />
        </label>

        <button (click)="create()">Nueva incidencia</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Moto</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Fotos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let issue of issues">
            <td>{{ issue.id }}</td>
            <td>{{ issue.motorcycle_id }}</td>
            <td>{{ issue.issue_type }}</td>
            <td>{{ issue.status }}</td>
            <td>{{ issue.date_reported || issue.created_at }}</td>
            <td>{{ issue.photos?.length ?? 0 }}</td>
            <td>
              <button (click)="open(issue.id)">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .issues-list {
        padding: 16px;
      }
      .filters {
        margin-bottom: 12px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th,
      .table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
    `,
  ],
})
export class IssuesListComponent implements OnInit {
  private issueService = inject(IssueService);
  private router = inject(Router);

  issues: Issue[] = [];
  filterStatus: string = '';
  filterMotorcycleId?: number | null = null;

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('motorcycle_id');
    if (m) this.filterMotorcycleId = Number(m);
    this.load();
  }

  load(): void {
    this.issueService.getAll().subscribe((list) => {
      this.issues = list.filter((i) => {
        if (this.filterStatus && i.status !== this.filterStatus) return false;
        if (this.filterMotorcycleId && i.motorcycle_id !== this.filterMotorcycleId) return false;
        return true;
      });
    });
  }

  open(id: number) {
    this.router.navigate(['/dashboard/admin/issues', id]);
  }

  create() {
    this.router.navigate(['/dashboard/admin/issues/new']);
  }
}
