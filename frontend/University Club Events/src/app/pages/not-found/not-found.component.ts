import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-5 mt-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <h1 class="display-1 fw-bold text-primary">404</h1>
            <h2 class="fw-bold mb-3">الصفحة غير موجودة</h2>
            <p class="text-muted mb-4">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
            <a routerLink="/" class="btn btn-primary">
              <i class="bi bi-house me-2"></i>
              العودة للرئيسية
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class NotFoundComponent {
}

