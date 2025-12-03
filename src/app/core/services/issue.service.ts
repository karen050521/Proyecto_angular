import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Issue } from '../models/issue.model';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/issues`;

  getAll(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.base);
  }

  getById(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.base}/${id}`);
  }

  create(issue: Omit<Issue, 'id' | 'created_at'>): Observable<Issue> {
    return this.http.post<Issue>(this.base, issue);
  }

  update(id: number, issue: Partial<Issue>): Observable<Issue> {
    return this.http.put<Issue>(`${this.base}/${id}`, issue);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
